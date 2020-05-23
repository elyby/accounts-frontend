declare module '*.html' {
    const url: string;
    export = url;
}

declare module '*.svg' {
    const url: string;
    export = url;
}

declare module '*.png' {
    const url: string;
    export = url;
}

declare module '*.gif' {
    const url: string;
    export = url;
}

declare module '*.jpg' {
    const url: string;
    export = url;
}

declare module '*.intl.json' {
    import { MessageDescriptor } from 'react-intl';

    const descriptor: Record<string, MessageDescriptor>;

    export = descriptor;
}

declare module '*.json' {
    const jsonContents: {
        [key: string]: any;
    };

    export = jsonContents;
}

declare module '*.scss' {
    // TODO: replace with:
    // https://www.npmjs.com/package/css-modules-typescript-loader
    // https://github.com/Jimdo/typings-for-css-modules-loader
    const classNames: {
        [className: string]: string;
    };

    export = classNames;
}

declare module '*.css' {
    const classNames: {
        [className: string]: string;
    };

    export = classNames;
}
