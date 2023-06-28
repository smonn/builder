# @smonn/builder

Build objects from schemas.

```sh
npm install @smonn/builder
```

```ts
import { Builder, type InferOptions, type InferResult, sequence } from "@smonn/builder";

const nested = Builder.from({
  // use functions for dynamic values
  shout: ({ message }: { message: string }) => message.toUpperCase(),
});

const builder = Builder.from({
  // automatically increment the id using the sequence helper
  id: sequence(),

  // non-function values are used as-is
  literal: 42,

  // nest builders to make more complex objects
  nested: (options: InferOptions<typeof nested> & { count: number }) =>
    nested.buildList(options.count, options),
});

// obj type === InferResult<typeof builder>
const obj = builder.build({
  // options will be an intersection of the first parameter to each function in the schema
  // note: take care to not mismatch the option types when reusing the same keys
  message: "Hello World",
  count: 2,
});
// => { id: 1, literal: 42, nested: [{ shout: "HELLO WORLD" }, { shout: "HELLO WORLD" }] }
```
