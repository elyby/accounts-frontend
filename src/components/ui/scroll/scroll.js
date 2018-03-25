// @flow
/**
 * Implements scroll to animation with momentum effect
 *
 * @see http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
 */

const TIME_CONSTANT = 100; // higher numbers - slower animation
const SCROLL_ANCHOR_OFFSET = 80; // 50 + 30 (header height + some spacing)
// Первый скролл выполняется сразу после загрузки страницы, так что чтобы снизить
// нагрузку на рендеринг мы откладываем первый скрол на 200ms
let isFirstScroll = true;
let scrollJob = null;

export function scrollTo(y: number) {
    if (scrollJob) {
        // we already scrolling, so simply change the coordinates we are scrolling to
        if (scrollJob.hasAmplitude) {
            const delta = y - scrollJob.y;
            scrollJob.amplitude += delta;
        }

        scrollJob.y = y;
        return;
    }

    const start = Date.now();
    let scrollWasTouched = false;
    scrollJob = {
        // NOTE: we may use some sort of debounce to wait till we catch all the
        // scroll requests after app state changes, but the way with hasAmplitude
        // seems to be more reliable
        hasAmplitude: false,
        start,
        y,
        amplitude: 0
    };

    requestAnimationFrame(() => { // wrap in requestAnimationFrame to optimize initial reading of scrollTop
        if (!scrollJob) {
            return;
        }

        const y = normalizeScrollPosition(scrollJob.y);

        scrollJob.hasAmplitude = true;
        scrollJob.y = y;
        scrollJob.amplitude = y - getScrollTop();

        (function animateScroll() {
            if (!scrollJob) {
                return;
            }

            const { start, y, amplitude } = scrollJob;
            const elapsed = Date.now() - start;

            let delta = -amplitude * Math.exp(-elapsed / TIME_CONSTANT);

            if (Math.abs(delta) > 0.5 && !scrollWasTouched) {
                requestAnimationFrame(animateScroll);
            } else {
                // the last animation frame
                delta = 0;
                scrollJob = null;
                document.removeEventListener('mousewheel', markScrollTouched);
                document.removeEventListener('touchstart', markScrollTouched);
            }

            if (scrollWasTouched) {
                // block any animation visualisation in case, when user touched scroll
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

/**
 * Ensures, that `y` is the coordinate, that can be physically scrolled to
 *
 * @param  {number} y
 *
 * @return {number}
 */
function normalizeScrollPosition(y: number): number {
    const contentHeight = (document.documentElement
        && document.documentElement.scrollHeight) || 0;
    const windowHeight: number = window.innerHeight;
    const maxY = contentHeight - windowHeight;

    return Math.min(y, maxY);
}

/**
 * Scrolls to page's top or #anchor link, if any
 *
 * @param {?HTMLElement} targetEl - the element to scroll to
 */
export function restoreScroll(targetEl: ?HTMLElement = null) {
    const { hash } = window.location;
    setTimeout(() => {
        isFirstScroll = false;
        if (targetEl === null) {
            const id = hash.substr(1);
            if (!id) {
                return;
            }

            targetEl = document.getElementById(id);
        }

        const viewPort = document.body;
        if (!viewPort) {
            console.log('Can not find viewPort element'); // eslint-disable-line
            return;
        }

        let y = 0;
        if (targetEl) {
            const { top } = targetEl.getBoundingClientRect();
            y = getScrollTop() + top - SCROLL_ANCHOR_OFFSET;
        }

        scrollTo(y);
    }, isFirstScroll ? 200 : 0);
}

/**
 * http://stackoverflow.com/a/3464890/5184751
 *
 * @return {number}
 */
export function getScrollTop(): number {
    const doc = document.documentElement;

    if (doc) {
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    }

    return 0;
}
