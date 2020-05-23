import React from 'react';
import { storiesOf } from '@storybook/react';

import Button from './Button';

storiesOf('UI/Form', module).add('Button', () => (
    <>
        <div>
            <Button label="Green Button" /> <Button label="Blue Button" color="blue" />{' '}
            <Button label="DarkBlue Button" color="darkBlue" /> <Button label="Violet Button" color="violet" />{' '}
            <Button label="LightViolet Button" color="lightViolet" /> <Button label="Orange Button" color="orange" />{' '}
            <Button label="Red Button" color="red" /> <Button label="Black Button" color="black" />{' '}
            <Button label="White Button" color="white" />
        </div>
        <div>
            <h2>Disabled buttons</h2>
            <Button disabled label="Green Button" /> <Button disabled label="Blue Button" color="blue" />{' '}
            <Button disabled label="DarkBlue Button" color="darkBlue" />{' '}
            <Button disabled label="Violet Button" color="violet" />{' '}
            <Button disabled label="LightViolet Button" color="lightViolet" />{' '}
            <Button disabled label="Orange Button" color="orange" /> <Button disabled label="Red Button" color="red" />{' '}
            <Button disabled label="Black Button" color="black" />{' '}
            <Button disabled label="White Button" color="white" />
        </div>
        <div>
            <h2>Button sizes</h2>
            <Button label="Default button" /> <Button label="Small button" small /> <br />
            <br />
            <Button label="Block button" block />
            <br />
            <Button label="Small block button" small block />
        </div>
        <div>
            <h2>Loading button</h2>
            <Button loading label="Green Button" /> <Button loading label="Blue Button" color="blue" />{' '}
            <Button loading label="DarkBlue Button" color="darkBlue" />{' '}
            <Button loading label="Violet Button" color="violet" />{' '}
            <Button loading label="LightViolet Button" color="lightViolet" />{' '}
            <Button loading label="Orange Button" color="orange" /> <Button loading label="Red Button" color="red" />{' '}
            <Button loading label="Black Button" color="black" /> <Button loading label="White Button" color="white" />
        </div>
    </>
));
