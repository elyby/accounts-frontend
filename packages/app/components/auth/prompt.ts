import type { OAuthState } from './reducer';

/**
 * The prompt values (OpenID Connect Core 1.0 section 3.1.2.1)
 */
export const PROMPT_NONE = 'none';
export const PROMPT_LOGIN = 'login';
export const PROMPT_PERMISSIONS = 'consent';
export const PROMPT_ACCOUNT_CHOOSE = 'select_account';
/**
 * Our own extension, it isn't defined by the standard
 */
export const PROMPT_SKIP_ACCOUNT_CHOOSE = 'skip_account_selection';

export function getPromptValues(prompt: OAuthState['prompt']): Array<string> {
    if (Array.isArray(prompt)) {
        return prompt;
    }

    return prompt ? [prompt] : [];
}

export function hasPrompt(prompt: OAuthState['prompt'], needle: string): boolean {
    return getPromptValues(prompt).includes(needle);
}

/**
 * The client may ask to skip the switcher. The standard select_account wins over our own extension
 */
export function canSkipAccountSwitcher(prompt: OAuthState['prompt']): boolean {
    return hasPrompt(prompt, PROMPT_SKIP_ACCOUNT_CHOOSE) && !hasPrompt(prompt, PROMPT_ACCOUNT_CHOOSE);
}

/**
 * Finds the account, which the login_hint refers to. The login_hint may contain the account's id, email or username
 */
export function findMatchingAccount<T extends { id: number | null; email: string; username: string }>(
    loginHint: OAuthState['loginHint'],
    accounts: ReadonlyArray<T>,
): T | undefined {
    if (!loginHint) {
        return undefined;
    }

    return accounts.find((account) =>
        account.id === Number(loginHint)
     || account.email === loginHint
     || account.username === loginHint
    );
}
