import AbstractState from './AbstractState';
import { AuthContext } from './AuthFlow';
import CompleteState from './CompleteState';

export default class DeviceCodeState extends AbstractState {
    async resolve(context: AuthContext, payload: { user_code: string }): Promise<void> {
        const { query } = context.getRequest();

        context
            .run('oAuthValidate', {
                params: {
                    userCode: payload.user_code,
                },
                description: query.get('description')!,
                prompt: query.get('prompt')!,
            })
            .then(() => context.setState(new CompleteState()))
            .catch((err) => {
                if (err.error === 'invalid_user_code') {
                    return context.run('setErrors', { [err.parameter]: err.error });
                }

                throw err;
            });
    }
}
