import React from 'react';

import { connect } from 'app/functions';
import { updateUser } from 'app/components/user/actions';
import { changeUsername } from 'app/services/api/accounts';
import { FormModel } from 'app/components/ui/form';
import ChangeUsername from 'app/components/profile/changeUsername/ChangeUsername';
import Context from 'app/components/profile/Context';

type Props = {
    username: string;
    updateUsername: (username: string) => void;
};

class ChangeUsernamePage extends React.Component<Props> {
    static contextType = Context;
    declare context: React.ContextType<typeof Context>;

    form = new FormModel();

    actualUsername: string = this.props.username;

    componentWillUnmount() {
        this.props.updateUsername(this.actualUsername);
    }

    render() {
        return (
            <ChangeUsername
                form={this.form}
                onSubmit={this.onSubmit}
                onChange={this.onUsernameChange}
                username={this.props.username}
            />
        );
    }

    onUsernameChange = (username: string) => {
        this.props.updateUsername(username);
    };

    onSubmit = () => {
        const { form } = this;

        if (this.actualUsername === this.props.username) {
            this.context.goToProfile();

            return Promise.resolve();
        }

        return this.context
            .onSubmit({
                form,
                sendData: () => {
                    const { username, password } = form.serialize();

                    return changeUsername(this.context.userId, username, password);
                },
            })
            .then(() => {
                this.actualUsername = form.value('username');

                this.context.goToProfile();
            });
    };
}

export default connect(
    (state) => ({
        username: state.user.username,
    }),
    {
        updateUsername: (username: string) => updateUser({ username }),
    },
)(ChangeUsernamePage);
