import icons from 'icons.font.json';

const baseClass = 'icon';

export default Object.keys(icons)
    .filter((icon) => icon !== baseClass)
    .reduce((acc, icon) => {
        acc[icon.replace(`${baseClass}-`, '')] = `${icons[baseClass]} ${icons[icon]}`;

        return acc;
    }, {})
    ;
