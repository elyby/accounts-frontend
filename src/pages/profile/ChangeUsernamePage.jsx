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
        this.setState({
            actualUsername: this.props.username
        });
    }

    componentWillUnmount() {
        this.props.updateUsername(this.state.actualUsername);
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
        if (this.state.actualUsername === this.props.username) {
            this.context.goToProfile();
            return;
        }

        this.context.onSubmit({
            form,
            sendData: () => accounts.changeUsername(form.serialize())
        }).then(() => {
            this.props.updateUsername(form.value('username'));

            this.setState({
                actualUsername: this.props.username
            });
        });
    };
}

import { connect } from 'react-redux';
import { updateUser } from 'components/user/actions';

export default connect((state) => ({
    username: state.user.username
}), {
    updateUsername: (username) => {
        return updateUser({username});
    }
})(ChangeUsernamePage);
