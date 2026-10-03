import type { Skin } from 'app/components/ui';
import type { CaptchaPublicParams } from 'app/services/api/options';

export type { CaptchaPublicParams };

export type CaptchaWidgetId = string | number;

export interface CaptchaValue {
    type: string;
    token: string;
}

export interface CaptchaRenderOptions {
    skin: Skin;
    lang: string;
    onSetCode(token: string): void;
    onExpire(): void;
}

export interface CaptchaProvider {
    /**
     * Must match the key in the options.captcha and the captchaType value, sent to the backend
     */
    readonly type: string;

    /**
     * Loads provider's SDK. Rejects, when the SDK can't be loaded or it takes too long
     */
    load(lang: string): Promise<void>;

    /**
     * Renders the widget into the passed element. Must be called only after the load() is resolved
     */
    render(el: HTMLElement, params: CaptchaPublicParams, options: CaptchaRenderOptions): CaptchaWidgetId;

    reset(id: CaptchaWidgetId): void;

    destroy(id: CaptchaWidgetId): void;
}
