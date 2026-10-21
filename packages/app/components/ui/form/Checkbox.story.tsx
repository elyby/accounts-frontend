import React, { FC, ReactNode } from 'react';

import { Color, Skin } from 'app/components/ui';

import Checkbox from './Checkbox';

export default { title: 'UI/Form' };

// Only these colors have the markable theme (see markable.scss)
const COLORS: ReadonlyArray<Color> = ['green', 'blue', 'red', 'lightViolet'];

const Panel: FC<{ skin: Skin; children: ReactNode }> = ({ skin, children }) => (
    <div style={{ padding: 15, marginBottom: 10, background: skin === 'dark' ? '#232323' : '#fff' }}>{children}</div>
);

const Row: FC<{ children: ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>{children}</div>
);

export const CheckboxStory = () => (
    <>
        {(['dark', 'light'] as const).map((skin) => (
            <Panel key={skin} skin={skin}>
                {COLORS.map((color) => (
                    <Row key={color}>
                        <Checkbox skin={skin} color={color} label={`${color} checkbox`} />
                        <Checkbox skin={skin} color={color} label="Checked" defaultChecked />
                        <Checkbox skin={skin} color={color} label="Disabled" disabled />
                        <Checkbox skin={skin} color={color} label="Disabled checked" disabled defaultChecked />
                    </Row>
                ))}
            </Panel>
        ))}

        <Panel skin="dark">
            <h2 style={{ color: '#fff' }}>Without the label</h2>
            <Row>
                <Checkbox />
                <Checkbox defaultChecked />
                <Checkbox disabled />
            </Row>

            <h2 style={{ color: '#fff' }}>Inside an outer label</h2>
            <label style={{ display: 'block', padding: 20, border: '2px dashed #666', color: '#fff', cursor: 'pointer' }}>
                <Checkbox color="blue" /> The whole area toggles the checkbox and highlights it on hover
            </label>
        </Panel>
    </>
);
CheckboxStory.storyName = 'Checkbox';
