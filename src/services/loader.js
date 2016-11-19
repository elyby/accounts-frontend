export default {
    show() {
        document.getElementById('loader').classList.add('is-active');
    },

    hide() {
        document.getElementById('loader').classList.remove('is-active');
    }
};
