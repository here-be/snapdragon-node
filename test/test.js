'use strict';

require('mocha');
var assert = require('assert');
var Parser = require('snapdragon/lib/parser');
var Node = require('..');
var parser;

describe('snapdragon-node', function() {
  beforeEach(function() {
    parser = new Parser();
  });

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
    var node = new Node(pos);

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
    var node = new Node(pos, '*');

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
    var node = new Node(pos, '*', 'star');

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
    var node = new Node(pos, {val: '*', type: 'star'});

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
