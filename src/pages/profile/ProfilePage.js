// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { fetchUserData } from 'components/user/actions';
import { create as createPopup } from 'components/ui/popup/actions';
import PasswordRequestForm from 'components/profile/passwordRequestForm/PasswordRequestForm';
import logger from 'services/logger';
import { browserHistory } from 'services/history';
import { FooterMenu } from 'components/footerMenu';
import Profile from 'components/profile/Profile';
import ChangePasswordPage from 'pages/profile/ChangePasswordPage';
import ChangeUsernamePage from 'pages/profile/ChangeUsernamePage';
import ChangeEmailPage from 'pages/profile/ChangeEmailPage';
import MultiFactorAuthPage from 'pages/profile/MultiFactorAuthPage';

import styles from './profile.scss';

import type { FormModel } from 'components/ui/form';

type OwnProps = {||};

type Props = {
  ...OwnProps,
  userId: number,
  onSubmit: ({ form: FormModel, sendData: () => Promise<*> }) => void,
  fetchUserData: () => Promise<*>,
};

class ProfilePage extends Component<Props> {
  static childContextTypes = {
    userId: PropTypes.number,
    onSubmit: PropTypes.func,
    goToProfile: PropTypes.func,
  };

  getChildContext() {
    return {
      userId: this.props.userId,
      onSubmit: this.props.onSubmit,
      goToProfile: () => this.props.fetchUserData().then(this.goToProfile),
    };
  }

  render() {
    return (
      <div className={styles.container}>
        <Switch>
          <Route
            path="/profile/mfa/step:step([1-3])"
            component={MultiFactorAuthPage}
          />
          <Route path="/profile/mfa" exact component={MultiFactorAuthPage} />
          <Route
            path="/profile/change-password"
            exact
            component={ChangePasswordPage}
          />
          <Route
            path="/profile/change-username"
            exact
            component={ChangeUsernamePage}
          />
          <Route
            path="/profile/change-email/:step?/:code?"
            component={ChangeEmailPage}
          />
          <Route path="/profile" exact component={Profile} />
          <Route path="/" exact component={Profile} />
          <Redirect to="/404" />
        </Switch>

        <div className={styles.footer}>
          <FooterMenu />
        </div>
      </div>
    );
  }

  goToProfile = () => browserHistory.push('/');
}

export default connect<Props, OwnProps, _, _, _, _>(
  state => ({
    userId: state.user.id,
  }),
  {
    fetchUserData,
    onSubmit: ({
      form,
      sendData,
    }: {
      form: FormModel,
      sendData: () => Promise<*>,
    }) => dispatch => {
      form.beginLoading();

      return sendData()
        .catch(resp => {
          const requirePassword = resp.errors && !!resp.errors.password;

          // prevalidate user input, because requestPassword popup will block the
          // entire form from input, so it must be valid
          if (resp.errors) {
            delete resp.errors.password;

            if (resp.errors.email && resp.data && resp.data.canRepeatIn) {
              resp.errors.email = {
                type: resp.errors.email,
                payload: {
                  msLeft: resp.data.canRepeatIn * 1000,
                },
              };
            }

            if (Object.keys(resp.errors).length) {
              form.setErrors(resp.errors);

              return Promise.reject(resp);
            }

            if (requirePassword) {
              return requestPassword(form);
            }
          }

          return Promise.reject(resp);
        })
        .catch(resp => {
          if (!resp || !resp.errors) {
            logger.warn('Unexpected profile editing error', {
              resp,
            });
          } else {
            return Promise.reject(resp);
          }
        })
        .finally(() => form.endLoading());

      function requestPassword(form) {
        return new Promise((resolve, reject) => {
          dispatch(
            createPopup({
              Popup(props: { onClose: Function }) {
                const onSubmit = () => {
                  form.beginLoading();

                  sendData()
                    .then(resolve)
                    .then(props.onClose)
                    .catch(resp => {
                      if (resp.errors) {
                        form.setErrors(resp.errors);

                        const parentFormHasErrors =
                          Object.keys(resp.errors).filter(
                            name => name !== 'password',
                          ).length > 0;

                        if (parentFormHasErrors) {
                          // something wrong with parent form, hidding popup and show that form
                          props.onClose();
                          reject(resp);
                          logger.warn(
                            'Profile: can not submit pasword popup due to errors in source form',
                            { resp },
                          );
                        }
                      } else {
                        return Promise.reject(resp);
                      }
                    })
                    .finally(() => form.endLoading());
                };

                return <PasswordRequestForm form={form} onSubmit={onSubmit} />;
              },
              disableOverlayClose: true,
            }),
          );
        });
      }
    },
  },
)(ProfilePage);
