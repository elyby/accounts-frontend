import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PermissionsState from './PermissionsState';
import ActivationState from './ActivationState';
import ChangePasswordState from './ChangePasswordState';
import FinishState from './FinishState';

export default class CompleteState extends AbstractState {
    constructor(options = {}) {
        super(options);

        if ('accept' in options) {
            this.isPermissionsAccepted = options.accept;
            this.isUserReviewedPermissions = true;
        }
    }

    enter(context) {
        const {auth, user} = context.getState();

        if (user.isGuest) {
            context.setState(new LoginState());
        } else if (!user.isActive) {
            context.setState(new ActivationState());
        } else if (user.shouldChangePassword) {
            context.setState(new ChangePasswordState());
        } else if (auth.oauth) {
            if (auth.oauth.code) {
                context.setState(new FinishState());
            } else {
                let data = {};
                if (this.isUserReviewedPermissions) {
                    data.accept = this.isPermissionsAccepted;
                }
                context.run('oAuthComplete', data).then((resp) => {
                    switch (resp.redirectUri) {
                        case 'static_page':
                        case 'static_page_with_code':
                            context.setState(new FinishState());
                            break;
                        default:
                            location.href = resp.redirectUri;
                            break;
                    }
                }, (resp) => {
                    // TODO
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
