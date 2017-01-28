/**
 * Implements scroll to animation with momentum effect
 *
 * @see http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
 */

import { rAF, getScrollTop } from 'functions';

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
