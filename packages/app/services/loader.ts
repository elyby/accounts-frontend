// On page initialization loader is already visible, so initial value is 1
let stack = 1;

/**
 * The loader element lives outside of the React tree, so it can be removed by browser extensions
 * or injected scripts. The loader is just a cosmetic, so its absence must not break the app
 */
function getLoader(): HTMLElement | null {
    return document.getElementById('loader');
}

export function show(): void {
    if (++stack >= 0) {
        getLoader()?.classList.add('is-active');
    }
}

export function hide(): void {
    if (--stack <= 0) {
        stack = 0;
        getLoader()?.classList.remove('is-active', 'is-first-launch');
    }
}
