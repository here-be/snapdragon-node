const Node = require('./');
// either pass on object with "type" and (optional) "val"
const node1 = new Node({type: 'star', val: '*'});
// or pass "val" (first) and "type" (second) as string
const node2 = new Node('*', 'star');
// both result in => Node { type: 'star', val: '*' }

console.log(node1)
console.log(node2)
