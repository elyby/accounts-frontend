import AbstractState from './AbstractState';
import LoginState from './LoginState';
import PermissionsState from './PermissionsState';
import ChooseAccountState from './ChooseAccountState';
import ActivationState from './ActivationState';
import AcceptRulesState from './AcceptRulesState';
import FinishState from './FinishState';

const PROMPT_ACCOUNT_CHOOSE = 'select_account';
const PROMPT_PERMISSIONS = 'consent';

export default class CompleteState extends AbstractState {
    constructor(options = {}) {
        super(options);

        this.isPermissionsAccepted = options.accept;
    }

    enter(context) {
        const {auth = {}, user, accounts} = context.getState();

        if (user.isGuest) {
            context.setState(new LoginState());
        } else if (!user.isActive) {
            context.setState(new ActivationState());
        } else if (user.shouldAcceptRules) {
            context.setState(new AcceptRulesState());
        } else if (auth.oauth && auth.oauth.clientId) {
            let isSwitcherEnabled = auth.isSwitcherEnabled;

            if (auth.oauth.loginHint) {
                const account = accounts.available.filter((account) =>
                    account.id === auth.oauth.loginHint * 1
                    || account.email === auth.oauth.loginHint
                    || account.username === auth.oauth.loginHint
                )[0];

                if (account) {
                    // disable switching, because we are know the account, user must be authorized with
                    context.run('setAccountSwitcher', false);
                    isSwitcherEnabled = false;

                    if (account.id !== accounts.active.id) {
                        // lets switch user to an account, that is needed for auth
                        return context.run('authenticate', account)
                            .then(() => context.setState(new CompleteState()));
                    }
                }
            }

            if (isSwitcherEnabled
                && (accounts.available.length > 1
                    || auth.oauth.prompt.includes(PROMPT_ACCOUNT_CHOOSE)
                )
            ) {
                context.setState(new ChooseAccountState());
            } else if (auth.oauth.code) {
                context.setState(new FinishState());
            } else {
                const data = {};
                if (typeof this.isPermissionsAccepted !== 'undefined') {
                    data.accept = this.isPermissionsAccepted;
                } else if (auth.oauth.acceptRequired || auth.oauth.prompt.includes(PROMPT_PERMISSIONS)) {
                    context.setState(new PermissionsState());
                    return;
                }
                // TODO: it seams that oAuthComplete may be a separate state
                return context.run('oAuthComplete', data).then((resp) => {
                    // TODO: пусть в стейт попадает флаг или тип авторизации
                    // вместо волшебства над редирект урлой
                    if (resp.redirectUri.indexOf('static_page') === 0) {
                        context.setState(new FinishState());
                    } else {
                        context.run('redirect', resp.redirectUri);
                        return Promise.reject(); // do not allow loader to be hidden and app to be rendered
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
