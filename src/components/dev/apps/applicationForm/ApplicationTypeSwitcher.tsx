import React from 'react';
import { ApplicationType } from 'components/dev/apps';
import { MessageDescriptor } from 'react-intl';
import { SKIN_LIGHT } from 'components/ui';
import { Radio } from 'components/ui/form';

import styles from './applicationTypeSwitcher.scss';

export default function ApplicationTypeSwitcher({
  setType,
  appTypes,
  selectedType,
}: {
  appTypes: {
    [K in ApplicationType]: MessageDescriptor;
  };
  selectedType: ApplicationType | null;
  setType: (type: ApplicationType) => void;
}) {
  return (
    <div>
      {Object.keys(appTypes).map((type: ApplicationType) => (
        <div className={styles.radioContainer} key={type}>
          <Radio
            onChange={() => setType(type)}
            skin={SKIN_LIGHT}
            label={appTypes[type]}
            value={type}
            checked={selectedType === type}
          />
        </div>
      ))}
    </div>
  );
}
