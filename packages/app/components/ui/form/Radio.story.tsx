import React, { FC, ReactNode } from 'react';

import { Color, Skin } from 'app/components/ui';

import Radio from './Radio';

export default { title: 'UI/Form' };

// Only these colors have the markable theme (see markable.scss)
const COLORS: ReadonlyArray<Color> = ['green', 'blue', 'red', 'lightViolet'];

const Panel: FC<{ skin: Skin; children: ReactNode }> = ({ skin, children }) => (
    <div style={{ padding: 15, marginBottom: 10, background: skin === 'dark' ? '#232323' : '#fff' }}>{children}</div>
);

const Row: FC<{ children: ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>{children}</div>
);

export const RadioStory = () => (
    <>
        {(['dark', 'light'] as const).map((skin) => (
            <Panel key={skin} skin={skin}>
                {COLORS.map((color) => {
                    const name = `${skin}-${color}`;

                    return (
                        <Row key={color}>
                            <Radio skin={skin} color={color} name={name} label={`${color} radio`} defaultChecked />
                            <Radio skin={skin} color={color} name={name} label="Another option" />
                            <Radio skin={skin} color={color} name={`${name}-disabled`} label="Disabled" disabled />
                            <Radio
                                skin={skin}
                                color={color}
                                name={`${name}-disabled`}
                                label="Disabled checked"
                                disabled
                                defaultChecked
                            />
                        </Row>
                    );
                })}
            </Panel>
        ))}
    </>
);
RadioStory.storyName = 'Radio';
