import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import FormModel from 'app/components/ui/form/FormModel';
import ChangeEmail, {
  ChangeEmailStep,
} from 'app/components/profile/changeEmail/ChangeEmail';
import {
  requestEmailChange,
  setNewEmail,
  confirmNewEmail,
} from 'app/services/api/accounts';
import { RootState } from 'app/reducers';

interface RouteParams {
  step: 'step1' | 'step2' | 'step3';
  code: string;
}

interface Props extends RouteComponentProps<RouteParams> {
  lang: string;
  email: string;
}

class ChangeEmailPage extends React.Component<Props> {
  static contextTypes = {
    userId: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    goToProfile: PropTypes.func.isRequired,
  };

  render() {
    const { step = 'step1', code } = this.props.match.params;

    if (step && !/^step[123]$/.test(step)) {
      // wrong param value
      return <Redirect to="/404" />;
    }

    return (
      <ChangeEmail
        onSubmit={this.onSubmit}
        email={this.props.email}
        lang={this.props.lang}
        step={(Number(step.slice(-1)) - 1) as ChangeEmailStep}
        onChangeStep={this.onChangeStep}
        code={code}
      />
    );
  }

  onChangeStep = (step: number) => {
    this.props.history.push(`/profile/change-email/step${++step}`);
  };

  onSubmit = (step: number, form: FormModel): Promise<void> => {
    return this.context
      .onSubmit({
        form,
        sendData: () => {
          const { userId } = this.context;
          const data = form.serialize();

          switch (step) {
            case 0:
              return requestEmailChange(userId, data.password).catch(
                handleErrors(),
              );
            case 1:
              return setNewEmail(userId, data.email, data.key).catch(
                handleErrors('/profile/change-email'),
              );
            case 2:
              return confirmNewEmail(userId, data.key).catch(
                handleErrors('/profile/change-email'),
              );
            default:
              throw new Error(`Unsupported step ${step}`);
          }
        },
      })
      .then(() => {
        step > 1 && this.context.goToProfile();
      });
  };
}

function handleErrors(repeatUrl: string | void) {
  return resp => {
    if (resp.errors) {
      if (resp.errors.key) {
        resp.errors.key = {
          type: resp.errors.key,
          payload: {},
        };

        if (
          ['error.key_not_exists', 'error.key_expire'].includes(
            resp.errors.key.type,
          ) &&
          repeatUrl
        ) {
          Object.assign(resp.errors.key.payload, {
            repeatUrl,
          });
        }
      }
    }

    return Promise.reject(resp);
  };
}

export default connect((state: RootState) => ({
  email: state.user.email,
  lang: state.user.lang,
}))(ChangeEmailPage);
