// @flow
import type { Location } from 'react-router-dom';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { restoreScroll } from './scroll';

class ScrollIntoView extends React.PureComponent<{
  location: Location,
  top?: boolean, // do not touch any DOM and simply scroll to top on location change
}> {
  componentDidMount() {
    this.onPageUpdate();
  }

  componentDidUpdate(prevProps) {
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

    return <span ref={el => el && restoreScroll(el)} />;
  }
}

export default withRouter(ScrollIntoView);
