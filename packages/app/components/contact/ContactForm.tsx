import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { FormattedMessage as Message } from 'react-intl';
import {
  Input,
  TextArea,
  Button,
  Form,
  FormModel,
  Dropdown,
} from 'app/components/ui/form';
import feedback from 'app/services/api/feedback';
import icons from 'app/components/ui/icons.scss';
import popupStyles from 'app/components/ui/popup/popup.scss';
import { RootState } from 'app/reducers';
import logger from 'app/services/logger';
import { User } from 'app/components/user';

import styles from './contactForm.scss';
import messages from './contactForm.intl.json';

const CONTACT_CATEGORIES = {
  // TODO: сюда позже проставить реальные id категорий с backend
  0: <Message {...messages.cannotAccessMyAccount} />,
  1: <Message {...messages.foundBugOnSite} />,
  2: <Message {...messages.improvementsSuggestion} />,
  3: <Message {...messages.integrationQuestion} />,
  4: <Message {...messages.other} />,
};

export class ContactForm extends React.Component<
  {
    onClose: () => void;
    user: User;
  },
  {
    isLoading: boolean;
    isSuccessfullySent: boolean;
    lastEmail: string | null;
  }
> {
  static defaultProps = {
    onClose() {},
  };

  state = {
    isLoading: false,
    isSuccessfullySent: false,
    lastEmail: null,
  };

  form = new FormModel();

  render() {
    const { isSuccessfullySent } = this.state || {};
    const { onClose } = this.props;

    return (
      <div
        data-testid="feedbackPopup"
        className={
          isSuccessfullySent ? styles.successState : styles.contactForm
        }
      >
        <div className={popupStyles.popup}>
          <div className={popupStyles.header}>
            <h2 className={popupStyles.headerTitle}>
              <Message {...messages.title} />
            </h2>
            <span
              className={clsx(icons.close, popupStyles.close)}
              onClick={onClose}
              data-testid="feedback-popup-close"
            />
          </div>

          {isSuccessfullySent ? this.renderSuccess() : this.renderForm()}
        </div>
      </div>
    );
  }

  renderForm() {
    const { form } = this;
    const { user } = this.props;
    const { isLoading } = this.state;

    return (
      <Form form={form} onSubmit={this.onSubmit} isLoading={isLoading}>
        <div className={popupStyles.body}>
          <div className={styles.philosophicalThought}>
            <Message {...messages.philosophicalThought} />
          </div>

          <div className={styles.formDisclaimer}>
            <Message {...messages.disclaimer} />
            <br />
          </div>

          <div className={styles.pairInputRow}>
            <div className={styles.pairInput}>
              <Input
                {...form.bindField('subject')}
                required
                label={messages.subject}
                skin="light"
              />
            </div>

            <div className={styles.pairInput}>
              <Input
                {...form.bindField('email')}
                required
                label={messages.email}
                type="email"
                skin="light"
                defaultValue={user.email}
              />
            </div>
          </div>

          <div className={styles.formMargin}>
            <Dropdown
              {...form.bindField('category')}
              label={messages.whichQuestion}
              items={CONTACT_CATEGORIES}
              block
            />
          </div>

          <TextArea
            {...form.bindField('message')}
            required
            label={messages.message}
            skin="light"
            minRows={6}
            maxRows={6}
          />
        </div>

        <div className={styles.footer}>
          <Button
            label={messages.send}
            block
            type="submit"
            disabled={isLoading}
          />
        </div>
      </Form>
    );
  }

  renderSuccess() {
    const { lastEmail: email } = this.state;
    const { onClose } = this.props;

    return (
      <div>
        <div className={styles.successBody}>
          <span className={styles.successIcon} />
          <div className={styles.successDescription}>
            <Message {...messages.youMessageReceived} />
          </div>
          <div className={styles.sentToEmail}>{email}</div>
        </div>

        <div className={styles.footer}>
          <Button
            label={messages.close}
            block
            onClick={onClose}
            data-testid="feedback-popup-close-button"
          />
        </div>
      </div>
    );
  }

  onSubmit = (): Promise<void> => {
    if (this.state.isLoading) {
      return Promise.resolve();
    }

    this.setState({ isLoading: true });

    return feedback
      .send(this.form.serialize())
      .then(() =>
        this.setState({
          isSuccessfullySent: true,
          lastEmail: this.form.value('email'),
        }),
      )
      .catch((resp) => {
        if (resp.errors) {
          this.form.setErrors(resp.errors);

          return;
        }

        logger.warn('Error sending feedback', resp);
      })
      .finally(() => this.setState({ isLoading: false }));
  };
}

export default connect((state: RootState) => ({
  user: state.user,
}))(ContactForm);
