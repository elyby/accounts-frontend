import { RouteComponentProps } from 'react-router-dom';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { restoreScroll } from './scroll';

interface OwnProps {
    top?: boolean; // don't touch any DOM and simply scroll to top on location change
}

type Props = RouteComponentProps & OwnProps;

class ScrollIntoView extends React.PureComponent<Props> {
    componentDidMount() {
        this.onPageUpdate();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.location !== prevProps.location) {
            this.onPageUpdate();
        }
    }

    onPageUpdate() {
        if (this.props.top) {
            restoreScroll();
        }
    }

    render() {
        if (this.props.top) {
            return null;
        }

        return <span ref={(el) => el && restoreScroll(el)} />;
    }
}

export default withRouter(ScrollIntoView);
