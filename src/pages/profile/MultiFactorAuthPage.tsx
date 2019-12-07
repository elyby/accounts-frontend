import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MultiFactorAuth, { MfaStep } from 'components/profile/multiFactorAuth';
import { FormModel } from 'components/ui/form';
import { User } from 'components/user';
import { RootState } from 'reducers';

interface Props
  extends RouteComponentProps<{
    step?: '1' | '2' | '3';
  }> {
  user: User;
}

class MultiFactorAuthPage extends React.Component<Props> {
  static contextTypes = {
    onSubmit: PropTypes.func.isRequired,
    goToProfile: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const { step } = this.props.match.params;
    const { user } = this.props;

    if (step) {
      if (!/^[1-3]$/.test(step)) {
        // wrong param value
        this.props.history.push('/404');

        return;
      }

      if (user.isOtpEnabled) {
        this.props.history.push('/mfa');
      }
    }
  }

  render() {
    const { user } = this.props;

    return (
      <MultiFactorAuth
        isMfaEnabled={user.isOtpEnabled}
        onSubmit={this.onSubmit}
        step={this.getStep()}
        onChangeStep={this.onChangeStep}
        onComplete={this.onComplete}
      />
    );
  }

  getStep(): MfaStep {
    const step = Number(this.props.match.params.step) - 1;

    if (step !== 0 && step !== 1 && step !== 2) {
      return 1;
    }

    return step;
  }

  onChangeStep = (step: MfaStep) => {
    this.props.history.push(`/profile/mfa/step${step + 1}`);
  };

  onSubmit = (form: FormModel, sendData: () => Promise<void>) => {
    return this.context.onSubmit({
      form,
      sendData,
    });
  };

  onComplete = () => {
    this.context.goToProfile();
  };
}

export default connect(({ user }: RootState) => ({ user }))(
  MultiFactorAuthPage,
);
