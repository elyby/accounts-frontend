import React, { CSSProperties, MouseEventHandler, ReactElement, ReactNode } from 'react';

import { User } from 'app/components/user';
import { connect } from 'app/functions';
import { TransitionMotion, spring, PlainStyle, Style, TransitionStyle, TransitionPlainStyle } from 'react-motion';
import { Panel, PanelBody, PanelFooter, PanelHeader } from 'app/components/ui/Panel';
import { Form } from 'app/components/ui/form';
import MeasureHeight from 'app/components/MeasureHeight';
import panelStyles from 'app/components/ui/panel.scss';
import icons from 'app/components/ui/icons.scss';
import authFlow from 'app/services/authFlow';

import AuthError from './authError/AuthError';
import { Provider as AuthContextProvider } from './Context';
import { getLogin, State as AuthState } from './reducer';
import * as actions from './actions';
import helpLinks from './helpLinks.scss';

const opacitySpringConfig = { stiffness: 300, damping: 20 };
const transformSpringConfig = { stiffness: 500, damping: 50, precision: 0.5 };
const changeContextSpringConfig = {
    stiffness: 500,
    damping: 20,
    precision: 0.5,
};

const { helpLinks: helpLinksStyles } = helpLinks;

const fieldsetStyles: CSSProperties = { border: 0, padding: 0, margin: 0, minWidth: 0 };

// The body's paddings are a part of its height. They're kept while the body's height is collapsed
// during the transition between contexts, as if they were the panel's static paddings
const bodyContentVerticalPadding = parseFloat(panelStyles.bodyContentVerticalPadding) || 0;

type PanelId = string;

/**
 * Definition of relation between contexts and panels
 *
 * Each sub-array is context. Each sub-array item is panel
 *
 * This definition declares animations between panels:
 * - The animation between panels from different contexts will be along Y axe (height toggling)
 * - The animation between panels from the same context will be along X axe (sliding)
 * - Panel index defines the direction of X transition of both panels
 * (e.g. the panel with lower index will slide from left side, and with greater from right side)
 */
const contexts: Array<Array<PanelId>> = [
    ['login', 'password', 'forgotPassword', 'mfa', 'recoverPassword'],
    ['register', 'activation', 'resendActivation'],
    ['acceptRules'],
    ['chooseAccount', 'permissions'],
];

// eslint-disable-next-line
if (process.env.NODE_ENV !== 'production') {
    // test panel uniquenes between contexts
    // TODO: it may be moved to tests in future

    contexts.reduce((acc, context) => {
        context.forEach((panel) => {
            if (acc[panel]) {
                throw new Error(`Panel ${panel} is already exists in context ${JSON.stringify(acc[panel])}`);
            }

            acc[panel] = context;
        });

        return acc;
    }, {} as Record<string, Array<PanelId>>);
}

type ValidationError =
    | string
    | {
          type: string;
          payload: Record<string, any>;
      };

interface AnimationStyle extends PlainStyle {
    opacitySpring: number;
    transformSpring: number;
}

interface AnimationData {
    Title: ReactElement;
    Body: ReactElement;
    Footer: ReactElement;
    Links: ReactNode;
    hasBackButton: boolean | ((props: Props) => boolean);
    /**
     * The error of the panel. It's passed through the transition's data, so the leaving panel keeps
     * the error, which was displayed at the moment of the panel change
     */
    error: AuthState['error'];
}

interface OwnProps {
    Title: ReactElement;
    Body: ReactElement;
    Footer: ReactElement;
    Links?: ReactNode;
    className?: string;
}

interface Props extends OwnProps {
    // context props
    auth: AuthState;
    user: User;
    clearErrors: () => void;
    resolve: () => void;
    reject: () => void;

    setErrors: (errors: Record<string, ValidationError>) => void;
}

interface State {
    contextHeight: number;
    panelId: PanelId | void;
    prevPanelId: PanelId | void;
    forceHeight: 1 | 0;
    direction: 'X' | 'Y';
    /**
     * The heights of the panels' content without the error
     */
    formsHeights: Record<PanelId, number>;
    /**
     * The error, which is displayed in the body. It's kept after the error is cleared in props
     * until the height animation hides it (see isErrorHiding())
     */
    displayedError: AuthState['error'];
    /**
     * The height of the displayed error (null until it's measured)
     */
    errorHeight: number | null;
}

// TODO: completely broken for RTL languages
class PanelTransition extends React.PureComponent<Props, State> {
    state: State = {
        contextHeight: 0,
        panelId: this.props.Body && (this.props.Body.type as any).panelId,
        forceHeight: 0 as const,
        direction: 'X' as const,
        prevPanelId: undefined,
        formsHeights: {},
        displayedError: null,
        errorHeight: null,
    };

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
        const { error } = props.auth;

        if (Object.keys(error || {}).length > 0) {
            if (!state.displayedError) {
                // The error appears
                return {
                    displayedError: error,
                    errorHeight: null,
                };
            }

            if (error !== state.displayedError) {
                // Another error came, possibly while the previous one was being hidden
                return {
                    displayedError: error,
                };
            }

            return null;
        }

        // The error is cleared. Keep displaying it until the height animation hides it.
        // If the error hasn't been measured yet, it hasn't affected the panel's height, so it just disappears.
        // On a panel change the error is reset in componentDidUpdate()
        if (!state.displayedError || state.errorHeight !== null) {
            return null;
        }

        return {
            displayedError: null,
        };
    }

    /**
     * The displayed error has already been cleared in props and is being hidden by the height animation
     */
    static isErrorHiding(props: Props, state: State): boolean {
        return state.displayedError !== null && state.displayedError !== props.auth.error;
    }

    isHeightMeasured: boolean = false;
    hideErrorReleaseId: number | null = null;
    wasAutoFocused: boolean = false;
    body: {
        autoFocus: () => void;
        onFormSubmit: () => void;
    } | null = null;

    timerIds: Array<number> = []; // this is a list of a probably running timeouts to clean on unmount

    componentDidUpdate(prevProps: Props) {
        const nextPanel: PanelId = this.props.Body && (this.props.Body.type as any).panelId;
        const prevPanel: PanelId = prevProps.Body && (prevProps.Body.type as any).panelId;

        if (nextPanel !== prevPanel) {
            const direction = this.getDirection(nextPanel, prevPanel);
            const forceHeight = direction === 'Y' && nextPanel !== prevPanel ? 1 : 0;

            this.props.clearErrors();

            this.setState({
                direction,
                panelId: nextPanel,
                prevPanelId: prevPanel,
                forceHeight,
                // The errors are cleared on a panel change, so the error must just disappear without the animation
                displayedError: null,
                errorHeight: null,
            });

            if (forceHeight) {
                this.timerIds.push(
                    window.setTimeout(() => {
                        this.setState({ forceHeight: 0 });
                    }, 100),
                );
            }
        }
    }

    componentWillUnmount() {
        this.timerIds.forEach((id) => clearTimeout(id));
        this.timerIds = [];

        if (this.hideErrorReleaseId !== null) {
            cancelAnimationFrame(this.hideErrorReleaseId);
        }
    }

    render() {
        const { contextHeight, forceHeight } = this.state;

        const { Title, Body, Footer, Links, auth, user, clearErrors, resolve, reject } = this.props;

        if (this.props.children) {
            return this.props.children;
        }

        const {
            panelId,
            hasGoBack,
        }: {
            panelId: PanelId;
            hasGoBack: boolean;
        } = Body.type as any;

        const formHeight = (this.state.formsHeights[panelId] || 0) + this.getDisplayedErrorHeight();

        // a hack to disable height animation on first render
        const { isHeightMeasured } = this;
        this.isHeightMeasured = isHeightMeasured || formHeight > 0;

        return (
            <AuthContextProvider
                value={{
                    auth,
                    user,
                    clearErrors,
                    resolve,
                    reject,
                }}
            >
                <TransitionMotion
                    styles={[
                        {
                            key: panelId,
                            data: {
                                Title,
                                Body,
                                Footer,
                                Links,
                                hasBackButton: hasGoBack,
                                error: this.getPanelError(panelId),
                            },
                            style: {
                                transformSpring: spring(0, transformSpringConfig),
                                opacitySpring: spring(1, opacitySpringConfig),
                            },
                        },
                        {
                            key: 'common',
                            style: {
                                heightSpring: isHeightMeasured
                                    ? spring(
                                          forceHeight ? forceHeight + bodyContentVerticalPadding : formHeight,
                                          transformSpringConfig,
                                      )
                                    : formHeight,
                                switchContextHeightSpring: spring(
                                    forceHeight || contextHeight,
                                    changeContextSpringConfig,
                                ),
                            },
                        },
                    ]}
                    willEnter={this.willEnter}
                    willLeave={this.willLeave}
                >
                    {(items) => {
                        const panels = items.filter(({ key }) => key !== 'common');
                        const [common] = items.filter(({ key }) => key === 'common');

                        const contentHeight = {
                            overflow: 'hidden',
                            height: forceHeight ? common.style.switchContextHeightSpring : 'auto',
                        };

                        this.tryToAutoFocus(panels.length);
                        this.releaseHiddenError(common.style.heightSpring, panelId);

                        const bodyHeight: CSSProperties = {
                            position: 'relative',
                            height: `${common.style.heightSpring}px`,
                        };

                        return (
                            <Form
                                id={panelId}
                                onSubmit={this.onFormSubmit}
                                onInvalid={this.onFormInvalid}
                                isLoading={this.props.auth.isLoading}
                                className={this.props.className}
                            >
                                <Panel>
                                    <PanelHeader>{panels.map((config) => this.getHeader(config))}</PanelHeader>
                                    <div style={contentHeight}>
                                        <MeasureHeight onMeasure={this.onUpdateContextHeight}>
                                            <PanelBody>
                                                <div style={bodyHeight}>
                                                    {panels.map((config) => this.getBody(config, panels.length > 1))}
                                                </div>
                                            </PanelBody>
                                            <PanelFooter>{panels.map((config) => this.getFooter(config))}</PanelFooter>
                                        </MeasureHeight>
                                    </div>
                                </Panel>
                                <div className={helpLinksStyles}>
                                    {panels.map((config) => this.getLinks(config))}
                                </div>
                            </Form>
                        );
                    }}
                </TransitionMotion>
            </AuthContextProvider>
        );
    }

    onFormSubmit = (): void => {
        this.props.clearErrors();
        this.body?.onFormSubmit();
    };

    onFormInvalid = (errors: Record<string, ValidationError>): void => this.props.setErrors(errors);

    willEnter = (config: TransitionStyle): PlainStyle => {
        const transform = this.getTransformForPanel(config.key);

        return {
            transformSpring: transform,
            opacitySpring: 1,
        };
    };

    willLeave = (config: TransitionStyle): Style => {
        const transform = this.getTransformForPanel(config.key);

        return {
            transformSpring: spring(transform, transformSpringConfig),
            opacitySpring: spring(0, opacitySpringConfig),
        };
    };

    getTransformForPanel(key: PanelId): number {
        const { panelId, prevPanelId } = this.state;

        const fromLeft = -1;
        const fromRight = 1;

        const currentContext = contexts.find((context) => context.includes(key));

        if (!currentContext) {
            throw new Error(`Can not find settings for ${key} panel`);
        }

        let sign =
            prevPanelId && panelId && currentContext.indexOf(panelId) > currentContext.indexOf(prevPanelId)
                ? fromRight
                : fromLeft;

        if (prevPanelId === key) {
            sign *= -1;
        }

        return sign * 100;
    }

    getDirection(next: PanelId, prev: PanelId): 'X' | 'Y' {
        const context = contexts.find((item) => item.includes(prev));

        if (!context) {
            throw new Error(`Can not find context for transition ${prev} -> ${next}`);
        }

        return context.includes(next) ? 'X' : 'Y';
    }

    onUpdateHeight = (height: number, key: PanelId): void => {
        this.setState(({ formsHeights }) => ({
            formsHeights: {
                ...formsHeights,
                [key]: height,
            },
        }));
    };

    /**
     * The error for the panel's transition data. The leaving panel is rendered with the data of its last render
     * as the active one, so it keeps the error displayed at the moment of the panel change.
     * The active panel renders the error from the state
     */
    getPanelError(panelId: PanelId): AuthState['error'] {
        // Until componentDidUpdate() handles the panel change, the error belongs to the previous panel
        if (this.state.panelId !== panelId) {
            return null;
        }

        // The error, which is being hidden, is partially hidden behind the panel's top edge. The leaving panel
        // is anchored to the top, so it would show the error entirely again. So it's better to just drop it
        if (PanelTransition.isErrorHiding(this.props, this.state)) {
            return null;
        }

        return this.state.displayedError;
    }

    onUpdateErrorHeight = (height: number): void => {
        this.setState({ errorHeight: height });
    };

    /**
     * The error's contribution to the panel's height: it's zero, while the error is being hidden,
     * so the panel's height is animated to the content's height
     */
    getDisplayedErrorHeight(): number {
        const { errorHeight } = this.state;

        if (errorHeight === null || PanelTransition.isErrorHiding(this.props, this.state)) {
            return 0;
        }

        return errorHeight;
    }

    /**
     * Once the height animation of the error hiding is over, stops displaying the error
     */
    releaseHiddenError(heightSpring: number, panelId: PanelId): void {
        if (!PanelTransition.isErrorHiding(this.props, this.state)
         || heightSpring !== this.state.formsHeights[panelId]
         || this.hideErrorReleaseId !== null
        ) {
            return;
        }

        // The state can't be changed during the render
        this.hideErrorReleaseId = requestAnimationFrame(() => {
            this.hideErrorReleaseId = null;
            this.setState((state, props) => {
                if (!PanelTransition.isErrorHiding(props, state)) {
                    return null;
                }

                return {
                    displayedError: null,
                    errorHeight: null,
                };
            });
        });
    }

    onUpdateContextHeight = (height: number): void => {
        this.setState({
            contextHeight: height,
        });
    };

    onGoBack: MouseEventHandler<HTMLButtonElement> = (event): void => {
        event.preventDefault();
        authFlow.goBack();
    };

    /**
     * Tries to auto focus form fields after transition end
     *
     * @param {number} length number of panels transitioned
     */
    tryToAutoFocus(length: number): void {
        if (!this.body) {
            return;
        }

        if (length === 1) {
            // Don't steal the focus from a field the user has already started typing into during the transition.
            // The leaving panel's fields are disabled, so a focus that remained there doesn't count
            const { activeElement } = document;
            const isUserTyping = activeElement?.matches('input:enabled, textarea:enabled');

            if (!this.wasAutoFocused && !isUserTyping) {
                this.body?.autoFocus();
            }

            this.wasAutoFocused = true;
        } else if (this.wasAutoFocused) {
            this.wasAutoFocused = false;
        }
    }

    getHeader({ key, style, data }: TransitionPlainStyle): ReactElement {
        const { Title } = data as AnimationData;
        const { transformSpring } = style as unknown as AnimationStyle;

        let { hasBackButton } = data;

        if (typeof hasBackButton === 'function') {
            hasBackButton = hasBackButton(this.props);
        }

        const transitionStyle = {
            ...this.getDefaultTransitionStyles(key, style as unknown as AnimationStyle),
            opacity: 1, // reset default
        };

        const scrollStyle = this.translate(transformSpring, 'Y');

        const sideScrollStyle = {
            position: 'relative' as const,
            zIndex: 2,
            ...this.translate(-Math.abs(transformSpring)),
        };

        const backButton = (
            <button
                style={sideScrollStyle}
                className={panelStyles.headerControl}
                data-e2e-go-back
                type="button"
                onClick={this.onGoBack}
            >
                <span className={icons.arrowLeft} />
            </button>
        );

        return (
            <div
                key={`header/${key}`}
                style={transitionStyle}
                data-testid="auth-header"
                {...this.getActiveAttrs(key)}
            >
                {hasBackButton ? backButton : null}
                <div style={scrollStyle}>{Title}</div>
            </div>
        );
    }

    getBody({ key, style, data }: TransitionPlainStyle, isTransitioning: boolean): ReactElement {
        const { Body, error } = data as AnimationData;
        const { transformSpring } = style as unknown as AnimationStyle;
        const { direction } = this.state;

        let transform = this.translate(transformSpring, direction);
        let verticalOrigin = 'top';

        if (direction === 'Y') {
            transform = {};

            // The bottom anchoring is needed only for the height toggling between panels.
            // Once the transition is over, the panel must be anchored to the top: otherwise any later
            // height change (e.g. an asynchronously loaded captcha) pushes the content up first
            // and then it floats down along with the height animation
            if (isTransitioning) {
                verticalOrigin = 'bottom';
            }
        }

        // The error is rendered at the top of the body. With the bottom anchoring it's initially hidden above
        // the panel's top edge (the form keeps its position) and then slides in along with the height animation,
        // pushing the form down. The hiding is the same in reverse
        if (!isTransitioning && this.state.displayedError) {
            verticalOrigin = 'bottom';
        }

        const transitionStyle: CSSProperties = {
            ...this.getDefaultTransitionStyles(key, style as unknown as AnimationStyle),
            top: 'auto', // reset default
            [verticalOrigin]: 0,
            ...transform,
        };

        return (
            <div key={`body/${key}`} style={transitionStyle} data-testid="auth-body" {...this.getActiveAttrs(key)}>
                {key === this.state.panelId
                    ? this.renderError(this.state.displayedError, true)
                    : this.renderError(error, false)}
                <MeasureHeight
                    className={panelStyles.bodyContent}
                    onMeasure={(height) => this.onUpdateHeight(height, key)}
                >
                    {this.renderFieldset(
                        key,
                        React.cloneElement(Body, {
                            // @ts-ignore
                            ref: (body) => {
                                // During the transition the leaving panel is still mounted and its ref may be called
                                // after the active one's, so take only the active panel's body
                                if (key === this.state.panelId) {
                                    this.body = body;
                                }
                            },
                        }),
                    )}
                </MeasureHeight>
            </div>
        );
    }

    /**
     * The error is rendered outside the body's paddings, so the form is shifted exactly by the error's height
     * and they move together during the height animation
     */
    renderError(error: AuthState['error'], isActive: boolean): ReactNode {
        const [firstError] = Object.values(error || {});

        if (!firstError) {
            return null;
        }

        return (
            // The leaving panel's error must not affect the height of the active one
            <MeasureHeight onMeasure={isActive ? this.onUpdateErrorHeight : noop}>
                <AuthError error={firstError} onClose={this.props.clearErrors} />
            </MeasureHeight>
        );
    }

    getFooter({ key, style, data }: TransitionPlainStyle): ReactElement {
        const { Footer } = data as AnimationData;

        const transitionStyle = this.getDefaultTransitionStyles(key, style as unknown as AnimationStyle);

        return (
            <div
                key={`footer/${key}`}
                style={transitionStyle}
                data-testid="auth-controls"
                {...this.getActiveAttrs(key)}
            >
                {Footer}
            </div>
        );
    }

    getLinks({ key, style, data }: TransitionPlainStyle): ReactElement {
        const { Links } = data as AnimationData;

        const transitionStyle = this.getDefaultTransitionStyles(key, style as unknown as AnimationStyle);

        return (
            <div
                key={`links/${key}`}
                style={transitionStyle}
                data-testid="auth-controls-secondary"
                {...this.getActiveAttrs(key)}
            >
                {Links}
            </div>
        );
    }

    getDefaultTransitionStyles(
        key: string,
        { opacitySpring }: Readonly<AnimationStyle>,
    ): {
        position: 'absolute';
        top: number;
        left: number;
        width: string;
        opacity: number;
        pointerEvents: 'none' | 'auto';
    } {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring,
            pointerEvents: key === this.state.panelId ? 'auto' : 'none',
        };
    }

    /**
     * While a transition is running, the leaving panel is still mounted inside the same <form>. Disabling its
     * fields excludes them from the form's validation and serialization, so a submit made during the transition
     * isn't blocked by the required fields of the previous panel.
     *
     * This is not probably what happens in the real life, but E2E tests works too fast and constantly bugs with that
     */
    renderFieldset(key: PanelId, children: ReactNode): ReactElement {
        return (
            <fieldset disabled={key !== this.state.panelId} style={fieldsetStyles}>
                {children}
            </fieldset>
        );
    }

    /**
     * This helps E2E correctly select elements skipping those, that are still presented in the DOM during
     * panel transition to the next one.
     */
    getActiveAttrs(key: PanelId): Record<string, string> {
        return {
            'data-e2e-panel-active': key === this.state.panelId ? 'true' : 'false',
        };
    }

    translate(value: number, direction: 'X' | 'Y' = 'X', unit: '%' | 'px' = '%'): CSSProperties {
        return {
            WebkitTransform: `translate${direction}(${value}${unit})`,
            transform: `translate${direction}(${value}${unit})`,
        };
    }
}

export default connect(
    (state) => {
        const login = getLogin(state);
        let user = {
            ...state.user,
        };

        if (login) {
            user = {
                ...user,
                isGuest: true,
                email: '',
                username: '',
            };

            if (/[@.]/.test(login)) {
                user.email = login;
            } else {
                user.username = login;
            }
        }

        return {
            user,
            auth: state.auth,
            resolve: authFlow.resolve.bind(authFlow),
            reject: authFlow.reject.bind(authFlow),
        };
    },
    {
        clearErrors: actions.clearErrors,
        setErrors: actions.setErrors,
    },
)(PanelTransition);

function noop(): void {}
