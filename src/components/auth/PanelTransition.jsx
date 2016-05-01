import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { TransitionMotion, spring } from 'react-motion';

import { Panel, PanelBody, PanelFooter, PanelHeader } from 'components/ui/Panel';
import { Form } from 'components/ui/Form';
import {helpLinks as helpLinksStyles} from 'components/auth/helpLinks.scss';
import panelStyles from 'components/ui/panel.scss';
import icons from 'components/ui/icons.scss';
import authFlow from 'services/authFlow';
import { userShape } from 'components/user/User';

import * as actions from './actions';
import MeasureHeight from './MeasureHeight';

const opacitySpringConfig = {stiffness: 300, damping: 20};
const transformSpringConfig = {stiffness: 500, damping: 50, precision: 0.5};
const changeContextSpringConfig = {stiffness: 500, damping: 20, precision: 0.5};

class PanelTransition extends Component {
    static displayName = 'PanelTransition';

    static propTypes = {
        // context props
        auth: PropTypes.shape({
            error: PropTypes.string,
            isLoading: PropTypes.bool,
            login: PropTypes.shape({
                login: PropTypes.string,
                password: PropTypes.string
            })
        }).isRequired,
        user: userShape.isRequired,
        setError: React.PropTypes.func.isRequired,
        clearErrors: React.PropTypes.func.isRequired,
        resolve: React.PropTypes.func.isRequired,
        reject: React.PropTypes.func.isRequired,

        // local props
        Title: PropTypes.element,
        Body: PropTypes.element,
        Footer: PropTypes.element,
        Links: PropTypes.element,
        children: PropTypes.element
    };

    static childContextTypes = {
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                login: PropTypes.string,
                password: PropTypes.string
            })
        }),
        user: userShape,
        clearErrors: React.PropTypes.func,
        resolve: PropTypes.func,
        reject: PropTypes.func
    };

    state = {
        contextHeight: 0
    };

    getChildContext() {
        return {
            auth: this.props.auth,
            user: this.props.user,
            clearErrors: this.props.clearErrors,
            resolve: this.props.resolve,
            reject: this.props.reject
        };
    }

    componentWillReceiveProps(nextProps) {
        const nextPanel = nextProps.Body && nextProps.Body.type.panelId;
        const previousPanel = this.props.Body && this.props.Body.type.panelId;

        if (nextPanel !== previousPanel) {
            const direction = this.getDirection(nextPanel, previousPanel);
            const forceHeight = direction === 'Y' && nextPanel !== previousPanel ? 1 : 0;

            this.props.clearErrors();
            this.setState({
                direction,
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
        const {canAnimateHeight, contextHeight, forceHeight} = this.state;

        const {Title, Body, Footer, Links} = this.props;

        if (this.props.children) {
            return this.props.children;
        } else if (!Title || !Body || !Footer || !Links) {
            throw new Error('Title, Body, Footer and Links are required');
        }

        const panelId = Body.type.panelId;
        const hasGoBack = Body.type.hasGoBack;

        const formHeight = this.state[`formHeight${panelId}`] || 0;

        return (
            <TransitionMotion
                styles={[
                    {key: panelId, data: {Title, Body, Footer, Links, hasBackButton: hasGoBack}, style: {
                        transformSpring: spring(0, transformSpringConfig),
                        opacitySpring: spring(1, opacitySpringConfig)
                    }},
                    {key: 'common', style: {
                        heightSpring: spring(forceHeight || formHeight, transformSpringConfig),
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
                        height: `${canAnimateHeight ? common.style.heightSpring : formHeight}px`
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
                                        state={this.props.auth.error}
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

    onFormInvalid = (errorMessage) => {
        this.props.setError(errorMessage);
    };

    willEnter = (config) => this.getTransitionStyles(config);
    willLeave = (config) => this.getTransitionStyles(config, {isLeave: true});

    /**
     * @param  {Object} config
     * @param  {string} config.key
     * @param  {Object} [options]
     * @param  {Object} [options.isLeave=false] - true, if this is a leave transition
     *
     * @return {Object}
     */
    getTransitionStyles({key}, options = {}) {
        const {isLeave = false} = options;

        const map = {
            login: -1,
            register: -1,
            password: 1,
            activation: 1,
            permissions: -1,
            changePassword: 1,
            forgotPassword: 1
        };
        const sign = map[key];

        const transform = sign * 100;

        return {
            transformSpring: isLeave ? spring(transform, transformSpringConfig) : transform,
            opacitySpring: isLeave ? spring(0, opacitySpringConfig) : 1
        };
    }

    getDirection(next, prev) {
        const not = (panelId) => prev !== panelId && next !== panelId;

        const map = {
            login: not('password') && not('forgotPassword') ? 'Y' : 'X',
            password: not('login') && not('forgotPassword') ? 'Y' : 'X',
            register: not('activation') ? 'Y' : 'X',
            activation: not('register') ? 'Y' : 'X',
            permissions: 'Y',
            changePassword: 'Y',
            forgotPassword: not('password') && not('login') ? 'Y' : 'X'
        };

        return map[next];
    }

    onUpdateHeight = (height, key) => {
        const heightKey = `formHeight${key}`;

        // we need to skip first render, because there is no panel to make transition from
        // const canAnimateHeight = Object.keys(this.state.height).length > 1 || this.state[heightKey];
        const canAnimateHeight = true; // NOTE: lets try to always animate

        this.setState({
            canAnimateHeight,
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
     * @param  {number} length number of panels transitioned
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

    getHeader({key, style, data}) {
        const {Title, hasBackButton} = data;
        const {transformSpring} = style;

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
            <button style={sideScrollStyle} type="button" onClick={this.onGoBack} className={panelStyles.headerControl}>
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
                state={this.props.auth.error}
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
     * @param  {string} key
     * @param  {Object} style
     * @param  {number} style.opacitySpring
     *
     * @return {Object}
     */
    getDefaultTransitionStyles(key, {opacitySpring}) {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring,
            pointerEvents: key === this.props.Body.type.panelId ? 'auto' : 'none'
        };
    }

    /**
     * @param  {number} value
     * @param  {string} direction='X' - X|Y
     * @param  {string} unit='%' - %|px etc
     *
     * @return {Object}
     */
    translate(value, direction = 'X', unit = '%') {
        return {
            WebkitTransform: `translate${direction}(${value}${unit})`,
            transform: `translate${direction}(${value}${unit})`
        };
    }
}

export default connect((state) => ({
    user: state.user,
    auth: state.auth,
    resolve: authFlow.resolve.bind(authFlow),
    reject: authFlow.reject.bind(authFlow)
}), {
    clearErrors: actions.clearErrors,
    setError: actions.setError
})(PanelTransition);
