'use strict';

const clone = require('clone-deep');
const typeOf = require('kind-of');
const define = require('define-property');
const utils = require('snapdragon-util');
let memo;

/**
 * Create a new AST `Node` with the given `val` and `type`.
 *
 * ```js
 * const node = new Node('*', 'Star');
 * const node = new Node({type: 'star', val: '*'});
 * ```
 * @name Node
 * @param {String|Object} `val` Pass a matched substring, or an object to merge onto the node.
 * @param {String} `type` The node type to use when `val` is a string.
 * @return {Object} node instance
 * @api public
 */

class Node {
  constructor(val, type, parent) {
    if (typeof type !== 'string') {
      parent = type || parent;
      type = null;
    }

    define(this, 'isNode', true);
    define(this, 'parent', parent);
    define(this, 'count', 0);

    if (typeof type !== 'string' && typeOf(val) === 'object') {
      define(this, 'token', clone(val, true));
      assign(this, val);
    } else {
      this.type = type;
      this.val = val;
    }
  }

  /**
   * Returns true if the given value is a node.
   *
   * ```js
   * const Node = require('snapdragon-node');
   * const node = new Node({type: 'foo'});
   * console.log(Node.isNode(node)); //=> true
   * console.log(Node.isNode({})); //=> false
   * ```
   * @param {Object} `node`
   * @returns {Boolean}
   * @api public
   */

  static isNode(node) {
    return utils.isNode(node);
  }

  /**
   * Deep clone the node.
   *
   * ```js
   * const Node = require('snapdragon-node');
   * const node = new Node({type: 'foo'});
   * const newNode = node.clone();
   * console.log(node === newNode); //=> false
   * console.log(newNode.type); //=> 'foo'
   * ```
   * @param {Object} `node`
   * @returns {Boolean}
   * @api public
   */

  clone() {
    return new this.constructor(clone(this, true));
  }

  /**
   * Define a non-enumberable property on the node instance.
   * Useful for adding properties that shouldn't be extended
   * or visible during debugging.
   *
   * ```js
   * const node = new Node();
   * node.define('foo', 'something non-enumerable');
   * ```
   * @param {String} `name`
   * @param {any} `val`
   * @return {Object} returns the node instance
   * @api public
   */

  define(name, val) {
    console.warn('node.define is deprecated, see the snapdragon changelog');
    define(this, name, val);
    return this;
  }

  /**
   * Returns true if `node.val` is an empty string, or `node.nodes` does
   * not contain any non-empty text nodes.
   *
   * ```js
   * const node = new Node({type: 'text'});
   * node.isEmpty(); //=> true
   * node.val = 'foo';
   * node.isEmpty(); //=> false
   * ```
   * @param {Function} `fn` (optional) Filter function that is called on `node` and/or child nodes. `isEmpty` will return false immediately when the filter function returns false on any nodes.
   * @return {Boolean}
   * @api public
   */

  isEmpty(fn) {
    return utils.isEmpty(this, fn);
  }

  /**
   * Given node `foo` and node `bar`, push node `bar` onto `foo.nodes`, and
   * set `foo` as `bar.parent`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * foo.push(bar);
   * ```
   * @param {Object} `node`
   * @return {Number} Returns the length of `node.nodes`
   * @api public
   */

  push(node) {
    expect(Node.isNode(node), 'node', 'Node');
    define(node, 'parent', this);

    this.nodes = this.nodes || [];
    this.count++;
    return this.nodes.push(node);
  }

  /**
   * Given node `foo` and node `bar`, unshift node `bar` onto `foo.nodes`, and
   * set `foo` as `bar.parent`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * foo.unshift(bar);
   * ```
   * @param {Object} `node`
   * @return {Number} Returns the length of `node.nodes`
   * @api public
   */

  unshift(node) {
    expect(Node.isNode(node), 'node', 'Node');
    define(node, 'parent', this);

    this.nodes = this.nodes || [];
    this.count++;
    return this.nodes.unshift(node);
  }

  /**
   * Pop a node from `node.nodes`.
   *
   * ```js
   * const node = new Node({type: 'foo'});
   * node.push(new Node({type: 'a'}));
   * node.push(new Node({type: 'b'}));
   * node.push(new Node({type: 'c'}));
   * node.push(new Node({type: 'd'}));
   * console.log(node.nodes.length);
   * //=> 4
   * node.pop();
   * console.log(node.nodes.length);
   * //=> 3
   * ```
   * @return {Number} Returns the popped `node`
   * @api public
   */

  pop() {
    this.count--;
    return this.nodes && this.nodes.pop();
  }

  /**
   * Shift a node from `node.nodes`.
   *
   * ```js
   * const node = new Node({type: 'foo'});
   * node.push(new Node({type: 'a'}));
   * node.push(new Node({type: 'b'}));
   * node.push(new Node({type: 'c'}));
   * node.push(new Node({type: 'd'}));
   * console.log(node.nodes.length);
   * //=> 4
   * node.shift();
   * console.log(node.nodes.length);
   * //=> 3
   * ```
   * @return {Object} Returns the shifted `node`
   * @api public
   */

  shift() {
    this.count--;
    return this.nodes && this.nodes.shift();
  }

  /**
   * Remove `node` from `node.nodes`.
   *
   * ```js
   * node.remove(childNode);
   * ```
   * @param {Object} `node`
   * @return {Object} Returns the removed node.
   * @api public
   */

  remove(node) {
    expect(Node.isNode(node), 'node', 'Node');
    this.nodes = this.nodes || [];
    const idx = node.index;
    if (idx !== -1) {
      node.index = -1;
      return this.nodes.splice(idx, 1);
    }
    return null;
  }

  /**
   * Get the first child node from `node.nodes` that matches the given `type`.
   * If `type` is a number, the child node at that index is returned.
   *
   * ```js
   * const child = node.find(1); //<= index of the node to get
   * const child = node.find('foo'); //<= node.type of a child node
   * const child = node.find(/^(foo|bar)$/); //<= regex to match node.type
   * const child = node.find(['foo', 'bar']); //<= array of node.type(s)
   * ```
   * @param {String} `type`
   * @return {Object} Returns a child node or undefined.
   * @api public
   */

  find(type) {
    return utils.findNode(this.nodes, type);
  }

  /**
   * Return true if the node is the given `type`.
   *
   * ```js
   * const node = new Node({type: 'bar'});
   * cosole.log(node.isType('foo'));          // false
   * cosole.log(node.isType(/^(foo|bar)$/));  // true
   * cosole.log(node.isType(['foo', 'bar'])); // true
   * ```
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isType(type) {
    return utils.isType(this, type);
  }

  /**
   * Return true if the `node.nodes` has the given `type`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * foo.push(bar);
   *
   * cosole.log(foo.hasType('qux'));          // false
   * cosole.log(foo.hasType(/^(qux|bar)$/));  // true
   * cosole.log(foo.hasType(['qux', 'bar'])); // true
   * ```
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  hasType(type) {
    return utils.hasType(this, type);
  }

  /**
   * Get the siblings array, or `null` if it doesn't exist.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * foo.push(bar);
   * foo.push(baz);
   *
   * console.log(bar.siblings.length) // 2
   * console.log(baz.siblings.length) // 2
   * ```
   * @return {Array}
   * @api public
   */

  set siblings(val) {
    throw new Error('node.siblings is a getter and cannot be defined');
  }
  get siblings() {
    return this.parent ? this.parent.nodes : null;
  }

  /**
   * Get the node's current index from `node.parent.nodes`.
   * This should always be correct, even when the parent adds nodes.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * const qux = new Node({type: 'qux'});
   * foo.push(bar);
   * foo.push(baz);
   * foo.unshift(qux);
   *
   * console.log(bar.index) // 1
   * console.log(baz.index) // 2
   * console.log(qux.index) // 0
   * ```
   * @return {Number}
   * @api public
   */

  set index(index) {
    define(this, 'idx', index);
  }
  get index() {
    if (!Array.isArray(this.siblings)) {
      return -1;
    }
    const tok = this.idx !== -1 ? this.siblings[this.idx] : null;
    if (tok !== this) {
      this.idx = this.siblings.indexOf(this);
    }
    return this.idx;
  }

  /**
   * Get the previous node from the siblings array or `null`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * foo.push(bar);
   * foo.push(baz);
   *
   * console.log(baz.prev.type) // 'bar'
   * ```
   * @return {Object}
   * @api public
   */

  set prev(val) {
    throw new Error('node.prev is a getter and cannot be defined');
  }
  get prev() {
    if (Array.isArray(this.siblings)) {
      return this.siblings[this.index - 1] || this.parent.prev;
    }
    return null;
  }

  /**
   * Get the siblings array, or `null` if it doesn't exist.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * foo.push(bar);
   * foo.push(baz);
   *
   * console.log(bar.siblings.length) // 2
   * console.log(baz.siblings.length) // 2
   * ```
   * @return {Object}
   * @api public
   */

  set next(val) {
    throw new Error('node.next is a getter and cannot be defined');
  }
  get next() {
    if (Array.isArray(this.siblings)) {
      return this.siblings[this.index + 1] || this.parent.next;
    }
    return null;
  }

  /**
   * Get the first node from `node.nodes`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * const qux = new Node({type: 'qux'});
   * foo.push(bar);
   * foo.push(baz);
   * foo.push(qux);
   *
   * console.log(foo.first.type) // 'bar'
   * ```
   * @return {Object} The first node, or undefiend
   * @api public
   */

  get first() {
    return this.nodes ? this.nodes[0] : null;
  }

  /**
   * Get the last node from `node.nodes`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * const qux = new Node({type: 'qux'});
   * foo.push(bar);
   * foo.push(baz);
   * foo.push(qux);
   *
   * console.log(foo.last.type) // 'qux'
   * ```
   * @return {Object} The last node, or undefiend
   * @api public
   */

  get last() {
    return this.nodes ? utils.last(this.nodes) : null;
  }

  /**
   * Get the last node from `node.nodes`.
   *
   * ```js
   * const foo = new Node({type: 'foo'});
   * const bar = new Node({type: 'bar'});
   * const baz = new Node({type: 'baz'});
   * const qux = new Node({type: 'qux'});
   * foo.push(bar);
   * foo.push(baz);
   * foo.push(qux);
   *
   * console.log(foo.last.type) // 'qux'
   * ```
   * @return {Object} The last node, or undefiend
   * @api public
   */

  get scope() {
    return !this.isScope ? this.parent : this;
  }
}

/**
 * Get own property names from Node prototype, but only the
 * first time `Node` is instantiated
 */

function getOwnPropertyNames() {
  return memo || (memo = Object.getOwnPropertyNames(Node.prototype));
}

/**
 * Returns true if the given array contains `key`
 */

function contains(arr, key) {
  return arr.indexOf(key) !== -1;
}

function assign(node, token) {
  const ownNames = getOwnPropertyNames();
  for (let key of Object.keys(token)) {
    if (!contains(ownNames, key)) {
      node[key] = token[key];
    }
  }
}

/**
 * Simplified assertion. Throws an error is `val` is not true.
 */

function assert(val, message) {
  if (val !== true) throw new Error(message);
}
function expect(val, name, expected) {
  assert(val, 'expected ' + name + ' to be an instance of ' + expected);
}

/**
 * Expose `Node`
 */

exports = module.exports = Node;
