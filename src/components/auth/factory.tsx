import React from 'react';
import { Button } from 'components/ui/form';
import RejectionLink, {
  RejectionLinkProps,
} from 'components/auth/RejectionLink';
import AuthTitle from 'components/auth/AuthTitle';
import { MessageDescriptor } from 'react-intl';
import { Color } from 'components/ui';

/**
 * @param {object} options
 * @param {string|object} options.title - panel title
 * @param {React.ReactElement} options.body
 * @param {object} options.footer - config for footer Button
 * @param {Array|object|null} options.links - link config or an array of link configs
 *
 * @returns {object} - structure, required for auth panel to work
 */
export default function({
  title,
  body,
  footer,
  links,
}: {
  title: MessageDescriptor;
  body: React.ElementType;
  footer: {
    color?: Color;
    label: string | MessageDescriptor;
    autoFocus?: boolean;
  };
  links?: RejectionLinkProps | RejectionLinkProps[];
}) {
  return () => ({
    Title: () => <AuthTitle title={title} />,
    Body: body,
    Footer: () => <Button type="submit" {...footer} />,
    Links: () =>
      links ? (
        <span>
          {([] as RejectionLinkProps[])
            .concat(links)
            .map((link, index) => [
              index ? ' | ' : '',
              <RejectionLink {...link} key={index} />,
            ])}
        </span>
      ) : null,
  });
}
