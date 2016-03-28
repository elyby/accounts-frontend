import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class MeasureHeight extends Component {
    static displayName = 'MeasureHeight';
    static propTypes = {
        shouldMeasure: PropTypes.func,
        onMeasure: PropTypes.func
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
