/**
 * Implements scroll to animation with momentum effect
 *
 * @see http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html
 */

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const TIME_CONSTANT = 100;
export default function scrollTo(y) {
    const start = Date.now();
    const {scrollTop} = document.body;
    const amplitude = y - scrollTop;

    requestAnimationFrame(function animateScroll() {
        const elapsed = Date.now() - start;

        let delta = -amplitude * Math.exp(-elapsed / TIME_CONSTANT);

        if (Math.abs(delta) > 0.5) {
            requestAnimationFrame(animateScroll);
        } else {
            delta = 0;
        }

        window.scrollTo(0, y + delta);
    });
}

