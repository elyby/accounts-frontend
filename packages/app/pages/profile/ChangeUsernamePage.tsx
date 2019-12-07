import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { updateUser } from 'app/components/user/actions';
import { RootState } from 'app/reducers';
import { changeUsername } from 'app/services/api/accounts';
import { FormModel } from 'app/components/ui/form';
import ChangeUsername from 'app/components/profile/changeUsername/ChangeUsername';

type OwnProps = {};

type Props = {
  username: string;
  updateUsername: (username: string) => void;
};

class ChangeUsernamePage extends React.Component<Props> {
  static contextTypes = {
    userId: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    goToProfile: PropTypes.func.isRequired,
  };

  form = new FormModel();

  actualUsername: string;

  componentWillMount() {
    this.actualUsername = this.props.username;
  }

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
  (state: RootState) => ({
    username: state.user.username,
  }),
  {
    updateUsername: username => updateUser({ username }),
  },
)(ChangeUsernamePage);
