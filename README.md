# snapdragon-node [![NPM version](https://img.shields.io/npm/v/snapdragon-node.svg?style=flat)](https://www.npmjs.com/package/snapdragon-node) [![NPM monthly downloads](https://img.shields.io/npm/dm/snapdragon-node.svg?style=flat)](https://npmjs.org/package/snapdragon-node)  [![NPM total downloads](https://img.shields.io/npm/dt/snapdragon-node.svg?style=flat)](https://npmjs.org/package/snapdragon-node) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/snapdragon-node.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/snapdragon-node)

> Snapdragon utility for creating a new AST node in custom code, such as plugins.

<details>
<summary><strong>Table of Contents</strong></summary>
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [About](#about)
</details>

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save snapdragon-node
```

## Usage

With [snapdragon](https://github.com/jonschlinkert/snapdragon) v0.9.0 and higher you can use `this.node()` to create a new `Node`, whenever it makes sense.

```js
var Node = require('snapdragon-node');
var Snapdragon = require('snapdragon');
var snapdragon = new Snapdragon();

// example usage inside a parser visitor function
snapdragon.parser.set('foo', function() {
  var pos = this.position();
  // if the regex matches the substring at the current position
  // on `this.input`, return the match
  var match = this.match(/foo/);
  if (match) {
    // if node.type is not defined on the node, the parser
    // will automatically add it
    var node = pos(new Node(match[0]));

    // or, explictly pass a type
    var node = pos(new Node(match[0], 'bar'));
    // or
    var node = pos(new Node({type: 'bar', val: match[0]}));
    return node;
  }
});
```

## API

### [Node](index.js#L20)

Create a new AST `Node` with the given `val` and `type`.

**Params**

* `val` **{String|Object}**: Pass a matched substring, or an object to merge onto the node.
* `type` **{String}**: The node type to use when `val` is a string.
* `returns` **{Object}**: node instance

**Example**

```js
var node = new Node('*', 'Star');
var node = new Node({type: 'star', val: '*'});
```

### [.define](index.js#L49)

Define a non-enumberable property on the node instance.

**Params**

* `name` **{String}**
* `val` **{any}**
* `returns` **{Object}**: returns the node instance

**Example**

```js
var node = new Node();
node.define('foo', 'something non-enumerable');
```

### [.pushNode](index.js#L69)

Given node `foo` and node `bar`, push node `bar` onto `foo.nodes`, and set `foo` as `bar.parent`.

**Params**

* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
foo.pushNode(bar);
```

### [.addNode](index.js#L81)

Alias for [pushNode](#pushNode) for backwards compatibility with 0.1.0.

### [.unshiftNode](index.js#L100)

Given node `foo` and node `bar`, unshift node `bar` onto `foo.nodes`, and set `foo` as `bar.parent`.

**Params**

* `node` **{Object}**
* `returns` **{undefined}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
foo.unshiftNode(bar);
```

### [.getNode](index.js#L122)

Get the first child node from `node.nodes` that matches the given `type`. If `type` is a number, the child node at that index is returned.

**Params**

* `type` **{String}**
* `returns` **{Object}**: Returns a child node or undefined.

**Example**

```js
var child = node.getNode(1); //<= index of the node to get
var child = node.getNode('foo');
var child = node.getNode(/^(foo|bar)$/);
var child = node.getNode(['foo', 'bar']);
```

### [.isType](index.js#L141)

Return true if the node is the given `type`.

**Params**

* `type` **{String}**
* `returns` **{Boolean}**

**Example**

```js
var node = new Node({type: 'bar'});
cosole.log(node.isType('foo'));          // false
cosole.log(node.isType(/^(foo|bar)$/));  // true
cosole.log(node.isType(['foo', 'bar'])); // true
```

### [.hasType](index.js#L163)

Return true if the `node.nodes` has the given `type`.

**Params**

* `type` **{String}**
* `returns` **{Boolean}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
foo.pushNode(bar);

cosole.log(foo.hasType('qux'));          // false
cosole.log(foo.hasType(/^(qux|bar)$/));  // true
cosole.log(foo.hasType(['qux', 'bar'])); // true
```

### [.siblings](index.js#L185)

Get the siblings array, or `null` if it doesn't exist.

* `returns` **{Array}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
var baz = new Node({type: 'baz'});
foo.pushNode(bar);
foo.pushNode(baz);

console.log(bar.siblings.length) // 2
console.log(baz.siblings.length) // 2
```

### [.prev](index.js#L206)

Get the previous node from the siblings array or `null`.

* `returns` **{Object}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
var baz = new Node({type: 'baz'});
foo.pushNode(bar);
foo.pushNode(baz);

console.log(baz.prev.type) // 'bar'
```

### [.next](index.js#L230)

Get the siblings array, or `null` if it doesn't exist.

* `returns` **{Object}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
var baz = new Node({type: 'baz'});
foo.pushNode(bar);
foo.pushNode(baz);

console.log(bar.siblings.length) // 2
console.log(baz.siblings.length) // 2
```

### [.index](index.js#L258)

Get the node's current index from `node.parent.nodes`. This should always be correct, even when the parent adds nodes.

* `returns` **{Number}**

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
var baz = new Node({type: 'baz'});
var qux = new Node({type: 'qux'});
foo.pushNode(bar);
foo.pushNode(baz);
foo.unshiftNode(qux);

console.log(bar.index) // 1
console.log(baz.index) // 2
console.log(qux.index) // 0
```

### [.first](index.js#L286)

Get the first node from `node.nodes`.

* `returns` **{Object}**: The first node, or undefiend

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
var baz = new Node({type: 'baz'});
var qux = new Node({type: 'qux'});
foo.pushNode(bar);
foo.pushNode(baz);
foo.pushNode(qux);

console.log(foo.first.type) // 'bar'
```

### [.last](index.js#L309)

Get the last node from `node.nodes`.

* `returns` **{Object}**: The last node, or undefiend

**Example**

```js
var foo = new Node({type: 'foo'});
var bar = new Node({type: 'bar'});
var baz = new Node({type: 'baz'});
var qux = new Node({type: 'qux'});
foo.pushNode(bar);
foo.pushNode(baz);
foo.pushNode(qux);

console.log(foo.last.type) // 'qux'
```

## About

### Related projects

* [snapdragon-capture](https://www.npmjs.com/package/snapdragon-capture): Snapdragon plugin that adds a capture method to the parser instance. | [homepage](https://github.com/jonschlinkert/snapdragon-capture "Snapdragon plugin that adds a capture method to the parser instance.")
* [snapdragon-util](https://www.npmjs.com/package/snapdragon-util): Utilities for the snapdragon parser/compiler. | [homepage](https://github.com/jonschlinkert/snapdragon-util "Utilities for the snapdragon parser/compiler.")
* [snapdragon](https://www.npmjs.com/package/snapdragon): Fast, pluggable and easy-to-use parser-renderer factory. | [homepage](https://github.com/jonschlinkert/snapdragon "Fast, pluggable and easy-to-use parser-renderer factory.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This document was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

To generate the readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.1, on January 21, 2017._