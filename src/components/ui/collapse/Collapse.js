// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import MeasureHeight from 'components/MeasureHeight';

import styles from './collapse.scss';

type Props = {
    isOpened?: bool,
    children: Node,
    onRest: () => void,
};

export default class Collapse extends Component<Props, {
    height: number,
    wasInitialized: bool,
}> {
    state = {
        height: 0,
        wasInitialized: false,
    };

    static defaultProps = {
        onRest: () => {},
    };

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.isOpened !== nextProps.isOpened && !this.state.wasInitialized) {
            this.setState({
                wasInitialized: true,
            });
        }
    }

    render() {
        const { isOpened, children, onRest } = this.props;
        const { height, wasInitialized } = this.state;

        return (
            <div className={styles.overflow} style={wasInitialized ? {} : { height: 0 }}>
                <MeasureHeight
                    state={this.shouldMeasureHeight()}
                    onMeasure={this.onUpdateHeight}
                >
                    <Motion
                        style={{
                            top: wasInitialized ? spring(isOpened ? 0 : -height) : -height,
                        }}
                        onRest={onRest}
                    >
                        {({top}) => (
                            <div
                                className={styles.content}
                                style={{
                                    marginTop: top,
                                    visibility: wasInitialized ? 'inherit' : 'hidden',
                                }}
                            >
                                {children}
                            </div>
                        )}
                    </Motion>
                </MeasureHeight>
            </div>
        );
    }

    onUpdateHeight = (height: number) => {
        this.setState({
            height,
        });
    };

    shouldMeasureHeight = () => {
        return [
            this.props.isOpened,
            this.state.wasInitialized,
        ].join('');
    };
}
