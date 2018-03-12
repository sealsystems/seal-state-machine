# @sealsystems/state-machine

[![CircleCI](https://circleci.com/gh/sealsystems/seal-state-machine.svg?style=svg)](https://circleci.com/gh/sealsystems/seal-state-machine)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/6trqwybv62iq9k9o?svg=true)](https://ci.appveyor.com/project/Plossys/seal-state-machine)

Finite state machine.

## Installation

```bash
$ npm install @sealsystems/state-machine
```

## Quick start

First you need to integrate @sealsystems/state-machine into your application.

```javascript
const stateMachine = require('@sealsystems/state-machine');
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

node.transition('Garfield', 'NothingLeft', async (node, transition) => {
  console.log('Soon it will be eaten');
});
MyMachine.prototype.initialNode('Lasagne');
```
Instaniate machine object and use it.

```javascript
const myMachine = new MyMachine();

console.log(myMachine.getCurrentNode());
await myMachine.transit('Garfield');
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

### Machine.preTransition(async preTransitCallback)

- async preTransitCallback(node, transition, payload, callback) - Transition callback (async). Node is leaving node, transition
  name is always `preTransition`

Sets a async callback which is always called by the machine before any transition is executed.

### Machine.postTransition(async postTransitCallback)

- async postTransitCallback(node, transition, payload, callback) - Transition callback (async). Node is new entered node, transition
  name is always `postTransition`

Sets a async callback which is always called by the machine after any transition is executed successfully.

### (async) Machine.transit(transitionName [, payload])

- `transitionName` - Name of transition to execute.
- `payload` optional The runtime data of the transition. If omitted, an empty object will be created.

Execute a transit (async) and returns the `nodeName`, which is the name of the new currentNode.

### Node.getName()

Returns name of the node.

### Node.transition(transitionName, nextNode, async executeFunction)

- `transitionName` - Arbitrary name to identify the transition
- `nextNode` - Name of the node after the transit finished successfully
- `async executeFunction(node, transition, payload)` - The function to execute the transit. It is called as member function
  of Machine object.
  - `this` is the Machine instance.
  - `node` is the object of the leaving node.
  - `transition` is the executing transition object.
  - `payload` is the runtime data object of the transition and is passed to all callbacks from `preTransition`
    to `postTransition`..

Add a new transition to a node. Returns the node object.

### Node.getTransition(transitionName)

- transitionName - Name of transiton

Returns transition object with given name or undefined if transition does not exist.

### Node.leave(async leaveFunction)

- async leaveFunction(node, transition, payload) - Called before a transit when the node is going to be left.
  The `node`is the node object to be left, `transition` is a helper transition with the name `leave`.

Set function which is always called when a node is going to be left. Returns the node object.

### Node.enter(async enterFunction)

- async enterFunction(node, transition, payload) - Called after a transit when the node is already entered.
  The `node`is the node object entered, `transition` is a helper transition with the name `enter`.

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
