'use strict';

const typeOf = require('kind-of');
const isObject = val => typeOf(val) === 'object';
let memo;

/**
 * Create a new AST `Node` with the given `value` and `type`.
 *
 * ```js
 * const node = new Node('*', 'Star');
 * const node = new Node({type: 'star', value: '*'});
 * ```
 * @name Node
 * @param {String|Object} `value` Pass a matched substring, or an object to merge onto the node.
 * @param {String} `type` The node type to use when `value` is a string.
 * @return {Object} node instance
 * @api public
 */

class Node {
  constructor(value, type, parent) {
    if (typeof type !== 'string') {
      parent = type || parent;
      type = null;
    }

    define(this, 'parent', parent);

    if (typeof type !== 'string' && isObject(value)) {
      Object.assign(this, value);
    } else {
      this.type = type;
      this.value = value;
    }
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
    expect(Node.isNode(node), 'node');
    define(node, 'parent', this);

    this.nodes = this.nodes || [];
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
    expect(Node.isNode(node), 'node');
    define(node, 'parent', this);

    this.nodes = this.nodes || [];
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
    expect(Node.isNode(node), 'node');
    if (!this.nodes) return null;
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
    if (!Array.isArray(this.nodes)) return null;
    if (this.nodes.length === 0) return null;
    if (typeof type === 'number') return this.nodes[type];
    for (const node of this.nodes) {
      if (isType(node, type)) {
        return node;
      }
    }
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
    return isType(this, type);
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
    if (!Array.isArray(this.nodes)) return false;
    if (this.nodes.length === 0) return false;
    for (const node of this.nodes) {
      if (isType(node, type)) {
        return true;
      }
    }
    return false;
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

  set siblings(value) {
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

  set prev(value) {
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

  set next(value) {
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
    return this.nodes ? last(this.nodes) : null;
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

  get isNode() {
    return true;
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
    return isObject(node) && node.isNode === true;
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
 * Simplified assertion. Throws an error is `value` is not true.
 */

function assert(value, message) {
  if (value !== true) throw new Error(message);
}
function expect(value, name) {
  assert(value, 'expected ' + name + ' to be an instance of Node');
}

function last(arr, n = 1) {
  return Array.isArray(arr) ? arr[arr.length - n] : null;
}

function isType(node, type) {
  switch (typeOf(type)) {
    case 'string':
      return node.type === type;
    case 'regexp':
      return type.test(node.type);
    case 'array':
      for (const key of type) {
        if (node.isType(node, key)) {
          return true;
        }
      }
      return false;
    default: {
      throw new TypeError('expected "type" to be an array, string or regexp');
    }
  }
}

function define(obj, key, value) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: value
  });
}

/**
 * Expose `Node`
 */

exports = module.exports = Node;
