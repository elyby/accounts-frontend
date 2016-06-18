import request from 'services/request';

export default ({subject = '', email = '', message = '', category = ''}) =>
    request.post('/api/feedback', {subject, email, message, category});
