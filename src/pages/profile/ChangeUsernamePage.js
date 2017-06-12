import React, { Component, PropTypes } from 'react';

import accounts from 'services/api/accounts';
import { FormModel } from 'components/ui/form';
import ChangeUsername from 'components/profile/changeUsername/ChangeUsername';

class ChangeUsernamePage extends Component {
    static displayName = 'ChangeUsernamePage';

    static propTypes = {
        username: PropTypes.string.isRequired,
        updateUsername: PropTypes.func.isRequired
    };

    static contextTypes = {
        onSubmit: PropTypes.func.isRequired,
        goToProfile: PropTypes.func.isRequired
    };

    form = new FormModel();

    componentWillMount() {
        this.actualUsername = this.props.username;
    }

    componentWillUnmount() {
        this.props.updateUsername(this.actualUsername);
    }

    render() {
        return (
            <ChangeUsername form={this.form}
                onSubmit={this.onSubmit}
                onChange={this.onUsernameChange}
                username={this.props.username}
            />
        );
    }

    onUsernameChange = (username) => {
        this.props.updateUsername(username);
    };

    onSubmit = () => {
        const {form} = this;
        if (this.actualUsername === this.props.username) {
            this.context.goToProfile();
            return Promise.resolve();
        }

        return this.context.onSubmit({
            form,
            sendData: () => accounts.changeUsername(form.serialize())
        }).then(() => {
            this.actualUsername = form.value('username');

            this.context.goToProfile();
        });
    };
}

import { connect } from 'react-redux';
import { updateUser } from 'components/user/actions';

export default connect((state) => ({
    username: state.user.username
}), {
    updateUsername: (username) => updateUser({username})
})(ChangeUsernamePage);
