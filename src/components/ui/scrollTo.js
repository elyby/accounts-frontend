/**
 * Implements scroll to animation with momentum effect
 *
 * @see http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
 */

import { rAF } from 'functions';

const TIME_CONSTANT = 100; // heigher numbers - slower animation
export default function scrollTo(y, viewPort) {
    const start = Date.now();
    let scrollWasTouched = false;
    rAF(() => { // wrap in rAF to optimize initial reading of scrollTop
        const {scrollTop} = viewPort;
        const amplitude = y - scrollTop;

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

            viewPort.scrollTop = y + delta;
        }());
    });

    document.addEventListener('mousewheel', markScrollTouched);
    document.addEventListener('touchstart', markScrollTouched);
    function markScrollTouched() {
        scrollWasTouched = true;
    }
}

