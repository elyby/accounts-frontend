import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PermissionsState from './PermissionsState';
import ActivationState from './ActivationState';
import ChangePasswordState from './ChangePasswordState';

export default class CompleteState extends AbstractState {
    enter(context) {
        const {auth, user} = context.getState();

        if (user.isGuest) {
            context.setState(new LoginState());
        } else if (!user.isActive) {
            context.setState(new ActivationState());
        } else if (user.shouldChangePassword) {
            context.setState(new ChangePasswordState());
        } else if (auth.oauth) {
            context.run('oAuthComplete').then((resp) => {
                location.href = resp.redirectUri;
            }, (resp) => {
                // TODO
                if (resp.unauthorized) {
                    context.setState(new LoginState());
                } else if (resp.acceptRequired) {
                    context.setState(new PermissionsState());
                }
            });
        } else {
            context.navigate('/');
        }
    }
}
