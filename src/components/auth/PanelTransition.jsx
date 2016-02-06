import React, { Component } from 'react';

import { TransitionMotion, spring } from 'react-motion';
import ReactHeight from 'react-height';

import { Panel, PanelBody, PanelFooter, PanelHeader } from 'components/ui/Panel';
import {helpLinks as helpLinksStyles} from 'components/auth/helpLinks.scss';
import panelStyles from 'components/ui/panel.scss';
import icons from 'components/ui/icons.scss';


const opacitySpringConfig = [300, 20];
const transformSpringConfig = [500, 50];
const changeContextSpringConfig = [500, 20];

export default class PanelTransition extends Component {
    state = {
        height: {},
        contextHeight: 0
    };

    componentWillReceiveProps(nextProps) {
        var previousRoute = this.props.location;

        var next = nextProps.path;
        var prev = previousRoute && previousRoute.pathname;

        var direction = this.getDirection(next, next, prev);
        var forceHeight = direction === 'Y' && next !== prev ? 1 : 0;

        this.setState({
            direction,
            forceHeight,
            previousRoute
        });

        if (forceHeight) {
            setTimeout(() => {
                this.setState({forceHeight: 0});
            }, 100);
        }
    }

    render() {
        var {previousRoute, height, contextHeight, forceHeight} = this.state;

        const {path, Title, Body, Footer, Links} = this.props;

        return (
            <TransitionMotion
                styles={{
                    [path]: {
                        Title,
                        Body,
                        Footer,
                        Links,
                        hasBackButton: previousRoute && previousRoute.pathname === Title.type.goBack,
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
                    var keys = Object.keys(items).filter((key) => key !== 'common');

                    return (
                        <div>
                            <Panel>
                                <PanelHeader>
                                    {keys.map((key) => this.getHeader(key, items[key]))}
                                </PanelHeader>
                                <div style={{
                                    overflow: 'hidden',
                                    height: forceHeight ? items.common.switchContextHeightSpring : 'auto'
                                }}>
                                    <ReactHeight onHeightReady={this.updateContextHeight}>
                                        <PanelBody>
                                            <div style={{
                                                position: 'relative',
                                                height: `${previousRoute ? items.common.heightSpring : height[path]}px`
                                            }}>
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
                        </div>
                    );
                }}
            </TransitionMotion>
        );
    }

    willEnter = (key, styles) => {
        return this.getTransitionStyles(key, styles);
    };

    willLeave = (key, styles) => {
        return this.getTransitionStyles(key, styles, {isLeave: true});
    };

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

    updateHeight = (height) => {
        this.setState({
            height: {
                ...this.state.height,
                [this.props.path]: height
            }
        });
    };

    updateContextHeight = (height) => {
        this.setState({
            contextHeight: height
        });
    };

    onGoBack = (event) => {
        event.preventDefault();

        this.props.history.goBack();
    };

    getDirection(key, next, prev) {
        var not = (path) => prev !== path && next !== path;

        var map = {
            '/login': not('/password') ? 'Y' : 'X',
            '/password': not('/login') ? 'Y' : 'X',
            '/register': not('/activation') ? 'Y' : 'X',
            '/activation': not('/register') ? 'Y' : 'X',
            '/oauth/permissions': 'Y'
        };

        return map[key];
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
            <button style={sideScrollStyle} onClick={this.onGoBack} className={panelStyles.headerControl}>
                <span className={icons.arrowLeft} />
            </button>
        );

        return (
            <div key={`header${key}`} style={style}>
                {hasBackButton ? backButton : null}
                <div style={scrollStyle}>
                    {Title}
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
            <ReactHeight key={`body${key}`} style={style} onHeightReady={this.updateHeight}>
                {Body}
            </ReactHeight>
        );
    }

    getFooter(key, props) {
        var {Footer} = props;

        var style = this.getDefaultTransitionStyles(props);

        return (
            <div key={`footer${key}`} style={style}>
                {Footer}
            </div>
        );
    }

    getLinks(key, props) {
        var {Links} = props;

        var style = this.getDefaultTransitionStyles(props);

        return (
            <div key={`links${key}`} style={style}>
                {Links}
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

