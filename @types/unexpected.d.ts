declare module 'unexpected' {
  namespace unexpected {
    interface EnchantedPromise<T> extends Promise<T> {
      and<A extends Array<unknown> = []>(
        assertionName: string,
        subject: unknown,
        ...args: A
      ): EnchantedPromise<any>;
    }

    interface Expect {
      /**
       * @see http://unexpected.js.org/api/expect/
       */
      <A extends Array<unknown> = []>(
        subject: unknown,
        assertionName: string,
        ...args: A
      ): EnchantedPromise<any>;

      it<A extends Array<unknown> = []>(
        assertionName: string,
        subject?: unknown,
        ...args: A
      ): EnchantedPromise<any>;

      /**
       * @see http://unexpected.js.org/api/clone/
       */
      clone(): this;

      /**
       * @see http://unexpected.js.org/api/addAssertion/
       */
      addAssertion<T, A extends Array<unknown> = []>(
        pattern: string,
        handler: (expect: Expect, subject: T, ...args: A) => void,
      ): this;

      /**
       * @see http://unexpected.js.org/api/addType/
       */
      addType<T>(typeDefinition: unexpected.TypeDefinition<T>): this;

      /**
       * @see http://unexpected.js.org/api/fail/
       */
      fail<A extends Array<unknown> = []>(format: string, ...args: A): void;
      fail<E extends Error>(error: E): void;

      /**
       * @see http://unexpected.js.org/api/freeze/
       */
      freeze(): this;

      /**
       * @see http://unexpected.js.org/api/use/
       */
      use(plugin: unexpected.PluginDefinition): this;
    }

    interface PluginDefinition {
      name?: string;
      version?: string;
      dependencies?: Array<string>;
      installInto(expect: Expect): void;
    }

    interface TypeDefinition<T> {
      name: string;
      identify(value: unknown): value is T;
      base?: string;
      equal?(a: T, b: T, equal: (a: unknown, b: unknown) => boolean): boolean;
      inspect?(
        value: T,
        depth: number,
        output: any,
        inspect: (value: unknown, depth: number) => any,
      ): void;
    }
  }

  const unexpected: unexpected.Expect;

  export = unexpected;
}
