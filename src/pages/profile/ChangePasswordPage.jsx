import React, { Component, PropTypes } from 'react';

import accounts from 'services/api/accounts';
import { FormModel } from 'components/ui/form';
import ChangePassword from 'components/profile/changePassword/ChangePassword';

class ChangePasswordPage extends Component {
    static displayName = 'ChangePasswordPage';

    static propTypes = {
        updateUser: PropTypes.func.isRequired
    };

    static contextTypes = {
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired
    };

    form = new FormModel();

    render() {
        return (
            <ChangePassword onSubmit={this.onSubmit} form={this.form} />
        );
    }

    onSubmit = () => {
        const {form} = this;
        this.context.onSubmit({
            form,
            sendData: () => accounts.changePassword(form.serialize())
        }).then(() => {
            this.props.updateUser({
                passwordChangedAt: Date.now() / 1000,
                shouldChangePassword: false
            });
            this.context.goToProfile();
        });
    };
}

import { connect } from 'react-redux';
import { updateUser } from 'components/user/actions';

export default connect(null, {
    updateUser
})(ChangePasswordPage);
