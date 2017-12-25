import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { IntlProvider as OrigIntlProvider } from 'react-intl';

class IntlProvider extends Component {
    static displayName = 'IntlProvider';
    static propTypes = {
        locale: PropTypes.string,
        messages: PropTypes.objectOf(PropTypes.string),
        children: PropTypes.element
    };

    render() {
        return (
            <OrigIntlProvider locale="en" {...this.props} />
        );
    }
}


import { connect } from 'react-redux';

export default connect(({i18n}) => i18n)(IntlProvider);
