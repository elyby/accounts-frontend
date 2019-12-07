import copyToClipboard from 'copy-to-clipboard';

/**
 * Simple wrapper to copy-to-clipboard library, that adds support
 * for the new navigator.clipboard API.
 *
 * @param {string} content
 * @returns {Promise<*>}
 */
export default async function copy(content: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(content);
  }

  copyToClipboard(content);
}
