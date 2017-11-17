'use strict';

require('mocha');
var assert = require('assert');
var define = require('define-property');
var Parser = require('snapdragon/lib/parser');
var BaseNode = require('..');
var parser;
var ast;

class Node extends BaseNode {
  define(key, val) {
    define(this, key, val);
    return this;
  }
}

describe('snapdragon-node', function() {
  beforeEach(function() {
    parser = new Parser({Node: Node})
      .set('text', function() {
        var match = this.match(/^[a-z]+/);
        if (match) {
          return this.node(match[0]);
        }
      })
      .set('slash', function() {
        var match = this.match(/^\//);
        if (match) {
          return this.node(match[0]);
        }
      })
      .set('star', function() {
        var match = this.match(/^\*/);
        if (match) {
          return this.node(match[0]);
        }
      })

    ast = new Node(parser.parse('a/*/c'));
  });

  describe('node', function() {
    it('should export a function', function() {
      assert.equal(typeof Node, 'function');
    });

    it('should create a new Node with the given object', function() {
      var node = new Node({val: '*', type: 'star'});
      assert.equal(node.val, '*');
      assert.equal(node.type, 'star');
    });

    it('should create a new Node with the given position', function() {
      var pos = parser.position();
      var node = pos(new Node());

      assert(node.position);
      assert(node.position.start);
      assert(node.position.start.line);
      assert(node.position.start.column);

      assert(node.position.end);
      assert(node.position.end.line);
      assert(node.position.end.column);
    });

    it('should create a new Node with the given position and val', function() {
      var pos = parser.position();
      var node = pos(new Node('*'));

      assert.equal(node.val, '*');

      assert(node.position);
      assert(node.position.start);
      assert(node.position.start.line);
      assert(node.position.start.column);

      assert(node.position.end);
      assert(node.position.end.line);
      assert(node.position.end.column);
    });

    it('should create a new Node with the given position, type, and val', function() {
      var pos = parser.position();
      var node = pos(new Node('*', 'star'));

      assert.equal(node.val, '*');
      assert.equal(node.type, 'star');

      assert(node.position);
      assert(node.position.start);
      assert(node.position.start.line);
      assert(node.position.start.column);

      assert(node.position.end);
      assert(node.position.end.line);
      assert(node.position.end.column);
    });

    it('should create a new Node with the given position and object', function() {
      var pos = parser.position();
      var node = pos(new Node({val: '*', type: 'star'}));

      assert.equal(node.val, '*');
      assert.equal(node.type, 'star');

      assert(node.position);
      assert(node.position.start);
      assert(node.position.start.line);
      assert(node.position.start.column);

      assert(node.position.end);
      assert(node.position.end.line);
      assert(node.position.end.column);
    });

    it('should extend type and val onto a node', function() {
      var node = new Node({type: 'foo', val: 'bar'});
      assert.equal(node.type, 'foo');
      assert.equal(node.val, 'bar');
    });

    it('should extend arbitrary properties onto a node', function() {
      var node = new Node({type: 'foo', val: 'bar', baz: 'qux'});
      assert.equal(node.baz, 'qux');
    });

    it('should not extend existing getter properties onto a node', function() {
      var node = new Node({type: 'foo', val: 'bar', index: 11});
      assert.equal(node.index, -1);
    });
  });

  describe('.clone', function() {
    it.only('should deep clone a node', function() {
      var brace = new Node({type: 'brace', foo: 'bar'});
      var lbrace = new Node({type: 'lbrace', val: '{'});
      var inner = new Node({type: 'inner', val: 'a,b,c'});
      var rbrace = new Node({type: 'rbrace', val: '}'});
      brace.push(lbrace);
      brace.push(inner);
      brace.push(rbrace);
      var cloned = brace.clone();

      assert(cloned !== brace);
      assert.equal(cloned.nodes.length, 3);
      assert.equal(brace.nodes.length, 3);
      assert(cloned.nodes !== brace.nodes);
      assert(cloned.nodes[0] !== brace.nodes[0]);
      assert.deepEqual(cloned, brace);
      assert.equal(cloned.foo, 'bar');
      assert.equal(brace.foo, 'bar');
    });
  });

  describe('.isType', function() {
    it('should return true if the node is the given type', function() {
      assert(ast.isType('root'));
      assert(ast.last.isType('eos'));
    });
  });

  describe('.hasType', function() {
    it('should return true if node.nodes has the given type', function() {
      assert(ast.hasType('star'));
      assert(!ast.hasType('foo'));
    });

    it('should return false when a node does not exist', function() {
      var node = new Node('foo');
      assert.equal(node.hasType('slslsllsls'), false);
    });
  });

  describe('.first', function() {
    it('should get the first node from `node.nodes`', function() {
      assert(ast.first);
      assert.equal(ast.first.type, 'bos');
    });

    it('should return null when no nodes exist', function() {
      var node = new Node('foo');
      assert.equal(node.first, null);
    });
  });

  describe('.last', function() {
    it('should get the last node from `node.nodes`', function() {
      assert(ast.last);
      assert.equal(ast.last.type, 'eos');
    });

    it('should return null when no nodes exist', function() {
      var node = new Node('foo');
      assert.equal(node.last, null);
    });
  });

  describe('.index', function() {
    it('should get the index of a node from node.parent.nodes', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      var qux = new Node({type: 'qux'});
      foo.unshift(qux);
      foo.push(bar);
      foo.push(baz);

      assert.equal(bar.index, 1);
      assert.equal(baz.index, 2);
      assert.equal(qux.index, 0);
    });

    it('should allow an index to be set but returns the correct index', function() {
      var node = new Node('foo');
      var foo = new Node('foo');
      node.push(foo);
      foo.index = 42;
      assert.equal(foo.index, 0);
    });

    it('should return -1 when siblings do not exist', function() {
      var foo = new Node('foo');
      assert.equal(foo.index, -1);
    });
  });

  describe('.siblings', function() {
    it('should get `node.parent.nodes`', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      var qux = new Node({type: 'qux'});
      foo.push(bar);
      foo.push(baz);
      foo.unshift(qux);

      assert.equal(foo.siblings, null);
      assert.equal(bar.siblings.length, 3);
      assert.equal(baz.siblings.length, 3);
      assert.equal(qux.siblings.length, 3);
    });

    it('should throw an error if set', function() {
      assert.throws(function() {
        var node = new Node('foo');
        node.siblings = [];
      });
    });
  });

  describe('.isEmpty', function() {
    it('should return true when node.nodes does not exist', function() {
      var node = new Node({type: 'foo'});
      assert(node.isEmpty());
    });

    it('should return true when node.val is an empty string', function() {
      var node = new Node({type: 'text', val: ''});
      assert(node.isEmpty());
    });

    it('should return true when node.val is undefined', function() {
      var node = new Node({type: 'text'});
      assert(node.isEmpty());
    });

    it('should return false when node.nodes is not empty', function() {
      var node = new Node({type: 'foo'});
      node.push(new Node({type: 'text', val: 'foo'}));
      assert.equal(node.isEmpty(), false);
    });

    it('should return true when node.nodes is empty', function() {
      var node = new Node({type: 'foo'});
      node.push(new Node({type: 'text', val: 'foo'}));
      assert.equal(node.isEmpty(), false);
      node.pop();
      assert.equal(node.isEmpty(), true);
    });
  });

  describe('.push', function() {
    it('should push nodes onto node.nodes', function() {
      var node = new Node({type: 'foo'});
      assert(!node.nodes);
      node.push(new Node({type: 'a'}));
      assert.equal(node.nodes.length, 1);
      node.push(new Node({type: 'b'}));
      assert.equal(node.nodes.length, 2);
      node.push(new Node({type: 'c'}));
      assert.equal(node.nodes.length, 3);
      node.push(new Node({type: 'd'}));
      assert.equal(node.nodes.length, 4);
    });
  });

  describe('.unshift', function() {
    it('should unshift nodes onto node.nodes', function() {
      var node = new Node({type: 'foo'});
      assert(!node.nodes);
      node.unshift(new Node({type: 'a'}));
      assert.equal(node.nodes.length, 1);
      node.unshift(new Node({type: 'b'}));
      assert.equal(node.nodes.length, 2);
      node.unshift(new Node({type: 'c'}));
      assert.equal(node.nodes.length, 3);
      node.unshift(new Node({type: 'd'}));
      assert.equal(node.nodes.length, 4);
    });
  });

  describe('.pop', function() {
    it('should remove the last node from node.nodes', function() {
      var node = new Node({type: 'foo'});
      node.push(new Node({type: 'a'}));
      node.push(new Node({type: 'b'}));
      node.push(new Node({type: 'c'}));
      node.push(new Node({type: 'd'}));
      assert.equal(node.nodes.length, 4);

      node.pop();
      assert.equal(node.nodes.length, 3);
    });
  });

  describe('.shift', function() {
    it('should remove the last node from node.nodes', function() {
      var node = new Node({type: 'foo'});
      node.push(new Node({type: 'a'}));
      node.push(new Node({type: 'b'}));
      node.push(new Node({type: 'c'}));
      node.push(new Node({type: 'd'}));
      assert.equal(node.nodes.length, 4);

      node.shift();
      assert.equal(node.nodes.length, 3);
    });

    it('should not blow up when no nodes exist', function() {
      var node = new Node({type: 'foo'});
      node.shift();
      assert(node.isEmpty());
    });
  });

  describe('.remove', function() {
    it('should not do anything when a node does not exist', function() {
      var node = new Node({type: 'foo'});
      assert(node.isEmpty());
      node.remove(new Node({type: 'a'}))
      assert(node.isEmpty());
    });

    it('should remove the given node from node.nodes', function() {
      var node = new Node({type: 'foo'});
      var a = new Node({type: 'a'});
      var b = new Node({type: 'b'});
      var c = new Node({type: 'c'});
      var d = new Node({type: 'd'});
      node.push(a);
      node.push(b);
      node.push(c);
      node.push(d);

      assert.equal(node.nodes.length, 4);
      assert.equal(a.index, 0);
      assert.equal(b.index, 1);
      assert.equal(c.index, 2);
      assert.equal(d.index, 3);

      node.remove(b);
      assert.equal(node.nodes.length, 3);
      assert.equal(a.index, 0);
      assert.equal(b.index, -1);
      assert.equal(c.index, 1);
      assert.equal(d.index, 2);
      assert.equal(node.find('a'), a);
      assert.equal(node.find('b'), null);
      assert.equal(node.find('c'), c);
      assert.equal(node.find('d'), d);
    });
  });

  describe('.prev', function() {
    it('should throw an error when setter is set', function() {
      assert.throws(function() {
        var node = new Node('foo');
        node.prev = new Node('bar');
      });
    });

    it('should get the prev node from node.nodes', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});

      foo.push(bar);
      foo.push(baz);

      assert.equal(bar.prev, null);
      assert.equal(baz.prev.type, 'bar');
    });

    it('should get the prev node from `node.parent.nodes`', function() {
      var parent = new Node({type: 'parent'});

      var a = new Node({type: 'a'});
      var z = new Node({type: 'z'});

      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});

      foo.push(bar);
      foo.push(baz);

      parent.push(a);
      parent.push(foo);
      parent.push(z);

      assert.equal(bar.prev.type, 'a');
      assert.equal(baz.prev.type, 'bar');
    });
  });

  describe('.next', function() {
    it('should throw an error when setter is set', function() {
      assert.throws(function() {
        var node = new Node('foo');
        node.next = new Node('bar');
      });
    });

    it('should get the next node from `node.nodes`', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      foo.push(bar);
      foo.push(baz);

      assert.equal(bar.next.type, 'baz');
      assert.equal(baz.next, null);
    });

    it('should get the next node from `node.parent.nodes`', function() {
      var parent = new Node({type: 'parent'});
      var a = new Node({type: 'a'});
      var z = new Node({type: 'z'});

      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      foo.push(bar);
      foo.push(baz);

      parent.push(a);
      parent.push(foo);
      parent.push(z);

      assert.equal(bar.next.type, 'baz');
      assert.equal(baz.next.type, 'z');
    });
  });

  describe('.find', function() {
    it('should get a node by type from `node.nodes`', function() {
      assert.equal(ast.find('text').type, 'text');
      assert.equal(ast.find('star').type, 'star');
    });

    it('should get a node by index from `node.nodes`', function() {
      assert.equal(ast.find(0).type, 'bos');
      assert.equal(ast.find(1).type, 'text');
    });

    it('should return null when a node does not exist', function() {
      var node = new Node('foo');
      assert.equal(node.find('slslsllsls'), null);
    });
  });

  describe('.push', function() {
    it('should add a node to `node.nodes`', function() {
      var node = new Node({type: 'foo'});
      ast.push(node);
      assert.equal(ast.last.type, 'foo');
    });

    it('should set the parent on the given node', function() {
      var node = new Node({type: 'foo'});
      ast.push(node);
      assert(ast === node.parent);
    });

    it('should set the parent.nodes as siblings', function() {
      var node = new Node({type: 'foo'});
      ast.push(node);
      assert.equal(node.siblings.length, 8);
    });

    it('should get the node.index from siblings', function() {
      var node = new Node({type: 'foo'});
      ast.push(node);
      assert.equal(node.index, 7);
    });
  });

  describe('.remove', function() {
    it('should remove a node from `node.nodes`', function() {
      var node = new Node({type: 'brace', nodes: []});

      var two = new Node('two', 'text');
      node.push(new Node('one', 'text'));
      node.push(two);
      node.push(new Node('three', 'text'));
      assert.equal(node.nodes.length, 3);
      node.remove(two);
      assert.equal(node.nodes.length, 2);
    });
  });
});
