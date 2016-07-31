import { routeActions } from 'react-router-redux';

import { updateUser, logout as logoutUser, changePassword as changeUserPassword, authenticate } from 'components/user/actions';
import authentication from 'services/api/authentication';
import oauth from 'services/api/oauth';
import signup from 'services/api/signup';

export function login({login = '', password = '', rememberMe = false}) {
    const PASSWORD_REQUIRED = 'error.password_required';
    const LOGIN_REQUIRED = 'error.login_required';
    const ACTIVATION_REQUIRED = 'error.account_not_activated';

    return wrapInLoader((dispatch) =>
        authentication.login(
            {login, password, rememberMe}
        )
        .then(authHandler(dispatch))
        .catch((resp) => {
            if (resp.errors) {
                if (resp.errors.password === PASSWORD_REQUIRED) {
                    return dispatch(updateUser({
                        username: login,
                        email: login
                    }));
                } else if (resp.errors.login === ACTIVATION_REQUIRED) {
                    return dispatch(needActivation());
                } else if (resp.errors.login === LOGIN_REQUIRED && password) {
                    // return to the first step
                    dispatch(logout());
                }
            }

            return validationErrorsHandler(dispatch)(resp);
        })
    );
}

export function changePassword({
    password = '',
    newPassword = '',
    newRePassword = ''
}) {
    return wrapInLoader((dispatch) =>
        dispatch(changeUserPassword({password, newPassword, newRePassword, logoutAll: false}))
            .catch(validationErrorsHandler(dispatch))
    );
}

export function forgotPassword({
    login = ''
}) {
    return wrapInLoader((dispatch, getState) =>
        authentication.forgotPassword({login})
            .then(({data = {}}) => dispatch(updateUser({
                maskedEmail: data.emailMask || getState().user.email
            })))
            .catch(validationErrorsHandler(dispatch))
    );
}

export function recoverPassword({
    key = '',
    newPassword = '',
    newRePassword = ''
}) {
    return wrapInLoader((dispatch) =>
        authentication.recoverPassword({key, newPassword, newRePassword})
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/forgot-password'))
    );
}

export function register({
    email = '',
    username = '',
    password = '',
    rePassword = '',
    rulesAgreement = false
}) {
    return wrapInLoader((dispatch, getState) =>
        signup.register({
            email, username,
            password, rePassword,
            rulesAgreement, lang: getState().user.lang
        })
        .then(() => {
            dispatch(updateUser({
                username,
                email
            }));
            dispatch(needActivation());
            dispatch(routeActions.push('/activation'));
        })
        .catch(validationErrorsHandler(dispatch))
    );
}

export function activate({key = ''}) {
    return wrapInLoader((dispatch) =>
        signup.activate({key})
            .then(authHandler(dispatch))
            .catch(validationErrorsHandler(dispatch, '/resend-activation'))
    );
}

export function resendActivation({email = '', captcha}) {
    return wrapInLoader((dispatch) =>
        signup.resendActivation({email, captcha})
            .then((resp) => {
                dispatch(updateUser({
                    email
                }));

                return resp;
            })
            .catch(validationErrorsHandler(dispatch))
    );
}

export const ERROR = 'error';
export function setError(error) {
    return {
        type: ERROR,
        payload: error,
        error: true
    };
}

export function clearErrors() {
    return setError(null);
}

export function logout() {
    return logoutUser();
}

// TODO: move to oAuth actions?
// test request: /oauth?client_id=ely&redirect_uri=http%3A%2F%2Fely.by&response_type=code&scope=minecraft_server_session
export function oAuthValidate(oauthData) {
    return wrapInLoader((dispatch) =>
        oauth.validate(oauthData)
            .then((resp) => {
                dispatch(setClient(resp.client));
                dispatch(setOAuthRequest(resp.oAuth));
                dispatch(setScopes(resp.session.scopes));
            })
            .catch(handleOauthParamsValidation)
    );
}

export function oAuthComplete(params = {}) {
    return wrapInLoader((dispatch, getState) =>
        oauth.complete(getState().auth.oauth, params)
            .then((resp) => {
                if (resp.redirectUri.startsWith('static_page')) {
                    resp.code = resp.redirectUri.match(/code=(.+)&/)[1];
                    resp.redirectUri = resp.redirectUri.match(/^(.+)\?/)[1];
                    resp.displayCode = resp.redirectUri === 'static_page_with_code';

                    dispatch(setOAuthCode({
                        success: resp.success,
                        code: resp.code,
                        displayCode: resp.displayCode
                    }));
                }

                return resp;
            }, (resp) => {
                if (resp.acceptRequired) {
                    dispatch(requirePermissionsAccept());
                }

                return handleOauthParamsValidation(resp);
            })
    );
}

function handleOauthParamsValidation(resp = {}) {
    /* eslint no-alert: "off" */
    resp.userMessage && alert(resp.userMessage);

    return Promise.reject(resp);
}

export const SET_CLIENT = 'set_client';
export function setClient({id, name, description}) {
    return {
        type: SET_CLIENT,
        payload: {id, name, description}
    };
}

export const SET_OAUTH = 'set_oauth';
export function setOAuthRequest(oauth) {
    return {
        type: SET_OAUTH,
        payload: {
            clientId: oauth.client_id,
            redirectUrl: oauth.redirect_uri,
            responseType: oauth.response_type,
            scope: oauth.scope,
            state: oauth.state
        }
    };
}

export const SET_OAUTH_RESULT = 'set_oauth_result';
export function setOAuthCode(oauth) {
    return {
        type: SET_OAUTH_RESULT,
        payload: {
            success: oauth.success,
            code: oauth.code,
            displayCode: oauth.displayCode
        }
    };
}

export const REQUIRE_PERMISSIONS_ACCEPT = 'require_permissions_accept';
export function requirePermissionsAccept() {
    return {
        type: REQUIRE_PERMISSIONS_ACCEPT
    };
}

export const SET_SCOPES = 'set_scopes';
export function setScopes(scopes) {
    if (!(scopes instanceof Array)) {
        throw new Error('Scopes must be array');
    }

    return {
        type: SET_SCOPES,
        payload: scopes
    };
}


export const SET_LOADING_STATE = 'set_loading_state';
export function setLoadingState(isLoading) {
    return {
        type: SET_LOADING_STATE,
        payload: isLoading
    };
}

function wrapInLoader(fn) {
    return (dispatch, getState) => {
        dispatch(setLoadingState(true));
        const endLoading = () => dispatch(setLoadingState(false));

        return Reflect.apply(fn, null, [dispatch, getState]).then((resp) => {
            endLoading();

            return resp;
        }, (resp) => {
            endLoading();

            return Promise.reject(resp);
        });
    };
}

function needActivation() {
    return updateUser({
        isActive: false,
        isGuest: false
    });
}

function authHandler(dispatch) {
    return (resp) => dispatch(authenticate(resp.access_token, resp.refresh_token));
}

function validationErrorsHandler(dispatch, repeatUrl) {
    return (resp) => {
        if (resp.errors) {
            const error = {
                type: resp.errors[Object.keys(resp.errors)[0]],
                payload: {
                    isGuest: true
                }
            };

            if (resp.data) {
                Object.assign(error.payload, resp.data);
            }

            if (['error.key_not_exists', 'error.key_expire'].includes(error.type) && repeatUrl) {
                Object.assign(error.payload, {
                    repeatUrl
                });
            }

            dispatch(setError(error));
        }

        return Promise.reject(resp);

        // TODO: log unexpected errors
        // We can get here something like:
        // code: 500
        // {"name":"Invalid Configuration","message":"","code":0,"type":"yii\\base\\InvalidConfigException","file":"/home/sleepwalker/www/account/api/components/ReCaptcha/Component.php","line":12,"stack-trace":["#0 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Object.php(107): api\\components\\ReCaptcha\\Component->init()","#1 [internal function]: yii\\base\\Object->__construct(Array)","#2 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/di/Container.php(368): ReflectionClass->newInstanceArgs(Array)","#3 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/di/Container.php(153): yii\\di\\Container->build('api\\\\components\\\\...', Array, Array)","#4 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/BaseYii.php(344): yii\\di\\Container->get('api\\\\components\\\\...', Array, Array)","#5 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/di/ServiceLocator.php(133): yii\\BaseYii::createObject(Array)","#6 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/di/ServiceLocator.php(71): yii\\di\\ServiceLocator->get('reCaptcha')","#7 /home/sleepwalker/www/account/api/components/ReCaptcha/Validator.php(20): yii\\di\\ServiceLocator->__get('reCaptcha')","#8 /home/sleepwalker/www/account/api/components/ReCaptcha/Validator.php(25): api\\components\\ReCaptcha\\Validator->getComponent()","#9 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Object.php(107): api\\components\\ReCaptcha\\Validator->init()","#10 [internal function]: yii\\base\\Object->__construct(Array)","#11 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/di/Container.php(374): ReflectionClass->newInstanceArgs(Array)","#12 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/di/Container.php(153): yii\\di\\Container->build('api\\\\components\\\\...', Array, Array)","#13 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/BaseYii.php(344): yii\\di\\Container->get('api\\\\components\\\\...', Array, Array)","#14 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/validators/Validator.php(209): yii\\BaseYii::createObject(Array)","#15 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Model.php(445): yii\\validators\\Validator::createValidator('api\\\\components\\\\...', Object(api\\models\\RegistrationForm), Array, Array)","#16 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Model.php(409): yii\\base\\Model->createValidators()","#17 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Model.php(185): yii\\base\\Model->getValidators()","#18 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Model.php(751): yii\\base\\Model->scenarios()","#19 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Model.php(695): yii\\base\\Model->safeAttributes()","#20 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Model.php(823): yii\\base\\Model->setAttributes(Array)","#21 /home/sleepwalker/www/account/api/controllers/SignupController.php(41): yii\\base\\Model->load(Array)","#22 [internal function]: api\\controllers\\SignupController->actionIndex()","#23 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/InlineAction.php(55): call_user_func_array(Array, Array)","#24 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Controller.php(154): yii\\base\\InlineAction->runWithParams(Array)","#25 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Module.php(454): yii\\base\\Controller->runAction('', Array)","#26 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/web/Application.php(84): yii\\base\\Module->runAction('signup', Array)","#27 /home/sleepwalker/www/ely/vendor/yiisoft/yii2/base/Application.php(375): yii\\web\\Application->handleRequest(Object(yii\\web\\Request))","#28 /home/sleepwalker/www/account/api/web/index.php(18): yii\\base\\Application->run()","#29 {main}"]}
        // We need here status code. Probably `request` module should add _request field en each resp
    };
}
