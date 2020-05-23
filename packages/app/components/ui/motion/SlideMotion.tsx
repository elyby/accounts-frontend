import React from 'react';
import { Motion, spring } from 'react-motion';

import MeasureHeight from 'app/components/MeasureHeight';

import styles from './slide-motion.scss';

interface Props {
    activeStep: number;
    children: React.ReactNode;
}

interface State {
    version: string;
    prevChildren: React.ReactNode | undefined;
    stepsHeights: Record<Props['activeStep'], number>;
}

class SlideMotion extends React.PureComponent<Props, State> {
    state: State = {
        prevChildren: undefined, // to track version updates
        version: `${this.props.activeStep}.0`,
        stepsHeights: [],
    };

    private isHeightMeasured: boolean;

    static getDerivedStateFromProps(props: Props, state: State) {
        let [, version] = state.version.split('.').map(Number);

        if (props.children !== state.prevChildren) {
            version++;
        }

        // mark this view as dirty to re-measure height
        return {
            prevChildren: props.children,
            version: `${props.activeStep}.${version}`,
        };
    }

    render() {
        const { activeStep, children } = this.props;

        const { version } = this.state;

        const activeStepHeight = this.state.stepsHeights[activeStep] || 0;

        // a hack to disable height animation on first render
        const { isHeightMeasured } = this;
        this.isHeightMeasured = isHeightMeasured || activeStepHeight > 0;

        const motionStyle = {
            transform: spring(activeStep * 100, {
                stiffness: 500,
                damping: 50,
                precision: 0.5,
            }),
            height: isHeightMeasured
                ? spring(activeStepHeight, {
                      stiffness: 500,
                      damping: 20,
                      precision: 0.5,
                  })
                : activeStepHeight,
        };

        return (
            <Motion style={motionStyle}>
                {(interpolatingStyle) => (
                    <div
                        style={{
                            overflow: 'hidden',
                            height: `${interpolatingStyle.height}px`,
                        }}
                    >
                        <div
                            className={styles.container}
                            style={{
                                WebkitTransform: `translateX(-${interpolatingStyle.transform}%)`,
                                transform: `translateX(-${interpolatingStyle.transform}%)`,
                            }}
                        >
                            {React.Children.map(children, (child, index) => (
                                <MeasureHeight
                                    className={styles.item}
                                    onMeasure={this.onStepMeasure(index)}
                                    state={version}
                                    key={index}
                                >
                                    {child}
                                </MeasureHeight>
                            ))}
                        </div>
                    </div>
                )}
            </Motion>
        );
    }

    onStepMeasure = (step: number) => (height: number) => {
        this.setState({
            stepsHeights: {
                ...this.state.stepsHeights,
                [step]: height,
            },
        });
    };
}

export default SlideMotion;
