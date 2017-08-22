/**
 * This is a copypasted declaration from
 * https://github.com/facebook/flow/blob/master/lib/core.js
 * with addition of finally method
 */
declare class Promise<+R> {
    constructor(callback: (
      resolve: (result: Promise<R> | R) => void,
      reject:  (error: any) => void
    ) => mixed): void;

    then<U>(
      onFulfill?: (value: R) => Promise<U> | U,
      onReject?: (error: any) => Promise<U> | U
    ): Promise<U>;

    catch<U>(
      onReject?: (error: any) => Promise<U> | U
    ): Promise<R | U>;

    static resolve<T>(object: Promise<T> | T): Promise<T>;
    static reject<T>(error?: any): Promise<T>;
    static all<Elem, T:Iterable<Elem>>(promises: T): Promise<$TupleMap<T, typeof $await>>;
    static race<T, Elem: Promise<T> | T>(promises: Array<Elem>): Promise<T>;

    finally<T>(
      onSettled?: ?(value: any) => Promise<T> | T
    ): Promise<T>;
}
