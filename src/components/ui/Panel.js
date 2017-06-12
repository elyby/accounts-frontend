import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';

import { omit } from 'functions';

import styles from './panel.scss';
import icons from './icons.scss';

export function Panel(props) {
    var { title, icon } = props;

    if (icon) {
        icon = (
            <button className={styles.headerControl}>
                <span className={icons[icon]} />
            </button>
        );
    }

    if (title) {
        title = (
            <PanelHeader>
                {icon}
                {title}
            </PanelHeader>
        );
    }

    return (
        <div className={styles.panel}>
            {title}

            {props.children}
        </div>
    );
}

export function PanelHeader(props) {
    return (
        <div className={styles.header} {...props}>
            {props.children}
        </div>
    );
}

export function PanelBody(props) {
    return (
        <div className={styles.body} {...props}>
            {props.children}
        </div>
    );
}

export function PanelFooter(props) {
    return (
        <div className={styles.footer} {...props}>
            {props.children}
        </div>
    );
}

export class PanelBodyHeader extends Component {
    static displayName = 'PanelBodyHeader';

    static propTypes = {
        type: PropTypes.oneOf(['default', 'error']),
        onClose: PropTypes.func
    };

    render() {
        const {type = 'default', children} = this.props;

        let close;
        if (type === 'error') {
            close = (
                <span className={styles.close} onClick={this.onClose} />
            );
        }

        const className = classNames(styles[`${type}BodyHeader`], {
            [styles.isClosed]: this.state && this.state.isClosed
        });

        return (
            <div className={className} {...omit(this.props, Object.keys(PanelBodyHeader.propTypes))}>
                {close}
                {children}
            </div>
        );
    }

    onClose = (event) => {
        event.preventDefault();

        this.setState({isClosed: true});

        this.props.onClose();
    };
}
