import { PrimitiveType } from 'intl-messageformat';
import { Formatters, IntlConfig, IntlFormatters, MessageDescriptor } from 'react-intl';

declare module 'react-intl' {
    // Babel's plugin react-intl-auto always converts passed strings messages into the MessageDescriptor
    export declare function defineMessages<U extends Record<string, string | MessageDescriptor>>(
        msgs: U,
    ): Record<keyof U, MessageDescriptor>;

    // Babel's plugin react-intl-auto allows to call the formatMessage function with "key" field to automatically
    // generate message's id
    export interface KeyBasedMessageDescriptor {
        key: string;
        defaultMessage: string;
    }

    export declare interface IntlShape extends IntlConfig, IntlFormatters {
        formatters: Formatters;
        formatMessage(
            descriptor: MessageDescriptor | KeyBasedMessageDescriptor,
            values?: Record<string, PrimitiveType>,
        ): string;
    }
}
