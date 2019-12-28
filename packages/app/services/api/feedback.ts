import request from 'app/services/request';

export default {
  send({ subject = '', email = '', message = '', category = '' }) {
    return request.post('/api/feedback', {
      subject,
      email,
      message,
      category,
    });
  },
};