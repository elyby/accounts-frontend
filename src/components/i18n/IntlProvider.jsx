import React, { Component, PropTypes } from 'react';

import { IntlProvider as OrigIntlProvider } from 'react-intl';

class IntlProvider extends Component {
    static displayName = 'IntlProvider';
    static propTypes = {
        locale: PropTypes.string.isRequired,
        messages: PropTypes.objectOf(PropTypes.string).isRequired,
        children: PropTypes.element
    };

    render() {
        return (
            <OrigIntlProvider {...this.props} />
        );
    }
}


import { connect } from 'react-redux';

export default connect(({i18n}) => i18n)(IntlProvider);
