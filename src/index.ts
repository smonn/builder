/**
 * Extract a function's return type or a value's type
 */
export type SchemaValue<T> = T extends (...args: any[]) => infer R ? R : T;

/**
 * Schema object type
 */
export type Schema<T> = {
  [K in keyof T]: T[K];
};

/**
 * Build result type
 */
export type BuildResult<T extends Schema<any>> = {
  [K in keyof T]: SchemaValue<T[K]>;
};

/**
 * Turn a union into an intersection type. That is, turn `A | B | C` into `A & B & C`.
 *
 * Borrowed from https://stackoverflow.com/a/50375286/971592
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Get value types from an object, e.g. `{ a: 1, b: "2" }` becomes `1 | "2"`
 */
export type ValueOf<T> = T[keyof T];

/**
 * Infer the result type of a builder
 */
export type InferResult<T> = T extends Builder<infer U>
  ? BuildResult<U>
  : never;

/**
 * Infer the options type of a builder or a schema
 */
export type InferOptions<T> = T extends Builder<infer S>
  ? InferOptions<S>
  : UnionToIntersection<
      ValueOf<{
        [K in keyof T]: T[K] extends (...args: infer R) => any
          ? R[0] & {}
          : never;
      }>
    >;

/**
 * Builder class that takes a schema and returns a builder object.
 */
export class Builder<T extends Schema<any>> {
  /**
   * Create a new builder
   */
  static of<T extends Schema<any>>(schema: T) {
    return new Builder<T>(schema);
  }

  constructor(public readonly schema: T) {}

  /**
   * Build an object from the schema using the provided options.
   * @param options Options to pass to schema functions
   * @returns A built object
   */
  build<Options extends InferOptions<T>>(options: Options): BuildResult<T> {
    return Object.entries(this.schema).reduce((acc, [key, value]) => {
      if (typeof value === "function") {
        return {
          ...acc,
          [key]: value(options),
        };
      }

      return {
        ...acc,
        [key]: value,
      };
    }, {} as BuildResult<T>);
  }

  /**
   * Build a list of objects from the schema using the provided options.
   * @param count Number of objects to build
   * @param options Options to pass to schema functions
   * @returns A list of built objects
   */
  buildList<Options extends InferOptions<T>>(count: number, options: Options) {
    return Array.from({ length: count }, () => this.build(options));
  }
}

/**
 * Returns a function that returns an incrementing number
 */
export function sequence() {
  let i = 0;
  return () => ++i;
}
