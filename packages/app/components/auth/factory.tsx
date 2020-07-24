import React, { ComponentProps, ComponentType } from 'react';
import { MessageDescriptor } from 'react-intl';

import { Button } from 'app/components/ui/form';
import RejectionLink from 'app/components/auth/RejectionLink';
import AuthTitle from 'app/components/auth/AuthTitle';

import BaseAuthBody from './BaseAuthBody';

export type Factory = () => {
    Title: ComponentType;
    Body: typeof BaseAuthBody;
    Footer: ComponentType;
    Links: ComponentType;
};

type RejectionLinkProps = ComponentProps<typeof RejectionLink>;
interface FactoryParams {
    title: MessageDescriptor;
    body: typeof BaseAuthBody;
    footer: Omit<ComponentProps<typeof Button>, 'type'>;
    links?: RejectionLinkProps | Array<RejectionLinkProps>;
}

export default function ({ title, body, footer, links }: FactoryParams): Factory {
    return () => ({
        Title: () => <AuthTitle title={title} />,
        Body: body,
        Footer: () => <Button type="submit" {...footer} />,
        Links: () =>
            links ? (
                <span>
                    {([] as Array<RejectionLinkProps>)
                        .concat(links)
                        .map((link, index) => [index ? ' | ' : '', <RejectionLink {...link} key={index} />])}
                </span>
            ) : null,
    });
}
