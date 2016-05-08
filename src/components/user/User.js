import { PropTypes } from 'react';

const KEY_USER = 'user';

export default class User {
    /**
     * @param  {Object|string|undefined} data plain object or jwt token or empty to load from storage
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
            token: '',
            username: '',
            email: '',
            avatar: '',
            lang: '',
            goal: null, // the goal with wich user entered site
            isGuest: true,
            isActive: true,
            shouldChangePassword: false, // TODO: нужно ещё пробросить причину необходимости смены
            passwordChangedAt: null,
            hasMojangUsernameCollision: false,
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
