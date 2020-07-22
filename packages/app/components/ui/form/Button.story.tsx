import React from 'react';
import { storiesOf } from '@storybook/react';

import Button from './Button';

storiesOf('UI/Form', module).add('Button', () => (
    <>
        <div>
            <Button>Green Button</Button> <Button color="blue">Blue Button</Button>{' '}
            <Button color="darkBlue">DarkBlue Button</Button> <Button color="violet">Violet Button</Button>{' '}
            <Button color="lightViolet">LightViolet Button</Button> <Button color="orange">Orange Button</Button>{' '}
            <Button color="red">Red Button</Button> <Button color="black">Black Button</Button>{' '}
            <Button color="white">White Button</Button>
        </div>
        <div>
            <h2>Disabled buttons</h2>
            <Button disabled>Green Button</Button>
            <Button disabled color="blue">
                Blue Button
            </Button>{' '}
            <Button disabled color="darkBlue">
                DarkBlue Button
            </Button>{' '}
            <Button disabled color="violet">
                Violet Button
            </Button>{' '}
            <Button disabled color="lightViolet">
                LightViolet Button
            </Button>{' '}
            <Button disabled color="orange">
                Orange Button
            </Button>{' '}
            <Button disabled color="red">
                Red Button
            </Button>{' '}
            <Button disabled color="black">
                Black Button
            </Button>{' '}
            <Button disabled color="white">
                White Button
            </Button>
        </div>
        <div>
            <h2>Button sizes</h2>
            <Button>Default button</Button> <Button small>Small button</Button> <br />
            <br />
            <Button block>Block button</Button>
            <br />
            <Button small block>
                Small block button
            </Button>
        </div>
        <div>
            <h2>Loading button</h2>
            <Button loading>Green Button</Button>{' '}
            <Button loading color="blue">
                Blue Button
            </Button>{' '}
            <Button loading color="darkBlue">
                DarkBlue Button
            </Button>{' '}
            <Button loading color="violet">
                Violet Button
            </Button>{' '}
            <Button loading color="lightViolet">
                LightViolet Button
            </Button>{' '}
            <Button loading color="orange">
                Orange Button
            </Button>{' '}
            <Button loading color="red">
                Red Button
            </Button>{' '}
            <Button loading color="black">
                Black Button
            </Button>{' '}
            <Button loading color="white">
                White Button
            </Button>
        </div>
    </>
));
