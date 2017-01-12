import { PropTypes } from 'react';

/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} uuid
 * @property {string} token
 * @property {string} username
 * @property {string} email
 * @property {string} avatar
 * @property {bool} isGuest
 * @property {bool} isActive
 * @property {number} passwordChangedAt - timestamp
 * @property {bool} hasMojangUsernameCollision
 */
export const userShape = PropTypes.shape({
    id: PropTypes.number,
    uuid: PropTypes.string,
    token: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    isGuest: PropTypes.bool.isRequired,
    isActive: PropTypes.bool.isRequired,
    passwordChangedAt: PropTypes.number,
    hasMojangUsernameCollision: PropTypes.bool,
});
