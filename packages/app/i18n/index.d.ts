declare module 'app/i18n' {
    export interface Locale {
        code: string;
        name: string;
        englishName: string;
        progress: number;
        isReleased: boolean;
    }

    const LANGS: Record<string, Locale>;

    export default LANGS;
}
