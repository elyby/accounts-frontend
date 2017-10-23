// @flow
import React, { PureComponent } from 'react';

import { omit, rAF, debounce } from 'functions';

/**
 * MeasureHeight is a component that allows you to measure the height of elements wrapped.
 *
 * Each time the height changed, the `onMeasure` prop will be called.
 * On each component update the `shouldMeasure` prop is being called and depending of
 * the value returned will be decided whether to call `onMeasure`.
 * By default `shouldMeasure` will compare the old and new values of the `state` prop.
 * Both `shouldMeasure` and `state` can be used to reduce the amount of meausres, which
 * will recude the count of forced reflows in browser.
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

export default class MeasureHeight extends PureComponent<{
    shouldMeasure: (prevState: any, newState: any) => bool,
    onMeasure: (height: number) => void,
    state: any
}> {
    static defaultProps = {
        shouldMeasure: (prevState: any, newState: any) => prevState !== newState,
        onMeasure: (height) => {} // eslint-disable-line
    };

    el: ?HTMLDivElement;

    componentDidMount() {
        this.measure();
        window.addEventListener('resize', this.measure);
    }

    componentDidUpdate(prevProps: typeof MeasureHeight.prototype.props) {
        if (this.props.shouldMeasure(prevProps.state, this.props.state)) {
            this.measure();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.measure);
    }

    render() {
        const props: Object = omit(this.props, [
            'shouldMeasure',
            'onMeasure',
            'state'
        ]);

        return <div {...props} ref={(el: HTMLDivElement) => this.el = el} />;
    }

    measure = debounce(() => {
        rAF(() => this.el && this.props.onMeasure(this.el.offsetHeight));
    });
}
