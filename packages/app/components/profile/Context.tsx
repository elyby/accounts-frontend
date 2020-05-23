import React from 'react';
import { FormModel } from 'app/components/ui/form';

export interface ProfileContext {
    userId: number;
    onSubmit: (options: { form: FormModel; sendData: () => Promise<any> }) => Promise<void>;
    goToProfile: () => Promise<void>;
}

const Context = React.createContext<ProfileContext>({
    userId: 0,
    async onSubmit() {},
    async goToProfile() {},
});
Context.displayName = 'ProfileContext';

export const { Provider, Consumer } = Context;

export default Context;
