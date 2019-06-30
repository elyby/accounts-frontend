// @flow
import type { User } from 'components/user';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { changePassword } from 'services/api/accounts';
import { FormModel } from 'components/ui/form';
import ChangePassword from 'components/profile/changePassword/ChangePassword';

type OwnProps = {|
|};

type Props = {
    ...OwnProps,
    updateUser: (fields: $Shape<User>) => void;
}

class ChangePasswordPage extends Component<Props> {
    static displayName = 'ChangePasswordPage';

    static contextTypes = {
        userId: PropTypes.number.isRequired,
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired,
    };

    form = new FormModel();

    render() {
        return (
            <ChangePassword onSubmit={this.onSubmit} form={this.form} />
        );
    }

    onSubmit = () => {
        const {form} = this;
        return this.context.onSubmit({
            form,
            sendData: () => changePassword(this.context.userId, form.serialize()),
        }).then(() => {
            this.props.updateUser({
                passwordChangedAt: Date.now() / 1000
            });
            this.context.goToProfile();
        });
    };
}

import { connect } from 'react-redux';
import { updateUser } from 'components/user/actions';

export default connect<Props, OwnProps, _, _, _, _>(null, {
    updateUser,
})(ChangePasswordPage);
