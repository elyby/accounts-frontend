let lastId = 0;
export function uniqueId(prefix = 'id') {
    return `${prefix}${++lastId}`;
}

/**
 * @param {object} obj
 * @param {array} keys
 *
 * @return {object}
 */
export function omit(obj, keys) {
    const newObj = {...obj};

    keys.forEach((key) => {
        Reflect.deleteProperty(newObj, key);
    });

    return newObj;
}

/**
 * Asynchronously loads script
 *
 * @param {string} src
 *
 * @return {Promise}
 */
export function loadScript(src) {
    const script = document.createElement('script');

    script.async = true;
    script.defer = true;
    script.src = src;

    return new Promise((resolve, reject) => {
        script.onlaod = resolve;
        script.onerror = reject;

        document.body.appendChild(script);
    });
}

export const rAF = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || ((cb) => setTimeout(cb, 1000 / 60));

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear'
 * that is a function which will clear the timer to prevent previously scheduled executions.
 *
 * @source https://github.com/component/debounce
 *
 * @param {function} function - function to wrap
 * @param {number} [timeout=100] - timeout in ms
 * @param {bool} [immediate=false] - whether to execute at the beginning
 */
export debounce from 'debounce';

/**
 * @param {string} jwt
 *
 * @throws {Error} If can not decode token
 *
 * @return {object} - decoded jwt payload
 */
export function getJwtPayload(jwt) {
    const parts = (jwt || '').split('.');

    if (parts.length !== 3) {
        throw new Error('Invalid jwt token');
    }

    try {
        return JSON.parse(atob(parts[1]));
    } catch (err) {
        throw new Error('Can not decode jwt token');
    }
}

/**
 * http://stackoverflow.com/a/3464890/5184751
 *
 * @return {number}
 */
export function getScrollTop() {
    const doc = document.documentElement;
    return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
}

/**
 * Implements scroll to animation with momentum effect
 *
 * @see http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
 */

const TIME_CONSTANT = 100; // higher numbers - slower animation
export function scrollTo(y) {
    const start = Date.now();
    let scrollWasTouched = false;
    rAF(() => { // wrap in rAF to optimize initial reading of scrollTop
        const contentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        if (contentHeight < y + windowHeight) {
            y = contentHeight - windowHeight;
        }

        const amplitude = y - getScrollTop();

        (function animateScroll() {
            const elapsed = Date.now() - start;

            let delta = -amplitude * Math.exp(-elapsed / TIME_CONSTANT);

            if (Math.abs(delta) > 0.5 && !scrollWasTouched) {
                rAF(animateScroll);
            } else {
                delta = 0;
                document.removeEventListener('mousewheel', markScrollTouched);
                document.removeEventListener('touchstart', markScrollTouched);
            }

            if (scrollWasTouched) {
                return;
            }

            const newScrollTop = y + delta;
            window.scrollTo(0, newScrollTop);
        }());
    });

    document.addEventListener('mousewheel', markScrollTouched);
    document.addEventListener('touchstart', markScrollTouched);
    function markScrollTouched() {
        scrollWasTouched = true;
    }
}

const SCROLL_ANCHOR_OFFSET = 80; // 50 + 30 (header height + some spacing)
// Первый скролл выполняется сразу после загрузки страницы, так что чтобы снизить
// нагрузку на рендеринг мы откладываем первый скрол на 200ms
let isFirstScroll = true;
/**
 * Scrolls to page's top or #anchor link, if any
 */
export function restoreScroll() {
    const {hash} = location;

    setTimeout(() => {
        isFirstScroll = false;
        const id = hash.replace('#', '');
        const el = id ? document.getElementById(id) : null;
        const viewPort = document.body;

        if (!viewPort) {
            console.log('Can not find viewPort element'); // eslint-disable-line
            return;
        }

        let y = 0;
        if (el) {
            const {top} = el.getBoundingClientRect();

            y = getScrollTop() + top - SCROLL_ANCHOR_OFFSET;
        }

        scrollTo(y, viewPort);
    }, isFirstScroll ? 200 : 0);
}
