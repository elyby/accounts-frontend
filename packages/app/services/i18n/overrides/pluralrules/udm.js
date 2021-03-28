Intl.PluralRules && 'function' == typeof Intl.PluralRules.__addLocaleData && Intl.PluralRules.__addLocaleData({
    data: {
        udm: {
            categories: {
                cardinal: ['other'],
                ordinal: ['other'],
            }, fn: function(a, l) {
                return 'other';
            },
        },
    }, availableLocales: ['udm'], aliases: {}, parentLocales: {},
});
