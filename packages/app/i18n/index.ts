/**
 * This is a stub file for locales index. When you execute `yarn i18n:pull`,
 * the index.js file will be generated and webpack will load it first.
 */

export interface Locale {
    code: string;
    name: string;
    englishName: string;
    progress: number;
    isReleased: boolean;
}

const langs: Record<string, Locale> = {
    en: {
        code: 'en',
        name: 'English',
        englishName: 'English',
        progress: 100,
        isReleased: true,
    },
};

export default langs;
