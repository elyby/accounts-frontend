import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PermissionsState from './PermissionsState';
import ActivationState from './ActivationState';
import ChangePasswordState from './ChangePasswordState';
import FinishState from './FinishState';

export default class CompleteState extends AbstractState {
    constructor(options = {}) {
        super(options);

        this.isPermissionsAccepted = options.accept;
    }

    enter(context) {
        const {auth = {}, user} = context.getState();

        if (user.isGuest) {
            context.setState(new LoginState());
        } else if (!user.isActive) {
            context.setState(new ActivationState());
        } else if (user.shouldChangePassword) {
            context.setState(new ChangePasswordState());
        } else if (auth.oauth && auth.oauth.clientId) {
            if (auth.oauth.code) {
                context.setState(new FinishState());
            } else {
                const data = {};
                if (typeof this.isPermissionsAccepted !== 'undefined') {
                    data.accept = this.isPermissionsAccepted;
                }
                context.run('oAuthComplete', data).then((resp) => {
                    // TODO: пусть в стейт попадает флаг или тип авторизации
                    // вместо волшебства над редирект урлой
                    if (resp.redirectUri.indexOf('static_page') === 0) {
                        context.setState(new FinishState());
                    } else {
                        context.run('redirect', resp.redirectUri);
                    }
                }, (resp) => {
                    if (resp.unauthorized) {
                        context.setState(new LoginState());
                    } else if (resp.acceptRequired) {
                        context.setState(new PermissionsState());
                    }
                });
            }
        } else {
            context.navigate('/');
        }
    }
}
