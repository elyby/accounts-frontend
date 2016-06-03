/**
 * Implements scroll to animation with momentum effect
 */

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const DURATION = 500;
export default function scrollTo(y) {
    const start = Date.now();
    const {scrollTop} = document.body;
    const delta = y - scrollTop;

    requestAnimationFrame(function animateScroll() {
        const elapsed = Date.now() - start;

        let interpolatedY = scrollTop + delta * (elapsed / DURATION);

        if (interpolatedY < y) {
            requestAnimationFrame(animateScroll);
        } else {
            interpolatedY = y;
        }

        window.scrollTo(0, interpolatedY);
    });
}

