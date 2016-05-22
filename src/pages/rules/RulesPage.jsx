import React from 'react';

import styles from './rules.scss';

const rules = [
    {
        title: 'Main provisions',
        items: [
            'Ely.by - custom project, created by man under the pseudonym ErickSkrauch and unrelated to the company Mojang.',
            'Developer carefully read the Mojang Account EULA and quite confidently declares that it does not violate, implementing alternative service for Minecraft. The EULA says that users may redistribute any modifications to the client, without charging a fee for it. This is what we are doing here.',
            'Ely.by not steal your passwords and keep them safe in a hash with salt.',
            'We have the right to withdraw from your order any nickname in the case of "clogging" nicks players.'
        ]
    },
    {
        title: 'Skin system',
        items: [
            (<span>
                Ready patches on the downloads page only change the query to load skins, and in any case should not be spy the player.
                However, if you are in doubt, you can manually implement the patch, following our <a href="/">skins system documentation</a>.
            </span>),
            'The system skins is absolutely free service, and it will remain such forever. You can freely use it in their projects without asking for any permission and nowhere specifically registering.',
            'In our protocol download skins, we conduct statistics of all skin download requests. We get information about that for a nickname with which version and what time has been loaded skin. In fact, there are no critical data, but you have the right to know.'
        ]
    },
    {
        title: 'Skins catalog',
        items: [
            'Any skin, loaded to the site, enters the public skins catalog. This means that any user will be able to wear it or download skins from our catalog.',
            'Any skin you uploaded to Ely.by becomes the property of the project. This means that we are entitled to take measures for its removal or retention in a public skins catalog. However, we will always try to walk you to the meeting in the absence of a compelling reason on our part to fulfill any request regarding your skin.'
        ]
    },
    {
        title: 'General site rules',
        items: [
            'We indifferent to your style of communication as long as it starts to interfere with the administration. Keep this in mind.',
            'Use of multi account not prohibited. Nevertheless, on the site you can change nickname - this is done in the settings.',
            'Advertising of any affiliate and referral programs, store stolen keys (ie all except official), as well as online casinos, all drugs, alcoholic beverages, etc. strictly punished by blocking the account instantly.',
            <b>If you register on the site, taking the nickname, which holds the license Minecraft, owner will be able to demand the restoration of control over nickname and you within 3 days should necessary change the nickname.</b>
        ]
    }
];

export default function RulesPage() {
    return (
        <div className={styles.rules}>
            {rules.map((block, key) => (
                <div className={styles.rulesSection} key={key}>
                    <h2 className={styles.rulesSectionTitle}>{block.title}</h2>

                    <div className={styles.rulesBody}>
                        <ol className={styles.rulesList}>
                            {block.items.map((item, key) => (
                                <li className={styles.rulesItem} key={key}>{item}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            ))}
        </div>
    );
}

RulesPage.displayName = 'RulesPage';
