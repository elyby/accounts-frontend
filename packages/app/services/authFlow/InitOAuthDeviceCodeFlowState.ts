import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';
import DeviceCodeState from './DeviceCodeState';

export default class InitOAuthDeviceCodeFlowState extends AbstractState {
    async enter(context: AuthContext): Promise<void> {
        const { query } = context.getRequest();

        const userCode = query.get('user_code');

        if (userCode) {
            try {
                await context.run('oAuthValidate', {
                    params: { userCode },
                    description: query.get('description')!,
                    prompt: query.get('prompt')!,
                });

                return context.setState(new CompleteState());
            } catch {
                // Ok, fallback to the default
            }
        }

        return context.setState(new DeviceCodeState());
    }
}
