import React from 'react';

import { Button } from 'components/ui/form';
import RejectionLink from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';

/**
 * @param {object} options
 * @param {string|object} options.title - panel title
 * @param {ReactElement} options.body
 * @param {object} options.footer - config for footer Button
 * @param {array|object|null} options.links - link config or an array of link configs
 *
 * @return {object} - structure, required for auth panel to work
 */
export default function(options) {
    return () => ({
        Title: () => <AuthTitle title={options.title} />,
        Body: options.body,
        Footer: () => <Button type="submit" {...options.footer} />,
        Links: () => options.links ? (
            <span>
                {[].concat(options.links).map((link, index) => (
                    [index ? ' | ' : '', <RejectionLink {...link} key={index} />]
                ))}
            </span>
        ) : null
    });
}
