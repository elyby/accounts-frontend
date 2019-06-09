// @flow
import React, { PureComponent } from 'react';

import { omit, debounce } from 'functions';

/**
 * MeasureHeight is a component that allows you to measure the height of elements wrapped.
 *
 * Each time the height changed, the `onMeasure` prop will be called.
 * On each component update the `shouldMeasure` prop is being called and depending of
 * the value returned will be decided whether to call `onMeasure`.
 * By default `shouldMeasure` will compare the old and new values of the `state` prop.
 * Both `shouldMeasure` and `state` can be used to reduce the amount of measures, which
 * will reduce the count of forced reflows in browser.
 *
 * Usage:
 * <MeasureHeight
 *     state={theValueToInvalidateCurrentMeasure}
 *     onMeasure={this.onUpdateContextHeight}
 * >
 *     <div>some content here</div>
 *     <div>which may be multiple children</div>
 * </MeasureHeight>
 */

type ChildState = mixed;

export default class MeasureHeight extends PureComponent<{
    shouldMeasure: (prevState: ChildState, newState: ChildState) => bool,
    onMeasure: (height: number) => void,
    state: ChildState
}> {
    static defaultProps = {
        shouldMeasure: (prevState: ChildState, newState: ChildState) => prevState !== newState,
        onMeasure: (height: number) => {} // eslint-disable-line
    };

    el: ?HTMLDivElement;

    componentDidMount() {
        // we want to measure height immediately on first mount to avoid ui laggs
        this.measure();
        window.addEventListener('resize', this.enqueueMeasurement);
    }

    componentDidUpdate(prevProps: typeof MeasureHeight.prototype.props) {
        if (this.props.shouldMeasure(prevProps.state, this.props.state)) {
            this.enqueueMeasurement();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.enqueueMeasurement);
    }

    render() {
        const props: Object = omit(this.props, [
            'shouldMeasure',
            'onMeasure',
            'state'
        ]);

        return <div {...props} ref={(el: HTMLDivElement) => this.el = el} />;
    }

    measure = () => {
        requestAnimationFrame(() => {this.el && this.props.onMeasure(this.el.offsetHeight);});
    };

    enqueueMeasurement = debounce(this.measure);
}
