import AbstractState from './AbstractState';

export default class PermissionsState extends AbstractState {
    enter(context) {
        context.navigate('/oauth/permissions');
    }

    resolve(context) {
        this.process(context, true);
    }

    reject(context) {
        this.process(context, false);
    }

    process(context, accept) {
        context.run('oAuthComplete', {
            accept
        }).then((resp) => location.href = resp.redirectUri);
    }
}
