import React, { ComponentType } from 'react';
import { ApplicationType } from 'app/components/dev/apps';
import { MessageDescriptor } from 'react-intl';
import { SKIN_LIGHT } from 'app/components/ui';
import { Radio } from 'app/components/ui/form';

import styles from './applicationTypeSwitcher.scss';

interface Props {
  appTypes: Record<ApplicationType, MessageDescriptor>;
  selectedType: ApplicationType | null;
  setType: (type: ApplicationType) => void;
}

const ApplicationTypeSwitcher: ComponentType<Props> = ({
  appTypes,
  selectedType,
  setType,
}) => (
  <div>
    {((Object.keys(appTypes) as unknown) as Array<ApplicationType>).map(
      (type) => (
        <div className={styles.radioContainer} key={type}>
          <Radio
            onChange={() => setType(type)}
            skin={SKIN_LIGHT}
            label={appTypes[type]}
            value={type}
            checked={selectedType === type}
          />
        </div>
      ),
    )}
  </div>
);

export default ApplicationTypeSwitcher;
