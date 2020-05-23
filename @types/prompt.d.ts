// Type definitions for Prompt.js 1.0.0
// Project: https://github.com/flatiron/prompt

declare module 'prompt' {
  type PropertiesType =
    | Array<string>
    | prompt.PromptSchema
    | Array<prompt.PromptPropertyOptions>;

  namespace prompt {
    interface PromptSchema {
      properties: PromptProperties;
    }

    interface PromptProperties {
      [propName: string]: PromptPropertyOptions;
    }

    interface PromptPropertyOptions {
      name?: string;
      pattern?: RegExp;
      message?: string;
      required?: boolean;
      hidden?: boolean;
      description?: string;
      type?: string;
      default?: string;
      before?: (value: any) => any;
      conform?: (result: any) => boolean;
    }

    export function start(): void;

    export function get<T extends PropertiesType>(
      properties: T,
      callback: (
        err: Error,
        result: T extends Array<string>
          ? Record<T[number], string>
          : T extends PromptSchema
          ? Record<keyof T['properties'], string>
          : T extends Array<PromptPropertyOptions>
          ? Record<
              T[number]['name'] extends string ? T[number]['name'] : number,
              string
            >
          : never,
      ) => void,
    ): void;

    export function addProperties(
      obj: any,
      properties: PropertiesType,
      callback: (err: Error) => void,
    ): void;

    export function history(propertyName: string): any;

    export let override: any;
    export let colors: boolean;
    export let message: string;
    export let delimiter: string;
  }

  export = prompt;
}
