import { defineMessages } from 'react-intl';

export default defineMessages({
    permissionsTitle: {
        id: 'permissionsTitle',
        defaultMessage: 'Application permissions'
    },

    youAuthorizedAs: {
        id: 'youAuthorizedAs',
        defaultMessage: 'You authorized as:'
    },

    theAppNeedsAccess: {
        id: 'theAppNeedsAccess',
        // Мне нельзя html? Получите неразрывный пробел! ˅˅˅˅˅˅˅˅˅˅˅
        defaultMessage: 'This applications needs access              to your data'
    },

    decline: {
        id: 'decline',
        defaultMessage: 'Decline'
    },

    approve: {
        id: 'approve',
        defaultMessage: 'Approve'
    }
});
