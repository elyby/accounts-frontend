/**
 * Extract this file to the level upper to keep the messages prefix. Will be resolved later.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
    revokeAllTokens: 'Revoke all tokens',
    resetClientSecret: 'Reset Client Secret',
    delete: 'Delete',
    countUsers: '{count, plural, =0 {No users} one {# user} other {# users}}',
    editDescription: '{icon} Edit description',
    ifYouSuspectingThatSecretHasBeenCompromised:
        'If you are suspecting that your Client Secret has been compromised, then you may want to reset it value. It\'ll cause recall of the all "access" and "refresh" tokens that have been issued. You can also recall all issued tokens without changing Client Secret.',
    allRefreshTokensWillBecomeInvalid:
        'All "refresh" tokens will become invalid and after next authorization the user will get permissions prompt.',
    takeCareAccessTokensInvalidation: 'Take care because "access" tokens won\'t be invalidated immediately.',
    cancel: 'Cancel',
    performing: 'Performing…',
    continue: 'Continue',
    appAndAllTokenWillBeDeleted: 'Application and all associated tokens will be deleted.',
    yourApplications: 'Your applications:',
    addNew: 'Add new',
});
