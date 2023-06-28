import test from "ava";
import { Builder, InferOptions, Schema, sequence } from ".";

test("new Builder(...)", (t) => {
  const b = new Builder({});
  t.true(b instanceof Builder);
});

test("Builder.from(...)", (t) => {
  const b = Builder.of({});
  t.true(b instanceof Builder);
});

const buildMacro = test.macro<
  [[Schema<any>, InferOptions<Schema<any>>], unknown]
>((t, [input, options], expected) => {
  const b = new Builder(input);
  t.deepEqual(b.build(options), expected);
});

test("build - empty schema", buildMacro, [{}, {}], {});
test(
  "build - primitives",
  buildMacro,
  [
    {
      a: 1,
      b: "2",
      c: true,
      d: null,
      e: undefined,
    },
    {},
  ],
  {
    a: 1,
    b: "2",
    c: true,
    d: null,
    e: undefined,
  }
);
test(
  "build - functions",
  buildMacro,
  [
    {
      a: () => 1,
      b: () => "2",
      c: () => true,
      d: () => null,
      e: () => undefined,
    },
    {},
  ],
  {
    a: 1,
    b: "2",
    c: true,
    d: null,
    e: undefined,
  }
);
test(
  "build - functions and primitives",
  buildMacro,
  [
    {
      a: () => 1,
      b: "2",
      c: () => true,
      d: null,
      e: () => undefined,
    },
    {},
  ],
  {
    a: 1,
    b: "2",
    c: true,
    d: null,
    e: undefined,
  }
);
const fooBuilder = new Builder({
  message: ({ message }: { message: string }) => message.toUpperCase(),
});
test(
  "build - nested",
  buildMacro,
  [
    {
      foo: (options: InferOptions<typeof fooBuilder>) =>
        fooBuilder.build(options),
    },
    {
      message: "uppercase",
    },
  ],
  {
    foo: {
      message: "UPPERCASE",
    },
  }
);

const buildListMacro = test.macro<
  [[Schema<any>, InferOptions<Schema<any>>], unknown]
>((t, [input, options], expected) => {
  const b = new Builder(input);
  t.deepEqual(
    b.buildList(2, options),
    Array.isArray(expected) ? expected : [expected, expected]
  );
});

test("buildList - empty schema", buildListMacro, [{}, {}], {});

let index = 0;
test(
  "buildList - sequence",
  buildListMacro,
  [{ a: () => ++index }, {}],
  [{ a: 1 }, { a: 2 }]
);

test("example", (t) => {
  const nested = Builder.of({
    shout: ({ message }: { message: string }) => message.toUpperCase(),
  });

  const builder = Builder.of({
    id: sequence(),
    literal: 42,
    nested: (options: InferOptions<typeof nested> & { count: number }) =>
      nested.buildList(options.count, options),
  });

  const obj = builder.build({
    message: "Hello World",
    count: 2,
  });

  t.deepEqual(obj, {
    id: 1,
    literal: 42,
    nested: [{ shout: "HELLO WORLD" }, { shout: "HELLO WORLD" }],
  });
});
