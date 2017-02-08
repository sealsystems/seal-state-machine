'use strict';

const Transition = function (name, nextNode, executeCallback) {
  if (!name) {
    throw new Error('Transition name is missing.');
  }
  if (!nextNode) {
    throw new Error('Next node name is missing.');
  }
  if (!executeCallback) {
    throw new Error('Transition execution callback is missing.');
  }
  this.name = name;
  this.nextNode = nextNode;
  this.executeCallback = executeCallback;
};

Transition.prototype.getName = function () {
  return this.name;
};

Transition.prototype.getNextNode = function () {
  return this.nextNode;
};

Transition.prototype.runTransit = function (machine, node, payload, callback) {
  const that = this;

  if (!machine) {
    throw new Error('Machine is missing.');
  }
  if (!node) {
    throw new Error('Node is missing.');
  }
  if (!payload) {
    throw new Error('Payload is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }
  that.executeCallback.call(machine, node, that, payload, (errExecute) => {
    callback(errExecute, that.nextNode);
  });
};

module.exports = Transition;
