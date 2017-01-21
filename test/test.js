'use strict';

require('mocha');
var assert = require('assert');
var captureSet = require('snapdragon-capture-set');
var Parser = require('snapdragon/lib/parser');
var Node = require('..');
var parser;
var ast;

describe('snapdragon-node', function() {
  beforeEach(function() {
    parser = new Parser()
    parser.use(captureSet())
      .captureSet('brace', /^\{/, /^\}/)
      .set('text', function() {
        var pos = this.position();
        var m = this.match(/^[^{}]/);
        if (!m) return;
        return pos({
          type: 'text',
          val: m[0]
        });
      });

    // ensure the ast is an instance of Node
    ast = new Node(parser.parse('{a{b}c}'));
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
  });

  describe('.isType', function() {
    it('should return true if the node is the given type', function() {
      assert(ast.isType('root'));
      assert(ast.last.isType('eos'));
    });
  });

  describe('.hasType', function() {
    it('should return true if node.nodes has the given type', function() {
      assert(ast.hasType('brace'));
      assert(!ast.hasType('foo'));
    });
  });

  describe('.first', function() {
    it('should get the first node from `node.nodes`', function() {
      assert(ast.first);
      assert.equal(ast.first.type, 'bos');
    });
  });

  describe('.last', function() {
    it('should get the last node from `node.nodes`', function() {
      assert(ast.last);
      assert.equal(ast.last.type, 'eos');
    });
  });

  describe('.index', function() {
    it('should get the index of the node from `node.parent.nodes`', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      var qux = new Node({type: 'qux'});
      foo.pushNode(bar);
      foo.pushNode(baz);
      foo.unshiftNode(qux);

      assert.equal(bar.index, 1);
      assert.equal(baz.index, 2);
      assert.equal(qux.index, 0);
    });
  });

  describe('.siblings', function() {
    it('should get `node.parent.nodes`', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      var qux = new Node({type: 'qux'});
      foo.pushNode(bar);
      foo.pushNode(baz);
      foo.unshiftNode(qux);

      assert.equal(foo.siblings, null);
      assert.equal(bar.siblings.length, 3);
      assert.equal(baz.siblings.length, 3);
      assert.equal(qux.siblings.length, 3);
    });
  });

  describe('.next', function() {
    it('should get the next node from `node.nodes`', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      foo.pushNode(bar);
      foo.pushNode(baz);

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
      foo.pushNode(bar);
      foo.pushNode(baz);

      parent.pushNode(a);
      parent.pushNode(foo);
      parent.pushNode(z);

      assert.equal(bar.next.type, 'baz');
      assert.equal(baz.next.type, 'z');
    });
  });

  describe('.prev', function() {
    it('should get the prev node from `node.nodes`', function() {
      var foo = new Node({type: 'foo'});
      var bar = new Node({type: 'bar'});
      var baz = new Node({type: 'baz'});
      foo.pushNode(bar);
      foo.pushNode(baz);

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
      foo.pushNode(bar);
      foo.pushNode(baz);

      parent.pushNode(a);
      parent.pushNode(foo);
      parent.pushNode(z);

      assert.equal(bar.prev.type, 'a');
      assert.equal(baz.prev.type, 'bar');
    });
  });

  describe('.getNode', function() {
    it('should get the node from `node.nodes`', function() {
      var brace = ast.getNode('brace');
      assert.equal(brace.type, 'brace');
      var open = brace.getNode('brace.open');
      assert.equal(open.type, 'brace.open');
    });

    it('should get the node from `node.nodes`', function() {
      var bos = ast.getNode(0);
      assert.equal(bos.type, 'bos');
      var brace = ast.getNode(1);
      assert.equal(brace.type, 'brace');
    });
  });

  describe('.pushNode', function() {
    it('should add a node to `node.nodes`', function() {
      var node = new Node({type: 'foo'});
      ast.pushNode(node);
      assert.equal(ast.last.type, 'foo');
    });

    it('should set the parent on the given node', function() {
      var node = new Node({type: 'foo'});
      ast.pushNode(node);
      assert(ast === node.parent);
    });

    it('should set the parent.nodes as `.siblings` on the given node', function() {
      var node = new Node({type: 'foo'});
      ast.pushNode(node);
      assert.equal(node.siblings.length, 4);
    });
  });
});
