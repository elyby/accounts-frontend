// @flow
export type Color = 'green'
    |'blue'
    |'darkBlue'
    |'violet'
    |'lightViolet'
    |'orange'
    |'red'
    |'black'
    |'white';

export type Skin = 'dark'|'light';

export const COLOR_GREEN: Color = 'green';
export const COLOR_BLUE: Color = 'blue';
export const COLOR_DARK_BLUE: Color = 'darkBlue';
export const COLOR_VIOLET: Color = 'violet';
export const COLOR_LIGHT_VIOLET: Color = 'lightViolet';
export const COLOR_ORANGE: Color = 'orange';
export const COLOR_RED: Color = 'red';
export const COLOR_BLACK: Color = 'black';
export const COLOR_WHITE: Color = 'white';

export const colors: Array<Color> = [
    COLOR_GREEN,
    COLOR_BLUE,
    COLOR_DARK_BLUE,
    COLOR_VIOLET,
    COLOR_LIGHT_VIOLET,
    COLOR_ORANGE,
    COLOR_RED,
    COLOR_BLACK,
    COLOR_WHITE
];

export const SKIN_DARK: Skin = 'dark';
export const SKIN_LIGHT: Skin = 'light';

export const skins: Array<Skin> = [SKIN_DARK, SKIN_LIGHT];
