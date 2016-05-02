import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

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

export default class MeasureHeight extends Component {
    static displayName = 'MeasureHeight';
    static propTypes = {
        shouldMeasure: PropTypes.func,
        onMeasure: PropTypes.func,
        state: PropTypes.any
    };

    static defaultProps = {
        shouldMeasure: (prevState, newState) => prevState !== newState,
        onMeasure: () => null
    };

    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this);

        this.measure();
    }

    componentDidUpdate(prevProps) {
        if (this.props.shouldMeasure(prevProps.state, this.props.state)) {
            this.measure();
        }
    }

    render() {
        return <div {...this.props} />;
    }

    measure() {
        this.props.onMeasure(this.el.offsetHeight);
    }
}
