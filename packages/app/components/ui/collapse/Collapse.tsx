import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import MeasureHeight from 'app/components/MeasureHeight';

import styles from './collapse.scss';

interface Props {
    isOpened?: boolean;
    children: React.ReactNode;
    onRest: () => void;
}

interface State {
    isOpened?: boolean; // just to track value for derived updates
    height: number;
    wasInitialized: boolean;
}

export default class Collapse extends Component<Props, State> {
    state = {
        isOpened: this.props.isOpened,
        height: 0,
        wasInitialized: false,
    };

    static defaultProps: Partial<Props> = {
        onRest: () => {},
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.isOpened !== state.isOpened && !state.wasInitialized) {
            return {
                isOpened: props.isOpened,
                wasInitialized: true,
            };
        }

        return null;
    }

    render() {
        const { isOpened, children, onRest } = this.props;
        const { height, wasInitialized } = this.state;

        return (
            <div className={styles.overflow} style={wasInitialized ? {} : { height: 0 }}>
                <MeasureHeight state={this.shouldMeasureHeight()} onMeasure={this.onUpdateHeight}>
                    <Motion
                        style={{
                            top: wasInitialized ? spring(isOpened ? 0 : -height) : -height,
                        }}
                        onRest={onRest}
                    >
                        {({ top }) => (
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
        return [this.props.isOpened, this.state.wasInitialized].join('');
    };
}
