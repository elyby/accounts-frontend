import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';

import { oAuthValidate, oAuthComplete } from 'components/auth/actions';

class OAuthInit extends Component {
    static displayName = 'OAuthInit';

    static propTypes = {
        query: PropTypes.shape({
            client_id: PropTypes.string.isRequired,
            redirect_uri: PropTypes.string.isRequired,
            response_type: PropTypes.string.isRequired,
            scope: PropTypes.string.isRequired,
            state: PropTypes.string
        }),
        validate: PropTypes.func.isRequired
    };

    componentWillMount() {
        const {query} = this.props;

        this.props.validate({
            clientId: query.client_id,
            redirectUrl: query.redirect_uri,
            responseType: query.response_type,
            scope: query.scope,
            state: query.state
        }).then(this.props.complete);
    }

    render() {
        return <span />;
    }
}

export default connect((state) => ({
    query: state.routing.location.query
}), {
    validate: oAuthValidate,
    complete: oAuthComplete
})(OAuthInit);
