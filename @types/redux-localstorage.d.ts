// https://github.com/elgerlambert/redux-localstorage/issues/78#issuecomment-323609784

// import * as Redux from 'redux';

declare module 'redux-localstorage' {
    export interface ConfigRS {
        key: string;
        merge?: any;
        slicer?: any;
        serialize?: (value: any, replacer?: (key: string, value: any) => any, space?: string | number) => string;
        deserialize?: (text: string, reviver?: (key: any, value: any) => any) => any;
    }

    export default function persistState(paths: string | string[], config: ConfigRS): () => any;
}
