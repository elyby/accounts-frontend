import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { Color, Skin } from 'app/components/ui';
import type { CaptchaPublicParams } from 'app/services/api/options';

export type { CaptchaPublicParams };

export interface CaptchaValue {
    type: string;
    token: string;
}

export interface CaptchaComponentProps {
    params: CaptchaPublicParams;
    skin: Skin;
    /**
     * The accent color of the panel. Used by our own widgets only, since third-party ones can't be colored
     */
    color: Color;
    /**
     * The current locale. Our own widgets get the translations from the intl context instead
     */
    lang: string;
    onSetCode(token: string): void;
    onExpire(): void;
    /**
     * Called, when the widget can't be rendered at all. Recoverable errors should be handled by the widget itself
     */
    onError(error: unknown): void;
}

export interface CaptchaComponentHandle {
    /**
     * Forgets the current token (they are single-use) and brings the widget to its initial state
     */
    reset(): void;
}

export type CaptchaComponent = ForwardRefExoticComponent<CaptchaComponentProps & RefAttributes<CaptchaComponentHandle>>;

export interface CaptchaProvider {
    /**
     * Must match the key in the options.captcha and the captchaType value, sent to the backend
     */
    readonly type: string;

    /**
     * Loads provider's SDK or preloads its resources.
     * Rejects, when the provider can't be used, so the next one will be tried
     */
    load(lang: string): Promise<void>;

    /**
     * Heavy third-party widgets are rendered after the Captcha's delay, so they don't slow down
     * the appearance animation of the panel. Our own lightweight widgets are rendered at once
     */
    readonly isRenderingDeferred?: boolean;

    /**
     * The widget, rendered inside the form. Must be rendered only after the load() is resolved.
     *
     * Third-party widgets are wrapped into the component with the createSdkCaptcha()
     */
    readonly Component: CaptchaComponent;
}
