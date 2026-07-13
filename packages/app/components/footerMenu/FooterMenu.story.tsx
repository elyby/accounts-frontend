import React, { ComponentType, CSSProperties } from 'react';

import FooterMenu from './FooterMenu';

const PreviewWrapper: ComponentType<{ style?: CSSProperties }> = ({ style, children }) => (
    <div style={{ padding: '25px', width: 320, boxSizing: 'border-box', ...style }}>{children}</div>
);

export default { title: 'Components' };

export const FooterMenuStory = () => (
    <div style={{ display: 'flex' }}>
        <PreviewWrapper>
            <FooterMenu />
        </PreviewWrapper>
        <PreviewWrapper style={{ backgroundColor: '#232323' }}>
            <FooterMenu />
        </PreviewWrapper>
    </div>
);
FooterMenuStory.storyName = 'FooterMenu';
