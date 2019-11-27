// @flow
import React from 'react';
import { FormattedRelativeTime } from 'react-intl';
import { selectUnit } from '@formatjs/intl-utils';

function RelativeTime({ timestamp }: { timestamp: number }) {
  const { unit, value }: { unit: any, value: number } = selectUnit(timestamp);

  return (
    <FormattedRelativeTime
      value={value}
      unit={unit}
      numeric="auto"
      updateIntervalInSeconds={
        ['seconds', 'minute', 'hour'].includes(unit) ? 1 : undefined
      }
    />
  );
}

export default RelativeTime;
