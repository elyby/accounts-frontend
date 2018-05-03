// @flow
import copyToClipboard from 'copy-to-clipboard';

/**
 * Simple wrapper to copy-to-clipboard library, that adds support
 * for the new navigator.clipboard API.
 *
 * @param {string} content
 * @return {Promise<*>}
 */
export default async function copy(content: string): Promise<void> {
    // $FlowFixMe there is no typing for navigator.clipboard
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(content);
    }

    return copyToClipboard(content);
}
