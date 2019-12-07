import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchUserData } from 'app/components/user/actions';
import { create as createPopup } from 'app/components/ui/popup/actions';
import PasswordRequestForm from 'app/components/profile/passwordRequestForm/PasswordRequestForm';
import logger from 'app/services/logger';
import { browserHistory } from 'app/services/history';
import { FooterMenu } from 'app/components/footerMenu';
import Profile from 'app/components/profile/Profile';
import ChangePasswordPage from 'app/pages/profile/ChangePasswordPage';
import ChangeUsernamePage from 'app/pages/profile/ChangeUsernamePage';
import ChangeEmailPage from 'app/pages/profile/ChangeEmailPage';
import MultiFactorAuthPage from 'app/pages/profile/MultiFactorAuthPage';
import { FormModel } from 'app/components/ui/form';
import { RootState } from 'app/reducers';

import styles from './profile.scss';

interface Props {
  userId: number;
  onSubmit: (options: {
    form: FormModel;
    sendData: () => Promise<any>;
  }) => void;
  fetchUserData: () => Promise<any>;
}

class ProfilePage extends React.Component<Props> {
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

export default connect(
  (state: RootState) => ({
    userId: state.user.id,
  }),
  {
    fetchUserData,
    onSubmit: ({
      form,
      sendData,
    }: {
      form: FormModel;
      sendData: () => Promise<any>;
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
              Popup(props: { onClose: () => Promise<any> }) {
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
