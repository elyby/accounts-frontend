import React, { Component } from 'react';

import { TransitionMotion, spring } from 'react-motion';
import ReactHeight from 'react-height';

import { Panel, PanelBody, PanelFooter, PanelHeader } from 'components/ui/Panel';
import {helpLinks as helpLinksStyles} from 'components/auth/helpLinks.scss';
import panelStyles from 'components/ui/panel.scss';
import icons from 'components/ui/icons.scss';


const opacitySpringConfig = [200, 20];
const heightSpringConfig = [200, 18];
const transformSpringConfig = [500, 20];

// TODO: сделать более быстрый фейд на горизонтальном скролле

export default class PanelTransition extends Component {
    state = {
        height: {}
    };

    componentWillReceiveProps(nextProps) {
        var previousRoute = this.props.location;

        var next = nextProps.path;
        var prev = previousRoute && previousRoute.pathname;

        var direction = this.getDirection(next, next, prev);
        var forceHeight = direction === 'Y' ? 1 : 0;

        this.setState({
            forceHeight: forceHeight,
            previousRoute: this.props.location
        });

        if (forceHeight) {
            setTimeout(() => {
                this.setState({forceHeight: 0});
            }, 100);
        }
    }

    render() {
        var {previousRoute, height} = this.state;

        var {path, Title, Body, Footer, Links} = this.props;

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
                        heightSpring: spring(this.state.forceHeight || height[path] || 0, transformSpringConfig)
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
                                    <div style={{
                                        position: 'relative',
                                        height: '59px',
                                        overflow: 'hidden'
                                    }}>
                                        {keys.map((key) => this.getHeader(key, items[key]))}
                                    </div>
                                </PanelHeader>
                                <PanelBody style={{
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'relative',
                                        height: previousRoute ? `${items.common.heightSpring}px` : `${height[path]}px`
                                    }}>
                                        {keys.map((key) => this.getBody(key, items[key]))}
                                    </div>
                                </PanelBody>
                                <PanelFooter>
                                    <div style={{
                                        position: 'relative',
                                        height: '50px',
                                        overflow: 'hidden'
                                    }}>
                                        {keys.map((key) => this.getFooter(key, items[key]))}
                                    </div>
                                </PanelFooter>
                            </Panel>
                            <div className={helpLinksStyles} style={{position: 'relative', height: '20px'}}>
                                {keys.map((key) => this.getLinks(key, items[key]))}
                            </div>
                        </div>
                    );
                }}
            </TransitionMotion>
        );
    }

    willEnter = (key, styles) => {
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
            transformSpring: spring(sign * 100, transformSpringConfig),
            opacitySpring: spring(1, opacitySpringConfig)
        };
    };

    willLeave = (key, styles) => {
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
            transformSpring: spring(sign * 100, transformSpringConfig),
            opacitySpring: spring(0, opacitySpringConfig)
        };
    };

    updateHeight = (height) => {
        this.setState({
            height: {
                ...this.state.height,
                [this.props.path]: height
            }
        });
    };

    onGoBack = (event) => {
        event.preventDefault();

        this.props.history.goBack();
    };

    getHeader(key, props) {
        var {hasBackButton, transformSpring, Title} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%'
        };

        var scrollStyle = {
            WebkitTransform: `translateY(${transformSpring}%)`,
            transform: `translateY(${transformSpring}%)`
        };

        var sideScrollStyle = {
            position: 'relative',
            zIndex: 2,
            WebkitTransform: `translateX(${-Math.abs(transformSpring)}%)`,
            transform: `translateX(${-Math.abs(transformSpring)}%)`
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
        var {transformSpring, opacitySpring, Body} = props;
        var {previousRoute} = this.state;

        var next = this.props.path;
        var prev = previousRoute && previousRoute.pathname;

        var direction = this.getDirection(key, next, prev);

        var verticalOrigin = 'top';
        if (direction === 'Y') { // TODO: do not activate animation when nothing was unmounted
            transformSpring = Math.abs(transformSpring);
            if (prev === key) {
                transformSpring *= -1;
            }

            verticalOrigin = 'bottom';
        }

        var style = {
            position: 'absolute',
            [verticalOrigin]: 0,
            left: 0,
            width: '100%',
            WebkitTransform: `translate${direction}(${transformSpring}%)`,
            transform: `translate${direction}(${transformSpring}%)`,
            opacity: opacitySpring
        };

        return (
            <ReactHeight key={`body${key}`} style={style} onHeightReady={this.updateHeight}>
                {Body}
            </ReactHeight>
        );
    }

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

    getFooter(key, props) {
        var {opacitySpring, Footer} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring
        };

        return (
            <div key={`footer${key}`} style={style}>
                {Footer}
            </div>
        );
    }

    getLinks(key, props) {
        var {opacitySpring, Links} = props;

        var style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: opacitySpring
        };

        return (
            <div key={`links${key}`} style={style}>
                {Links}
            </div>
        );
    }
}

