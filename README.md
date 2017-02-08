# seal-state-machine

Finite state machine.

## Installation

```bash
$ npm install seal-state-machine
```

## Quick start

First you need to integrate seal-state-machine into your application.

```javascript
const stateMachine = require('seal-state-machine');
```

Then create your own constructor function or use an empty default one to create a new state machine.

```javascript
const ExampleConstructor = function () {
  // do some initialization here
};
const MyMachine = stateMachine.extend(ExampleConstructor);
```

Add nodes and transitions and set default start node.

```javascript
const node = MyMachine.prototype.node('Lasagne');
MyMachine.prototype.node('NothingLeft');

node.transition('Garfield', 'NothingLeft', (node, transition, done) => {
  console.log('Soon it will be eaten');
  done();
});
MyMachine.prototype.initialNode('Lasagne');
```
Instaniate machine object and use it.

```javascript
const myMachine = new MyMachine();

console.log(myMachine.getCurrentNode());
myMachine.transit('Garfield');
console.log(myMachine.getCurrentNode());
```

## API

### stateMachine.extend(Constructor)

- Constructor optional Constructor function for new state machine

Extends the given constructor function or an empty default function by mixin Machine specific functions.
Returns the Constructor function.

### Machine.node(nodeName)

- nodeName - Name of a new or existing node

Returns node object of name `nodeName`. Creates new node if not present.

### Machine.initialNode(nodeName)

- nodeName - Name of initial node. The node has to be added before.

Set the initial node the machine should start with.

### Machine.getCurrentNode()

Returns name of current node, undefined if no initial node is given.

### Machine.getPreviousNode()

Returns name of previous node, undefined if no transit occurred.

### Machine.getCurrentTransition()

Returns object with name of current transition and leaving node.
Object structure:

```javascript
{
  transition: 'transition name'
  node: node-object
}
```

### Machine.preTransition(preTransitCallback)

- preTransitCallback(node, transition, payload, callback) - Transition callback. Node is leaving node, transition
  name is always `preTransition`

Sets a callback which is always called my the machine before any transition is executed.

### Machine.postTransition(postTransitCallback)

- postTransitCallback(node, transition, payload, callback) - Transition callback. Node is new entered node, transition
  name is always `postTransition`

Sets a callback which is always called my the machine after any transition is executed successfully.

### Machine.transit(transitionName [, payload], callback)

- `transitionName` - Name of transition to execute.
- `payload` optional The runtime data of the transition. If omitted, an empty object will be created.
- `callback(err, nodeName, payload)` - Is called after transit finished.
  - `err` Is set when an error occurred
  - `nodeName` is the name of the new currentNode. `nodeName` may be set even if an error occurred, depending on which part
    of the transition failed.
  - `payload` The resulting transition payload, if no error occurred.

Execute a transit.

### Node.getName()

Returns name of the node.

### Node.transition(transitionName, nextNode, executeFunction)

- `transitionName` - Arbitrary name to identify the transition
- `nextNode` - Name of the node after the transit finished successfully
- `executeFunction(node, transition, payload, callback)` - The function to execute the transit. It is called as member function
  of Machine object.
  - `this` is the Machine instance.
  - `node` is the object of the leaving node.
  - `transition` is the executing transition object.
  - `payload` is the runtime data object of the transition and is passed to all callbacks from `preTransition`
    to `postTransition`.
  - The `callback` functions when finished executing transition. It expects an error object in case the transition failed or null.

Add a new transition to a node. Returns the node object.

### Node.getTransition(transitionName)

- transitionName - Name of transiton

Returns transition object with given name or undefined if transition does not exist.

### Node.leave(leaveFunction)

- leaveFunction(node, transition, payload, callback) - Called before a transit when the node is going to be left.
  The `node`is the node object to be left, `transition` is a helper transition with the name `leave`.
  The `callback` functions expects an error object in case leaving node failed or null.

Set function which is always called when a node is going to be left. Returns the node object.

### Node.enter(enterFunction)

- enterFunction(node, transition, payload, callback) - Called after a transit when the node is already entered.
  The `node`is the node object entered, `transition` is a helper transition with the name `enter`.
  The `callback` functions expects an error object in case entering node failed or null.

Set function which is always called when the node is entered after a transit. Returns the node object.

### Transition.getName()

Returns name of the transition.

### Transition.getNextNode()

Returns name of target node after transit.

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```bash
$ bot
```
