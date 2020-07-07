import request from 'app/services/request';

interface SendFeedbackParams {
    subject: string;
    email: string;
    message: string;
    category: string | number;
}

export function send(params: SendFeedbackParams) {
    return request.post('/api/feedback', params);
}
