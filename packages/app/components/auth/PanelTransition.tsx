import React from 'react';
import { AccountsState } from 'app/components/accounts';
import { User } from 'app/components/user';
import { connect } from 'react-redux';
import { TransitionMotion, spring } from 'react-motion';
import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from 'app/components/ui/Panel';
import { Form } from 'app/components/ui/form';
import MeasureHeight from 'app/components/MeasureHeight';
import panelStyles from 'app/components/ui/panel.scss';
import icons from 'app/components/ui/icons.scss';
import authFlow from 'app/services/authFlow';
import { RootState } from 'app/reducers';

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
const contexts: Array<PanelId[]> = [
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
    context.forEach(panel => {
      if (acc[panel]) {
        throw new Error(
          `Panel ${panel} is already exists in context ${JSON.stringify(
            acc[panel],
          )}`,
        );
      }

      acc[panel] = context;
    });

    return acc;
  }, {});
}

type ValidationError =
  | string
  | {
      type: string;
      payload: { [key: string]: any };
    };

type AnimationProps = {
  opacitySpring: number;
  transformSpring: number;
};

type AnimationContext = {
  key: PanelId;
  style: AnimationProps;
  data: {
    Title: React.ReactElement<any>;
    Body: React.ReactElement<any>;
    Footer: React.ReactElement<any>;
    Links: React.ReactElement<any>;
    hasBackButton: boolean | ((props: Props) => boolean);
  };
};

type OwnProps = {
  Title: React.ReactElement<any>;
  Body: React.ReactElement<any>;
  Footer: React.ReactElement<any>;
  Links: React.ReactElement<any>;
  children?: React.ReactElement<any>;
};

interface Props extends OwnProps {
  // context props
  auth: AuthState;
  user: User;
  accounts: AccountsState;
  clearErrors: () => void;
  resolve: () => void;
  reject: () => void;

  setErrors: (errors: { [key: string]: ValidationError }) => void;
}

type State = {
  contextHeight: number;
  panelId: PanelId | void;
  prevPanelId: PanelId | void;
  isHeightDirty: boolean;
  forceHeight: 1 | 0;
  direction: 'X' | 'Y';
};

class PanelTransition extends React.PureComponent<Props, State> {
  state: State = {
    contextHeight: 0,
    panelId: this.props.Body && (this.props.Body.type as any).panelId,
    isHeightDirty: false,
    forceHeight: 0 as const,
    direction: 'X' as const,
    prevPanelId: undefined,
  };

  isHeightMeasured: boolean = false;
  wasAutoFocused: boolean = false;
  body: null | {
    autoFocus: () => void;
    onFormSubmit: () => void;
  } = null;

  timerIds: NodeJS.Timeout[] = []; // this is a list of a probably running timeouts to clean on unmount

  componentDidUpdate(prevProps: Props) {
    const nextPanel: PanelId =
      this.props.Body && (this.props.Body.type as any).panelId;
    const prevPanel: PanelId =
      prevProps.Body && (prevProps.Body.type as any).panelId;

    if (nextPanel !== prevPanel) {
      const direction = this.getDirection(nextPanel, prevPanel);
      const forceHeight = direction === 'Y' && nextPanel !== prevPanel ? 1 : 0;

      this.props.clearErrors();

      this.setState({
        direction,
        panelId: nextPanel,
        prevPanelId: prevPanel,
        forceHeight,
      });

      if (forceHeight) {
        this.timerIds.push(
          setTimeout(() => {
            this.setState({ forceHeight: 0 });
          }, 100),
        );
      }
    }
  }

  componentWillUnmount() {
    this.timerIds.forEach(id => clearTimeout(id));
    this.timerIds = [];
  }

  render() {
    const { contextHeight, forceHeight } = this.state;

    const {
      Title,
      Body,
      Footer,
      Links,
      auth,
      user,
      clearErrors,
      resolve,
      reject,
    } = this.props;

    if (this.props.children) {
      return this.props.children;
    } else if (!Title || !Body || !Footer || !Links) {
      throw new Error('Title, Body, Footer and Links are required');
    }

    const {
      panelId,
      hasGoBack,
    }: {
      panelId: PanelId;
      hasGoBack: boolean;
    } = Body.type as any;

    const formHeight = this.state[`formHeight${panelId}`] || 0;

    // a hack to disable height animation on first render
    const { isHeightMeasured } = this;
    this.isHeightMeasured = isHeightMeasured || formHeight > 0;

    return (
      <AuthContextProvider
        value={{
          auth,
          user,
          requestRedraw: this.requestRedraw,
          clearErrors,
          resolve,
          reject,
        }}
      >
        <TransitionMotion
          styles={[
            {
              key: panelId,
              data: { Title, Body, Footer, Links, hasBackButton: hasGoBack },
              style: {
                transformSpring: spring(0, transformSpringConfig),
                opacitySpring: spring(1, opacitySpringConfig),
              },
            },
            {
              key: 'common',
              style: {
                heightSpring: isHeightMeasured
                  ? spring(forceHeight || formHeight, transformSpringConfig)
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
          {items => {
            const panels = items.filter(({ key }) => key !== 'common');
            const [common] = items.filter(({ key }) => key === 'common');

            const contentHeight = {
              overflow: 'hidden',
              height: forceHeight
                ? common.style.switchContextHeightSpring
                : 'auto',
            };

            this.tryToAutoFocus(panels.length);

            const bodyHeight = {
              position: 'relative' as const,
              height: `${common.style.heightSpring}px`,
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
                    {panels.map(config => this.getHeader(config))}
                  </PanelHeader>
                  <div style={contentHeight}>
                    <MeasureHeight
                      state={this.shouldMeasureHeight()}
                      onMeasure={this.onUpdateContextHeight}
                    >
                      <PanelBody>
                        <div style={bodyHeight}>
                          {panels.map(config => this.getBody(config))}
                        </div>
                      </PanelBody>
                      <PanelFooter>
                        {panels.map(config => this.getFooter(config))}
                      </PanelFooter>
                    </MeasureHeight>
                  </div>
                </Panel>
                <div className={helpLinksStyles}>
                  {panels.map(config => this.getLinks(config))}
                </div>
              </Form>
            );
          }}
        </TransitionMotion>
      </AuthContextProvider>
    );
  }

  onFormSubmit = () => {
    this.props.clearErrors();

    if (this.body) {
      this.body.onFormSubmit();
    }
  };

  onFormInvalid = (errors: { [key: string]: ValidationError }) =>
    this.props.setErrors(errors);

  willEnter = (config: AnimationContext) => this.getTransitionStyles(config);
  willLeave = (config: AnimationContext) =>
    this.getTransitionStyles(config, { isLeave: true });

  /**
   * @param {object} config
   * @param {string} config.key
   * @param {object} [options]
   * @param {object} [options.isLeave=false] - true, if this is a leave transition
   *
   * @returns {object}
   */
  getTransitionStyles(
    { key }: AnimationContext,
    options: { isLeave?: boolean } = {},
  ): {
    transformSpring: number;
    opacitySpring: number;
  } {
    const { isLeave = false } = options;
    const { panelId, prevPanelId } = this.state;

    const fromLeft = -1;
    const fromRight = 1;

    const currentContext = contexts.find(context => context.includes(key));

    if (!currentContext) {
      throw new Error(`Can not find settings for ${key} panel`);
    }

    let sign =
      prevPanelId &&
      panelId &&
      currentContext.indexOf(panelId) > currentContext.indexOf(prevPanelId)
        ? fromRight
        : fromLeft;

    if (prevPanelId === key) {
      sign *= -1;
    }

    const transform = sign * 100;

    return {
      transformSpring: isLeave
        ? spring(transform, transformSpringConfig)
        : transform,
      opacitySpring: isLeave ? spring(0, opacitySpringConfig) : 1,
    };
  }

  getDirection(next: PanelId, prev: PanelId): 'X' | 'Y' {
    const context = contexts.find(item => item.includes(prev));

    if (!context) {
      throw new Error(`Can not find context for transition ${prev} -> ${next}`);
    }

    return context.includes(next) ? 'X' : 'Y';
  }

  onUpdateHeight = (height: number, key: PanelId) => {
    const heightKey = `formHeight${key}`;

    // @ts-ignore
    this.setState({
      [heightKey]: height,
    });
  };

  onUpdateContextHeight = (height: number) => {
    this.setState({
      contextHeight: height,
    });
  };

  onGoBack = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    authFlow.goBack();
  };

  /**
   * Tries to auto focus form fields after transition end
   *
   * @param {number} length number of panels transitioned
   */
  tryToAutoFocus(length: number) {
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
    const { user, accounts, auth } = this.props;
    const { isHeightDirty } = this.state;

    const errorString = Object.values(auth.error || {}).reduce(
      (acc: string, item: ValidationError): string => {
        if (typeof item === 'string') {
          return acc + item;
        }

        return acc + item.type;
      },
      '',
    ) as string;

    return [
      errorString,
      isHeightDirty,
      user.lang,
      accounts.available.length,
    ].join('');
  }

  getHeader({ key, style, data }: AnimationContext) {
    const { Title } = data;
    const { transformSpring } = style;

    let { hasBackButton } = data;

    if (typeof hasBackButton === 'function') {
      hasBackButton = hasBackButton(this.props);
    }

    const transitionStyle = {
      ...this.getDefaultTransitionStyles(key, style),
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
      <div key={`header/${key}`} style={transitionStyle}>
        {hasBackButton ? backButton : null}
        <div style={scrollStyle}>{Title}</div>
      </div>
    );
  }

  getBody({ key, style, data }: AnimationContext) {
    const { Body } = data;
    const { transformSpring } = style;
    const { direction } = this.state;

    let transform: { [key: string]: string } = this.translate(
      transformSpring,
      direction,
    );
    let verticalOrigin = 'top';

    if (direction === 'Y') {
      verticalOrigin = 'bottom';
      transform = {};
    }

    const transitionStyle = {
      ...this.getDefaultTransitionStyles(key, style),
      top: 'auto', // reset default
      [verticalOrigin]: 0,
      ...transform,
    };

    return (
      <MeasureHeight
        key={`body/${key}`}
        style={transitionStyle}
        state={this.shouldMeasureHeight()}
        onMeasure={height => this.onUpdateHeight(height, key)}
      >
        {React.cloneElement(Body, {
          ref: body => {
            this.body = body;
          },
        })}
      </MeasureHeight>
    );
  }

  getFooter({ key, style, data }: AnimationContext) {
    const { Footer } = data;

    const transitionStyle = this.getDefaultTransitionStyles(key, style);

    return (
      <div key={`footer/${key}`} style={transitionStyle}>
        {Footer}
      </div>
    );
  }

  getLinks({ key, style, data }: AnimationContext) {
    const { Links } = data;

    const transitionStyle = this.getDefaultTransitionStyles(key, style);

    return (
      <div key={`links/${key}`} style={transitionStyle}>
        {Links}
      </div>
    );
  }

  /**
   * @param {string} key
   * @param {object} style
   * @param {number} style.opacitySpring
   *
   * @returns {object}
   */
  getDefaultTransitionStyles(
    key: string,
    { opacitySpring }: Readonly<AnimationProps>,
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

  translate(value: number, direction: 'X' | 'Y' = 'X', unit: '%' | 'px' = '%') {
    return {
      WebkitTransform: `translate${direction}(${value}${unit})`,
      transform: `translate${direction}(${value}${unit})`,
    };
  }

  requestRedraw = (): Promise<void> =>
    new Promise(resolve =>
      this.setState({ isHeightDirty: true }, () => {
        this.setState({ isHeightDirty: false });

        // wait till transition end
        this.timerIds.push(setTimeout(resolve, 200));
      }),
    );
}

export default connect(
  (state: RootState) => {
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
      accounts: state.accounts, // need this, to re-render height
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
