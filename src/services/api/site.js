import request from 'services/request';

export default {
    contact({
        subject = '',
        email = '',
        message = ''
    }) {
        return request.post(
            '/api/site/contact',
            {subject, email, message}
        );
    }
};
