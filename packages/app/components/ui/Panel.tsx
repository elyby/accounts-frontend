import React from 'react';
import clsx from 'clsx';
import { omit } from 'app/functions';

import styles from './panel.scss';
import icons from './icons.scss';

export function Panel(props: {
  title?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  const { title: titleText, icon: iconType } = props;
  let icon: React.ReactElement | undefined;
  let title: React.ReactElement | undefined;

  if (iconType) {
    icon = (
      <button className={styles.headerControl}>
        <span className={icons[iconType]} />
      </button>
    );
  }

  if (titleText) {
    title = (
      <PanelHeader>
        {icon}
        {titleText}
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

export function PanelHeader(props: { children: React.ReactNode }) {
  return (
    <div className={styles.header} {...props}>
      {props.children}
    </div>
  );
}

export function PanelBody(props: { children: React.ReactNode }) {
  return (
    <div className={styles.body} {...props}>
      {props.children}
    </div>
  );
}

export function PanelFooter(props: { children: React.ReactNode }) {
  return (
    <div className={styles.footer} {...props}>
      {props.children}
    </div>
  );
}

export class PanelBodyHeader extends React.Component<
  {
    type?: 'default' | 'error';
    onClose?: () => void;
    children: React.ReactNode;
  },
  {
    isClosed: boolean;
  }
> {
  state: {
    isClosed: boolean;
  } = {
    isClosed: false,
  };

  render() {
    const { type = 'default', children } = this.props;

    let close;

    if (type === 'error') {
      close = <span className={styles.close} onClick={this.onClose} />;
    }

    const className = clsx(styles[`${type}BodyHeader`], {
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

  onClose = (event: React.MouseEvent) => {
    event.preventDefault();

    const { onClose } = this.props;

    this.setState({ isClosed: true });

    if (onClose) {
      onClose();
    }
  };
}

export function PanelIcon({ icon }: { icon: string }) {
  return (
    <div className={styles.panelIcon}>
      <span className={icons[icon]} />
    </div>
  );
}
