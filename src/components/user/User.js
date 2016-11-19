import { PropTypes } from 'react';

const KEY_USER = 'user';

export default class User {
    /**
     * @param {object} [data] - plain object or jwt token or empty to load from storage
     *
     * @return {User}
     */
    constructor(data) {
        if (!data) {
            return this.load();
        }

        // TODO: strict value types validation

        const defaults = {
            id: null,
            uuid: null,
            username: '',
            email: '',
            // will contain user's email or masked email
            // (e.g. ex**ple@em*il.c**) depending on what information user have already provided
            maskedEmail: '',
            avatar: '',
            lang: '',
            isActive: false,
            shouldAcceptRules: false, // whether user need to review updated rules
            passwordChangedAt: null,
            hasMojangUsernameCollision: false,

            // frontend app specific attributes
            isGuest: true,
            goal: null, // the goal with wich user entered site
        };

        const user = Object.keys(defaults).reduce((user, key) => {
            if (data.hasOwnProperty(key)) {
                user[key] = data[key];
            }

            return user;
        }, defaults);

        localStorage.setItem(KEY_USER, JSON.stringify(user));

        return user;
    }

    load() {
        try {
            return new User(JSON.parse(localStorage.getItem(KEY_USER)));
        } catch (error) {
            return new User({isGuest: true});
        }
    }
}

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
