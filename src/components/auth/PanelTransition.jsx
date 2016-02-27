import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';
import { TransitionMotion, spring } from 'react-motion';
import ReactHeight from 'react-height';

import { Panel, PanelBody, PanelFooter, PanelHeader } from 'components/ui/Panel';
import { Form } from 'components/ui/Form';
import {helpLinks as helpLinksStyles} from 'components/auth/helpLinks.scss';
import panelStyles from 'components/ui/panel.scss';
import icons from 'components/ui/icons.scss';

import * as actions from './actions';

const opacitySpringConfig = [300, 20];
const transformSpringConfig = [500, 50];
const changeContextSpringConfig = [500, 20];

class PanelTransition extends Component {
    static displayName = 'PanelTransition';

    static propTypes = {
        auth: PropTypes.shape({
            error: PropTypes.string,
            login: PropTypes.shape({
                login: PropTypes.string,
                password: PropTypes.string
            })
        }).isRequired,
        goBack: React.PropTypes.func.isRequired,
        setError: React.PropTypes.func.isRequired,
        clearErrors: React.PropTypes.func.isRequired,
        path: PropTypes.string.isRequired,
        Title: PropTypes.element.isRequired,
        Body: PropTypes.element.isRequired,
        Footer: PropTypes.element.isRequired,
        Links: PropTypes.element.isRequired
    };

    state = {
        height: {},
        contextHeight: 0
    };

    componentWillReceiveProps(nextProps) {
        var nextPath = nextProps.path;
        var previousPath = this.props.path;

        if (nextPath !== previousPath) {
            var direction = this.getDirection(nextPath, previousPath);
            var forceHeight = direction === 'Y' && nextPath !== previousPath ? 1 : 0;

            this.props.clearErrors();
            this.setState({
                direction,
                forceHeight,
                previousPath
            });

            if (forceHeight) {
                setTimeout(() => {
                    this.setState({forceHeight: 0});
                }, 100);
            }
        }
    }

    render() {
        const {height, canAnimateHeight, contextHeight, forceHeight} = this.state;

        const {path, Title, Body, Footer, Links} = this.props;

        return (
            <TransitionMotion
                styles={{
                    [path]: {
                        Title,
                        Body,
                        Footer,
                        Links,
                        hasBackButton: Title.type.goBack,
                        transformSpring: spring(0, transformSpringConfig),
                        opacitySpring: spring(1, opacitySpringConfig)
                    },
                    common: {
                        heightSpring: spring(forceHeight || height[path] || 0, transformSpringConfig),
                        switchContextHeightSpring: spring(forceHeight || contextHeight, changeContextSpringConfig)
                    }
                }}
                willEnter={this.willEnter}
                willLeave={this.willLeave}
            >
                {(items) => {
                    const keys = Object.keys(items).filter((key) => key !== 'common');

                    const contentHeight = {
                        overflow: 'hidden',
                        height: forceHeight ? items.common.switchContextHeightSpring : 'auto'
                    };

                    const bodyHeight = {
                        position: 'relative',
                        height: `${canAnimateHeight ? items.common.heightSpring : height[path]}px`
                    };

                    return (
                        <Form id={path} onSubmit={this.onFormSubmit} onInvalid={this.onFormInvalid}>
                            <Panel>
                                <PanelHeader>
                                    {keys.map((key) => this.getHeader(key, items[key]))}
                                </PanelHeader>
                                <div style={contentHeight}>
                                    <ReactHeight onHeightReady={this.onUpdateContextHeight}>
                                        <PanelBody>
                                            <div style={bodyHeight}>
                                                {keys.map((key) => this.getBody(key, items[key]))}
                                            </div>
                                        </PanelBody>
                                        <PanelFooter>
                                            {keys.map((key) => this.getFooter(key, items[key]))}
                                        </PanelFooter>
                                    </ReactHeight>
                                </div>
                            </Panel>
                            <div className={helpLinksStyles}>
                                {keys.map((key) => this.getLinks(key, items[key]))}
                            </div>
                        </Form>
                    );
                }}
            </TransitionMotion>
        );
    }

    onFormSubmit = () => {
        this.body.onFormSubmit();
    };

    onFormInvalid = (errorMessage) => {
        this.props.setError(errorMessage);
    };

    willEnter = (key, styles) => this.getTransitionStyles(key, styles);
    willLeave = (key, styles) => this.getTransitionStyles(key, styles, {isLeave: true});

    /**
     * @param  {string} key
     * @param  {Object} styles
     * @param  {Object} [options]
     * @param  {Object} [options.isLeave=false] - true, if this is a leave transition
     *
     * @return {Object}
     */
    getTransitionStyles(key, styles, options = {}) {
        var {isLeave = false} = options;

        var map = {
            '/login': -1,
            '/register': -1,
            '/password': 1,
            '/activation': 1,
            '/oauth/permissions': -1
        };
        var sign = map[key];

        return {
            ...styles,
            pointerEvents: isLeave ? 'none' : 'auto',
            transformSpring: spring(sign * 100, transformSpringConfig),
            opacitySpring: spring(isLeave ? 0 : 1, opacitySpringConfig)
        };
    }

    onUpdateHeight = (height) => {
        const canAnimateHeight = Object.keys(this.state.height).length > 1 || this.state.height[[this.props.path]];

        this.setState({
            canAnimateHeight,
            height: {
                ...this.state.height,
                [this.props.path]: height
            }
        });
    };

    onUpdateContextHeight = (height) => {
        this.setState({
            contextHeight: height
        });
    };

    onGoBack = (event) => {
        event.preventDefault();

        this.body.onGoBack && this.body.onGoBack();
        this.props.goBack();
    };

    getDirection(next, prev) {
        var not = (path) => prev !== path && next !== path;

        var map = {
            '/login': not('/password') ? 'Y' : 'X',
            '/password': not('/login') ? 'Y' : 'X',
            '/register': not('/activation') ? 'Y' : 'X',
            '/activation': not('/register') ? 'Y' : 'X',
            '/oauth/permissions': 'Y'
        };

        return map[next];
    }

    getHeader(key, props) {
        var {hasBackButton, transformSpring, Title} = props;

        var style = {
            ...this.getDefaultTransitionStyles(props),
            opacity: 1 // reset default
        };

        var scrollStyle = this.translate(transformSpring, 'Y');

        var sideScrollStyle = {
            position: 'relative',
            zIndex: 2,
            ...this.translate(-Math.abs(transformSpring))
        };

        var backButton = (
            <button style={sideScrollStyle} type="button" onClick={this.onGoBack} className={panelStyles.headerControl}>
                <span className={icons.arrowLeft} />
            </button>
        );

        return (
            <div key={`header${key}`} style={style}>
                {hasBackButton ? backButton : null}
                <div style={scrollStyle}>
                    {React.cloneElement(Title, this.props)}
                </div>
            </div>
        );
    }

    getBody(key, props) {
        var {transformSpring, Body} = props;
        var {direction} = this.state;

        var transform = this.translate(transformSpring, direction);


        var verticalOrigin = 'top';
        if (direction === 'Y') {
            verticalOrigin = 'bottom';
            transform = {};
        }

        var style = {
            ...this.getDefaultTransitionStyles(props),
            top: 'auto', // reset default
            [verticalOrigin]: 0,
            ...transform
        };

        return (
            <ReactHeight key={`body${key}`} style={style} onHeightReady={this.onUpdateHeight}>
                {React.cloneElement(Body, {
                    ...this.props,
                    ref: (body) => {
                        this.body = body;
                    }
                })}
            </ReactHeight>
        );
    }

    getFooter(key, props) {
        var {Footer} = props;

        var style = this.getDefaultTransitionStyles(props);

        return (
            <div key={`footer${key}`} style={style}>
                {React.cloneElement(Footer, this.props)}
            </div>
        );
    }

    getLinks(key, props) {
        var {Links} = props;

        var style = this.getDefaultTransitionStyles(props);

        return (
            <div key={`links${key}`} style={style}>
                {React.cloneElement(Links, this.props)}
            </div>
        );
    }

    /**
     * @param  {Object} props
     * @param  {string} props.pointerEvents
     * @param  {number} props.opacitySpring
     *
     * @return {Object}
     */
    getDefaultTransitionStyles(props) {
        var {pointerEvents, opacitySpring} = props;

        return {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring,
            pointerEvents
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
    path: state.routing.location.pathname
}), {
    goBack: routeActions.goBack,
    login: actions.login,
    logout: actions.logout,
    register: actions.register,
    activate: actions.activate,
    clearErrors: actions.clearErrors,
    oAuthComplete: actions.oAuthComplete,
    setError: actions.setError
})(PanelTransition);
