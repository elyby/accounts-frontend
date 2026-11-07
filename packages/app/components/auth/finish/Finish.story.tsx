import React from 'react';

import { FinishResult } from './Finish';

export default { title: 'Components/Auth/Finish' };

export const Success = () => <FinishResult appName="Minecraft Launcher" success />;

export const Declined = () => <FinishResult appName="Minecraft Launcher" success={false} />;
