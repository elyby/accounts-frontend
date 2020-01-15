import React, { ComponentType, useEffect, useState } from 'react';

import logger from 'app/services/logger/logger';

import BSoD from './BSoD';

const BSoDContainer: ComponentType = () => {
  const [lastEventId, setLastEventId] = useState<string>();
  useEffect(() => {
    const timer = setInterval(() => {
      // eslint-disable-next-line no-shadow
      const lastEventId = logger.getLastEventId();

      if (!lastEventId) {
        return;
      }

      clearInterval(timer);
      setLastEventId(lastEventId);
    }, 500);

    // Don't care about interval cleanup because there is no way from
    // BSoD state and page can be only reloaded
  }, []);

  return <BSoD lastEventId={lastEventId} />;
};

export default BSoDContainer;
