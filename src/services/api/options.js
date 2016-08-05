import request from 'services/request';

let options;

export default {
    get() {
        if (options) {
            return Promise.resolve(options);
        }

        return request.get('/api/options').then((resp) => {
            options = resp;

            return resp;
        });
    }
};
