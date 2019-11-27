// @flow
import type { Node } from 'react';
import React, { Component } from 'react';

import classNames from 'classnames';

import { omit } from 'functions';

import styles from './panel.scss';
import icons from './icons.scss';

export function Panel(props: {
  title?: string,
  icon?: string,
  children: Node,
}) {
  let { title, icon } = props;

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

export function PanelHeader(props: { children: * }) {
  return (
    <div className={styles.header} {...props}>
      {props.children}
    </div>
  );
}

export function PanelBody(props: { children: * }) {
  return (
    <div className={styles.body} {...props}>
      {props.children}
    </div>
  );
}

export function PanelFooter(props: { children: * }) {
  return (
    <div className={styles.footer} {...props}>
      {props.children}
    </div>
  );
}

export class PanelBodyHeader extends Component<
  {
    type: 'default' | 'error',
    onClose: Function,
    children: *,
  },
  {
    isClosed: boolean,
  },
> {
  state: {
    isClosed: boolean,
  } = {
    isClosed: false,
  };

  render() {
    const { type = 'default', children } = this.props;

    let close;

    if (type === 'error') {
      close = <span className={styles.close} onClick={this.onClose} />;
    }

    const className = classNames(styles[`${type}BodyHeader`], {
      [styles.isClosed]: this.state.isClosed,
    });

    const extraProps = omit(this.props, ['type', 'onClose']);

    return (
      <div className={className} {...extraProps}>
        {close}
        {children}
      </div>
    );
  }

  onClose = (event: MouseEvent) => {
    event.preventDefault();

    this.setState({ isClosed: true });

    this.props.onClose();
  };
}

export function PanelIcon({ icon }: { icon: string }) {
  return (
    <div className={styles.panelIcon}>
      <span className={icons[icon]} />
    </div>
  );
}
