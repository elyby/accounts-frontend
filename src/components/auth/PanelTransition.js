import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { TransitionMotion, spring } from 'react-motion';

import { Panel, PanelBody, PanelFooter, PanelHeader } from 'components/ui/Panel';
import { Form } from 'components/ui/form';
import MeasureHeight from 'components/MeasureHeight';
import { helpLinks as helpLinksStyles } from 'components/auth/helpLinks.scss';
import panelStyles from 'components/ui/panel.scss';
import icons from 'components/ui/icons.scss';
import authFlow from 'services/authFlow';
import { userShape } from 'components/user/User';

import * as actions from './actions';

const opacitySpringConfig = {stiffness: 300, damping: 20};
const transformSpringConfig = {stiffness: 500, damping: 50, precision: 0.5};
const changeContextSpringConfig = {stiffness: 500, damping: 20, precision: 0.5};

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
const contexts = [
    ['login', 'password', 'forgotPassword', 'recoverPassword'],
    ['register', 'activation', 'resendActivation'],
    ['acceptRules'],
    ['chooseAccount', 'permissions']
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
    }, {});
}

class PanelTransition extends Component {
    static displayName = 'PanelTransition';

    static propTypes = {
        // context props
        auth: PropTypes.shape({
            error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
                type: PropTypes.string,
                payload: PropTypes.object
            })]),
            isLoading: PropTypes.bool,
            login: PropTypes.string
        }).isRequired,
        user: userShape.isRequired,
        accounts: PropTypes.shape({
            available: PropTypes.array
        }),
        setErrors: PropTypes.func.isRequired,
        clearErrors: PropTypes.func.isRequired,
        resolve: PropTypes.func.isRequired,
        reject: PropTypes.func.isRequired,

        // local props
        Title: PropTypes.element,
        Body: PropTypes.element,
        Footer: PropTypes.element,
        Links: PropTypes.element,
        children: PropTypes.element
    };

    static childContextTypes = {
        auth: PropTypes.shape({
            error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
                type: PropTypes.string,
                payload: PropTypes.object
            })]),
            login: PropTypes.string
        }),
        user: userShape,
        accounts: PropTypes.shape({
            available: PropTypes.array
        }),
        requestRedraw: PropTypes.func,
        clearErrors: PropTypes.func,
        resolve: PropTypes.func,
        reject: PropTypes.func
    };

    state = {
        contextHeight: 0,
        panelId: this.props.Body && this.props.Body.type.panelId
    };

    getChildContext() {
        return {
            auth: this.props.auth,
            user: this.props.user,
            requestRedraw: () => this.setState({isHeightDirty: true}, () => this.setState({isHeightDirty: false})),
            clearErrors: this.props.clearErrors,
            resolve: this.props.resolve,
            reject: this.props.reject
        };
    }

    componentWillReceiveProps(nextProps) {
        const nextPanel = nextProps.Body && nextProps.Body.type.panelId;
        const prevPanel = this.props.Body && this.props.Body.type.panelId;

        if (nextPanel !== prevPanel) {
            const direction = this.getDirection(nextPanel, prevPanel);
            const forceHeight = direction === 'Y' && nextPanel !== prevPanel ? 1 : 0;

            this.props.clearErrors();
            this.setState({
                direction,
                panelId: nextPanel,
                prevPanelId: prevPanel,
                forceHeight
            });

            if (forceHeight) {
                setTimeout(() => {
                    this.setState({forceHeight: 0});
                }, 100);
            }
        }
    }

    render() {
        const {contextHeight, forceHeight} = this.state;

        const {Title, Body, Footer, Links} = this.props;

        if (this.props.children) {
            return this.props.children;
        } else if (!Title || !Body || !Footer || !Links) {
            throw new Error('Title, Body, Footer and Links are required');
        }

        const {panelId, hasGoBack} = Body.type;

        const formHeight = this.state[`formHeight${panelId}`] || 0;

        // a hack to disable height animation on first render
        const isHeightMeasured = this.isHeightMeasured;
        this.isHeightMeasured = isHeightMeasured || formHeight > 0;

        return (
            <TransitionMotion
                styles={[
                    {key: panelId, data: {Title, Body, Footer, Links, hasBackButton: hasGoBack}, style: {
                        transformSpring: spring(0, transformSpringConfig),
                        opacitySpring: spring(1, opacitySpringConfig)
                    }},
                    {key: 'common', style: {
                        heightSpring: isHeightMeasured ? spring(forceHeight || formHeight, transformSpringConfig) : formHeight,
                        switchContextHeightSpring: spring(forceHeight || contextHeight, changeContextSpringConfig)
                    }}
                ]}
                willEnter={this.willEnter}
                willLeave={this.willLeave}
            >
                {(items) => {
                    const panels = items.filter(({key}) => key !== 'common');
                    const common = items.filter(({key}) => key === 'common')[0];

                    const contentHeight = {
                        overflow: 'hidden',
                        height: forceHeight ? common.style.switchContextHeightSpring : 'auto'
                    };

                    this.tryToAutoFocus(panels.length);

                    const bodyHeight = {
                        position: 'relative',
                        height: `${common.style.heightSpring}px`
                    };

                    return (
                        <Form
                            id={panelId}
                            onSubmit={this.onFormSubmit}
                            onInvalid={this.onFormInvalid}
                            isLoading={this.props.auth.isLoading}
                        >
                            <Panel>
                                <PanelHeader>
                                    {panels.map((config) => this.getHeader(config))}
                                </PanelHeader>
                                <div style={contentHeight}>
                                    <MeasureHeight
                                        state={this.shouldMeasureHeight()}
                                        onMeasure={this.onUpdateContextHeight}
                                    >
                                        <PanelBody>
                                            <div style={bodyHeight}>
                                                {panels.map((config) => this.getBody(config))}
                                            </div>
                                        </PanelBody>
                                        <PanelFooter>
                                            {panels.map((config) => this.getFooter(config))}
                                        </PanelFooter>
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
        );
    }

    onFormSubmit = () => {
        this.props.clearErrors();
        this.body.onFormSubmit();
    };

    onFormInvalid = (errors) => this.props.setErrors(errors);

    willEnter = (config) => this.getTransitionStyles(config);
    willLeave = (config) => this.getTransitionStyles(config, {isLeave: true});

    /**
     * @param {object} config
     * @param {string} config.key
     * @param {object} [options]
     * @param {object} [options.isLeave=false] - true, if this is a leave transition
     *
     * @return {object}
     */
    getTransitionStyles({key}, options = {}) {
        const {isLeave = false} = options;
        const {panelId, prevPanelId} = this.state;

        const fromLeft = -1;
        const fromRight = 1;

        const currentContext = contexts.find((context) => context.includes(key));
        let sign = currentContext.indexOf(panelId) > currentContext.indexOf(prevPanelId)
                ? fromRight
                : fromLeft;
        if (prevPanelId === key) {
            sign *= -1;
        }

        const transform = sign * 100;

        return {
            transformSpring: isLeave ? spring(transform, transformSpringConfig) : transform,
            opacitySpring: isLeave ? spring(0, opacitySpringConfig) : 1
        };
    }

    getDirection(next, prev) {
        return contexts.find((context) => context.includes(prev)).includes(next) ? 'X' : 'Y';
    }

    onUpdateHeight = (height, key) => {
        const heightKey = `formHeight${key}`;

        this.setState({
            [heightKey]: height
        });
    };

    onUpdateContextHeight = (height) => {
        this.setState({
            contextHeight: height
        });
    };

    onGoBack = (event) => {
        event.preventDefault();

        authFlow.goBack();
    };

    /**
     * Tries to auto focus form fields after transition end
     *
     * @param {number} length number of panels transitioned
     */
    tryToAutoFocus(length) {
        if (!this.body) {
            return;
        }

        if (length === 1) {
            if (!this.wasAutoFocused) {
                this.body.autoFocus();
            }
            this.wasAutoFocused = true;
        } else if (this.wasAutoFocused) {
            this.wasAutoFocused = false;
        }
    }

    shouldMeasureHeight() {
        return [
            this.props.auth.error,
            this.state.isHeightDirty,
            this.props.user.lang,
            this.props.accounts.available.length
        ].join('');
    }

    getHeader({key, style, data}) {
        const {Title} = data;
        const {transformSpring} = style;

        let {hasBackButton} = data;

        if (typeof hasBackButton === 'function') {
            hasBackButton = hasBackButton(this.props);
        }

        style = {
            ...this.getDefaultTransitionStyles(key, style),
            opacity: 1 // reset default
        };

        const scrollStyle = this.translate(transformSpring, 'Y');

        const sideScrollStyle = {
            position: 'relative',
            zIndex: 2,
            ...this.translate(-Math.abs(transformSpring))
        };

        const backButton = (
            <button style={sideScrollStyle}
                className={panelStyles.headerControl}
                type="button"
                onClick={this.onGoBack}
            >
                <span className={icons.arrowLeft} />
            </button>
        );

        return (
            <div key={`header/${key}`} style={style}>
                {hasBackButton ? backButton : null}
                <div style={scrollStyle}>
                    {Title}
                </div>
            </div>
        );
    }

    getBody({key, style, data}) {
        const {Body} = data;
        const {transformSpring} = style;
        const {direction} = this.state;

        let transform = this.translate(transformSpring, direction);
        let verticalOrigin = 'top';
        if (direction === 'Y') {
            verticalOrigin = 'bottom';
            transform = {};
        }

        style = {
            ...this.getDefaultTransitionStyles(key, style),
            top: 'auto', // reset default
            [verticalOrigin]: 0,
            ...transform
        };

        return (
            <MeasureHeight
                key={`body/${key}`}
                style={style}
                state={this.shouldMeasureHeight()}
                onMeasure={(height) => this.onUpdateHeight(height, key)}
            >
                {React.cloneElement(Body, {
                    ref: (body) => {
                        this.body = body;
                    }
                })}
            </MeasureHeight>
        );
    }

    getFooter({key, style, data}) {
        const {Footer} = data;

        style = this.getDefaultTransitionStyles(key, style);

        return (
            <div key={`footer/${key}`} style={style}>
                {Footer}
            </div>
        );
    }

    getLinks({key, style, data}) {
        const {Links} = data;

        style = this.getDefaultTransitionStyles(key, style);

        return (
            <div key={`links/${key}`} style={style}>
                {Links}
            </div>
        );
    }

    /**
     * @param {string} key
     * @param {object} style
     * @param {number} style.opacitySpring
     *
     * @return {object}
     */
    getDefaultTransitionStyles(key, {opacitySpring}) {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring,
            pointerEvents: key === this.state.panelId ? 'auto' : 'none'
        };
    }

    /**
     * @param {number} value
     * @param {string} direction='X' - X|Y
     * @param {string} unit='%' - %|px etc
     *
     * @return {object}
     */
    translate(value, direction = 'X', unit = '%') {
        return {
            WebkitTransform: `translate${direction}(${value}${unit})`,
            transform: `translate${direction}(${value}${unit})`
        };
    }
}

export default connect((state) => {
    const {login} = state.auth;
    let user = {
        ...state.user
    };

    if (login) {
        user = {
            ...user,
            isGuest: true,
            email: '',
            username: ''
        };

        if (/[@.]/.test(login)) {
            user.email = login;
        } else {
            user.username = login;
        }
    }

    return {
        user,
        accounts: state.accounts, // need this, to re-render height
        auth: state.auth,
        resolve: authFlow.resolve.bind(authFlow),
        reject: authFlow.reject.bind(authFlow)
    };
}, {
    clearErrors: actions.clearErrors,
    setErrors: actions.setErrors
})(PanelTransition);
