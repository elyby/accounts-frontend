// @flow
import type { ApplicationType } from 'components/dev/apps';
import type { MessageDescriptor } from 'react-intl';
import React from 'react';
import { SKIN_LIGHT } from 'components/ui';
import { Radio } from 'components/ui/form';

import styles from './applicationTypeSwitcher.scss';

export default function ApplicationTypeSwitcher({
  setType,
  appTypes,
  selectedType,
}: {
  appTypes: {
    [key: ApplicationType]: MessageDescriptor,
  },
  selectedType: ?ApplicationType,
  setType: (type: ApplicationType) => void,
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
