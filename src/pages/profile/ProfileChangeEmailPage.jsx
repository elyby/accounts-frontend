import React, { Component, PropTypes } from 'react';

import { FormModel } from 'components/ui/form';
import ChangeEmail from 'components/profile/changeEmail/ChangeEmail';

class ProfileChangeEmailPage extends Component {
    static displayName = 'ProfileChangeEmailPage';

    static propTypes = {
        email: PropTypes.string.isRequired
    };

    form = new FormModel();

    render() {
        return (
            <ChangeEmail form={this.form}
                onSubmit={this.onSubmit}
                email={this.props.email}
            />
        );
    }

    onSubmit = () => {
    };
}

import { connect } from 'react-redux';

export default connect((state) => ({
    email: state.user.email
}), {
})(ProfileChangeEmailPage);
