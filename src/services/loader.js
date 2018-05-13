// On page initialization loader is already visible, so initial value is 1
let stack = 1;

export default {
    show() {
        if (++stack >= 0) {
            document.getElementById('loader').classList.add('is-active');
        }
    },

    hide() {
        if (--stack <= 0) {
            stack = 0;
            document.getElementById('loader').classList.remove('is-active', 'is-first-launch');
        }
    }
};
