import React from 'react';
import { FormattedMessage as Message } from 'react-intl';
import { Helmet } from 'react-helmet';
import { MessageDescriptor } from 'react-intl';
import { OauthAppResponse } from 'services/api/oauth';
import { ApplicationType } from 'components/dev/apps';
import { Form, FormModel, Button } from 'components/ui/form';
import { BackButton } from 'components/profile/ProfileForm';
import { COLOR_GREEN } from 'components/ui';
import { TYPE_APPLICATION, TYPE_MINECRAFT_SERVER } from 'components/dev/apps';
import styles from 'components/profile/profileForm.scss';
import logger from 'services/logger';
import messages from './ApplicationForm.intl.json';

import ApplicationTypeSwitcher from './ApplicationTypeSwitcher';
import WebsiteType from './WebsiteType';
import MinecraftServerType from './MinecraftServerType';

const typeToForm: {
  [K in ApplicationType]: {
    label: MessageDescriptor;
    component: React.ComponentType<any>;
  };
} = {
  [TYPE_APPLICATION]: {
    label: messages.website,
    component: WebsiteType,
  },
  [TYPE_MINECRAFT_SERVER]: {
    label: messages.minecraftServer,
    component: MinecraftServerType,
  },
};

const typeToLabel = Object.keys(typeToForm).reduce(
  (result, key: ApplicationType) => {
    result[key] = typeToForm[key].label;

    return result;
  },
  {} as {
    [K in ApplicationType]: MessageDescriptor;
  },
);

export default class ApplicationForm extends React.Component<{
  app: OauthAppResponse;
  form: FormModel;
  displayTypeSwitcher?: boolean;
  type: ApplicationType | null;
  setType: (type: ApplicationType) => void;
  onSubmit: (form: FormModel) => Promise<void>;
}> {
  static defaultProps = {
    setType: () => {},
  };

  render() {
    const { type, setType, form, displayTypeSwitcher, app } = this.props;
    const { component: FormComponent } = (type && typeToForm[type]) || {};
    const isUpdate = app.clientId !== '';

    return (
      <Form form={form} onSubmit={this.onFormSubmit}>
        <div className={styles.contentWithBackButton}>
          <BackButton to="/dev/applications" />

          <div className={styles.form}>
            <div className={styles.formBody}>
              <Message
                {...(isUpdate
                  ? messages.updatingApplication
                  : messages.creatingApplication)}
              >
                {(pageTitle: string) => (
                  <h3 className={styles.title}>
                    <Helmet title={pageTitle} />
                    {pageTitle}
                  </h3>
                )}
              </Message>

              {displayTypeSwitcher && (
                <div className={styles.formRow}>
                  <ApplicationTypeSwitcher
                    selectedType={type}
                    setType={setType}
                    appTypes={typeToLabel}
                  />
                </div>
              )}

              {FormComponent ? (
                <FormComponent form={form} app={app} />
              ) : (
                <div className={styles.formRow}>
                  <p className={styles.description}>
                    <Message
                      {...messages.toDisplayRegistrationFormChooseType}
                    />
                  </p>
                </div>
              )}
            </div>
          </div>

          {!!FormComponent && (
            <Button
              color={COLOR_GREEN}
              block
              label={
                isUpdate
                  ? messages.updateApplication
                  : messages.createApplication
              }
              type="submit"
            />
          )}
        </div>
      </Form>
    );
  }

  onFormSubmit = async () => {
    const { form } = this.props;

    try {
      await this.props.onSubmit(form);
    } catch (resp) {
      if (resp.errors) {
        form.setErrors(resp.errors);

        return;
      }

      logger.unexpected(new Error('Error submitting application form'), resp);
    }
  };
}
