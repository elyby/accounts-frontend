import React, { ComponentType, CSSProperties } from 'react';
import { storiesOf } from '@storybook/react';

import FooterMenu from './FooterMenu';

const PreviewWrapper: ComponentType<{ style?: CSSProperties }> = ({ style, children }) => (
    <div style={{ padding: '25px', ...style }}>{children}</div>
);

storiesOf('Components', module).add('FooterMenu', () => (
    <div style={{ display: 'flex' }}>
        <PreviewWrapper>
            <FooterMenu />
        </PreviewWrapper>
        <PreviewWrapper style={{ backgroundColor: '#232323' }}>
            <FooterMenu />
        </PreviewWrapper>
    </div>
));
