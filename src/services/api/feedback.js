import request from 'services/request';

export default ({subject = '', email = '', message = ''}) =>
    request.post('/api/feedback', {subject, email, message});
