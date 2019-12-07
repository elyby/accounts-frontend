import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { changePassword } from 'services/api/accounts';
import { FormModel } from 'components/ui/form';
import ChangePassword from 'components/profile/changePassword/ChangePassword';
import { User } from 'components/user';
import { updateUser } from 'components/user/actions';

type OwnProps = {};

type Props = OwnProps & {
  updateUser: (fields: Partial<User>) => void;
};

class ChangePasswordPage extends React.Component<Props> {
  static contextTypes = {
    userId: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    goToProfile: PropTypes.func.isRequired,
  };

  form = new FormModel();

  render() {
    return <ChangePassword onSubmit={this.onSubmit} form={this.form} />;
  }

  onSubmit = () => {
    const { form } = this;

    return this.context
      .onSubmit({
        form,
        sendData: () => changePassword(this.context.userId, form.serialize()),
      })
      .then(() => {
        this.props.updateUser({
          passwordChangedAt: Date.now() / 1000,
        });
        this.context.goToProfile();
      });
  };
}

export default connect(null, {
  updateUser,
})(ChangePasswordPage);
