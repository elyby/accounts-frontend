import React, { Component } from 'react';
import { connect } from 'react-redux';

import { TransitionMotion, spring } from 'react-motion';

import AppInfo from 'components/auth/AppInfo';

import styles from './auth.scss';

const springConfig = [200, 20];

class AuthPage extends Component {
    displayName = 'AuthPage';

    render() {
        var appInfo = {
            name: 'TLauncher',
            description: `Лучший альтернативный лаунчер для Minecraft с большим количеством версий и их модификаций, а также возмоностью входа как с лицензионным аккаунтом, так и без него.`
        };

        var { path, children } = this.props;

        return (
            <div>
                <div className={styles.sidebar}>
                    <AppInfo {...appInfo} />
                </div>
                <div className={styles.content}>
                    <TransitionMotion
                        willEnter={this.willEnter}
                        willLeave={this.willLeave}
                        styles={{
                            [path]: {
                                children,
                                x: spring(0, springConfig)
                            }
                        }}
                    >
                        {(items) => (
                            <div style={{position: 'relative', overflow: 'hidden', width: '100%', height: '600px'}}>
                                {Object.keys(items).map((path) => {
                                    const {children, x} = items[path];

                                    const style = {
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateX(${x}%)`
                                    };

                                    return (
                                        <div key={path} style={style}>
                                            {children}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TransitionMotion>
                </div>
            </div>
        );
    }

    willEnter(key, styles) {
        return {
            ...styles,
            x: spring(100, springConfig)
        };
    }

    willLeave(key, styles) {
        return {
            ...styles,
            x: spring(-100, springConfig)
        };
    }
}

export default connect((state) => ({
    path: state.routing.location.pathname
}))(AuthPage);
