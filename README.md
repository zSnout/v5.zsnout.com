This is the source code for the third iteration of https://zsnout.com/. For more information, check out JSDoc comments, which are available on all exported members. Additionally, expected environment variables are included in the NodeJS.ProcessEnv interface.

- [Versioning System](#versioning-system)
- [Getting the Source Code](#getting-the-source-code)
- [Building the Project](#building-the-project)
- [REPL](#repl)
- [Markdown Documents](#markdown-documents)
  - [YAML Front-Matter](#yaml-front-matter)
  - [LaTeX Support](#latex-support)
  - [Markdown Directives](#markdown-directives)
- [Client-Side Multithreading](#client-side-multithreading)
- [Schema System](#schema-system)
  - [Schema Definition](#schema-definition)
  - [Using Schemas](#using-schemas)

## Versioning System

zSnout uses a versioning system based on [Minecraft Java Edition](https://minecraft.net/). Each release is tagged as `YYwWWn` where `YY` is the last two digits of the current year, `WW` is the week number as directed by [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html), and `n` is the release number within the week. For example, a release on December 23, 2021 would be tagged as `21w51a`. If a release already existed on that week, it would be `21w51b`, `21w51c`, etc.

The reason we don't use a standard versioning system is that a website doesn't really have a "release" concept, but we want to be able to tag particular versions of the project with a defined system.

## Getting the Source Code

To quickly copy everything, open a terminal and run the following command:

```sh
curl https://raw.githubusercontent.com/zSnout/zsnout.com/main/install.sh | bash
```

This will clone this repository into `zsnout.com` in the current working directory. It also installs dependencies and builds the project.

## Building the Project

To build files, run the `build` script. Once `build` has been run at least once, you may run `watch` to automatically rebuild files when they change.

Our list of build scripts includes TypeScript, Sass, EJS, and Markdown. To optimize the end-user experience, we minify all content. Sass minifies CSS itself, UglifyJS minifies JavaScript, and a custom function minifies HTML.

To ensure that the TypeScript -> UglifyJS -> JavaScript build process works properly, we compile TypeScript into the `.client` folder and copy it using `Uglify` back into the `client` folder. Three benefits of this are 1) we can write TypeScript normally and use auto-imports, 2) we avoid race conditions that might happen by TS and Uglify trying to compile the same files, and 3) source maps still work properly, leading to a better debug experience. Yay!

## REPL

If you want to debug some stuff, you can run `npm run repl`. This runs Node's normal REPL, but starts the zSnout server automatically and places the Fastify instance into the `server` variable.

## Markdown Documents

Because Markdown is so simple, we use it to generate many of our pages. To make this process easier, we've added features such as YAML front-matter, GitHub Flavored Markdown, a custom directive system, and LaTeX support.

### YAML Front-Matter

YAML front-matter has been a good Markdown system, and we at zSnout take full advantage of it. We use it to define metadata for each page, such as the title, description, and CSS and JS files to include.

To add a title or description, add a `title` or `desc` field to the YAML, which must be strings. To add CSS or JS files, add a `css` or `js` field to the YAML, which can either be strings or arrays of strings.

### LaTeX Support

We have support for embedded LaTeX using `$`-based notation. It is rendered as an SVG on the server. Be careful with the amount of LaTeX used, as it takes up a lot of space, which is bad for both the server and client.

### Markdown Directives

To style Markdown, we use a custom directive system. This allows us to keep harnessing the brevity of Markdown while maintaining good style capabilities. We have three types of directives: global, section, and block.

To write a block directive, append `\directivename` to the beginning of a paragraph. This will add `directivename` as a class to the paragraph to the element.

To write a section directive, add `\directivename` on its own line. This will create a `<div>` with the `directivename` class around all elements until the next heading, seperator, or section directive.

To write a global directive, append `doc` to a section directive and put it at the beginning of the document. This will add the directive to the root `<div>` element.

The following code is an example of using directives, and was generated by `server/cli/md.ts`.

```markdown
\cookiedoc

\subheader Oops, you're offline! Connect to the internet and reload this page to continue.

# heading 1

\directive1

lorem impsum...

---

\directive2

\directive3 abc

\directive4

Hello, _my friends_...
```

```html
<div class="markdown cookie">
  <p class="subheader">
    Oops, you're offline! Connect to the internet and reload this page to
    continue.
  </p>
  <h1 id="heading-1" tabindex="-1">heading 1</h1>
  <div class="directive1">
    <p>lorem impsum...</p>
  </div>
  <hr />
  <div class="directive2">
    <p class="directive3">abc</p>
  </div>
  <div class="directive4">
    <p>Hello, <em>my friends</em>...</p>
  </div>
</div>
```

## Client-Side Multithreading

At zSnout, we've developed our own multithreading system, as standard `Worker`s are too complicated to use for simple tasks. To use it, import `thread` from `assets/js/thread.js`. Then, create a function and pass it to `thread`. The function will be executed in a new thread.

When starting a worker, two `Thread` objects are created: one for the worker thread and one for the main thread. You can use these to communicate with each other.

```ts
import thread, { Thread } from "/assets/js/thread.js";

function myWorker(workerThread: Thread) {
  // do some expensive work
}

let mainThread = thread(myWorker);
```

The `Thread` objects have each have `send` method that can be used to send data to the other thread.

```ts
import thread, { Thread } from "/assets/js/thread.js";

function myWorker(workerThread: Thread) {
  // do some expensive work
  workerThread.send(1 + 1);
}

let mainThread = thread(myWorker);
mainThread.send(myRequestInfo);
```

To get the data, you can use the `reciever` property, which is set to an async generator that yields values sent by the other end.

```ts
import thread, { Thread } from "/assets/js/thread.js";

async function myWorker(workerThread: Thread) {
  let request = await workerThread.reciever.next();

  // do some expensive work
  workerThread.send(1 + 1);
}

async function runLongTask() {
  let mainThread = thread(myWorker);
  mainThread.send(myRequestInfo);

  return await mainThread.reciever.next();
}

runLongTask().then(console.log);
```

Because it's an async generator, you can use `for await .. of` to iterate over messages.

```ts
import thread, { Thread } from "/assets/js/thread.js";

async function myWorker(workerThread: Thread) {
  for await (let [n1, n2] of workerThread.reciever) workerThread.send(n1 + n2);
}

let mainThread = thread(myWorker);

export function add(n1: number, n2: number) {
  mainThread.send([n1, n2]);
}

console.log(await add(7, 8));
```

You can also use the `kill` function to terminate the worker from either end.

```ts
import thread, { Thread } from "/assets/js/thread.js";

async function myWorker(workerThread: Thread) {
  for await (let [n1, n2] of workerThread.reciever) workerThread.send(n1 + n2);
}

let mainThread = thread(myWorker);
setTimeout(mainThread.kill, 1000);
```

To keep it type-safe, you can assign a generic to the `Thread` object. This limits the data that can be sent.

```ts
import thread, { Thread } from "/assets/js/thread.js";

async function myWorker(workerThread: Thread<number>) {
  // error TS2488: Type 'number' must have a '[Symbol.iterator]()' method that returns an iterator.
  for await (let [n1, n2] of workerThread.reciever);
}

let mainThread = thread(myWorker);
// error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
mainThread.send("Hello, world!");
setTimeout(mainThread.kill, 1000);
```

For seperate recieved and sent data, set the first generic to the type you want this `Thread` to recieve and the second to the type you want to send. For example, to make a worker that recieves a string and sends a number, you would do:

```ts
import thread, { Thread } from "/assets/js/thread.js";

async function myWorker(workerThread: Thread<string, number>) {
  // AsyncGenerator<string>
  workerThread.reciever;

  // (data: number) => void
  workerThread.send;
}

let mainThread = thread(myWorker);

// AsyncGenerator<number>
mainThread.reciever;

// (data: string) => void
mainThread.send;
```

## Schema System

Because we think that schema systems like JSON Schema and JTD are too wordy, we came up with our own super-simple format. There is a demonstration below. More documentation is available in the [Schema Definition](#schema-definition) section.

```ts
// Sample Array
[
  {
    name: "Zachary Sakowitz",
    username: "zsakowitz",
    email: "zsakowitz@zsnout.com",
    workHours: 2, // this is nullable
    isAdmin: true, // this is optional
  },
  {
    name: "NoReply",
    username: "noreply",
    email: "noreply@zsnout.com",
    workHours: null,
  },
];

// JSON Schema
({
  type: "array",
  items: {
    type: "object",
    properties: {
      name: { type: "string" },
      username: { type: "string" },
      email: { type: "string" },
      workHours: { type: "number" },
      isAdmin: { type: "boolean" },
    },
    required: ["name", "username", "email"],
  },
});

// JTD (JSON Type Definitions)
({
  type: "array",
  items: {
    properties: {
      name: { type: "string" },
      username: { type: "string" },
      email: { type: "string" },
      workHours: { type: "number" },
    },
    optionalProperties: {
      isAdmin: { type: "boolean" },
    },
  },
});

// zSnout's Schema System
[
  {
    name: "string",
    username: "string",
    email: "string", // "string" is the type of the item
    workHours: "number?", // the ? here says that the value is nullable
    "isAdmin?": "boolean", // the ? here says that the property is optional
  },
];
```

As you can see from the example above, our system is much smaller than other options available currently.

### Schema Definition

We have four core types: `number`, `string`, `boolean`, and `null`. You can check for these by using a string. For example,

```ts
// schema
"boolean";

// possible matches
true;

// invalid matches
57;
```

matches `true`, but doesn't match `23` or `null`.

Additionally, there is an `any` type that matches numbers, strings, booleans, arrays, and objects. It does NOT MATCH null or undefined.

Because having nullable types is so useful, we added shortcuts for nullable variations of `number`, `string`, `boolean`, and `any`. For example, `number?` matches `null` and `number`.

```ts
// schema
"string?";

// possible matches
"myname";
null;

// invalid matches
undefined;
```

We also have types for arrays, tuples, and objects. An array is an array of schemas. This allows the array to contain any of these types.

```ts
// schema
["string", "number"];

// possible matches
["zsnout", 23];
[39, "lorem ipsum", `239`8];
[];

// invalid matches
[true];
["zsnout", null];
```

Tuple types are like arrays, but they start with the `tuple` keyword.

```ts
// schema
["tuple", "string", "number"];

// possible matches
["zsnout", 23];
["lorem ipsum", `239`8];

// invalid matches
[true, "lorem ipsum", null];
[];
```

Object types specify a set of properties. Each key is the name of a property, and each value is the schema for that property. To make a property optional, add `?` to the end of the key.

```ts
// schema
({
  "username?": "string",
  fullName: "string",
  "emails?": ["string"],
  age: "number?",
});

// possible matches
({
  fullName: "Frederick Gerrison",
  username: "fredgerrison",
  age: `278`,
});
({
  fullName: "Anita Geller",
  emails: ["anita_geller@example.com"],
  age: `318`,
});

// invalid matches
({
  fullName: "Jaron Lisk",
  username: "jaronlisk",
});
({
  fullName: "Quan Pou",
  emails: ["quanpou@example.com", "quanpou@work.example.com"],
  age: null,
});
```

### Using Schemas

On the client-side, the `validate` function exported from [client/assets/js/validate.ts](client/assets/js/validate.ts) can check if data matches a certain schema. Additionally, the `fetch` function exported from [client/assets/js/fetch.ts](client/assets/js/fetch.ts) has a schema option that should be specified when dealing with data sent from the server.

On the server-side you can specify a `schema` option in `server.capture`. There are five subschema you can specify: `body`, `headers`, `params`, `query`, and `reply`. The first four are checked by Fastify at runtime. `reply` is only checked by TypeScript. Additionally, you may send an object with the signature `{ error: true; message: string }` from `reply.send`.
