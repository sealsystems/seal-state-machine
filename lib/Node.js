'use strict';

const Transition = require('./Transition');

const Node = function (name) {
  if (!name) {
    throw new Error('Node name is missing.');
  }
  this.name = name;
  this.transitions = {};
  this.leaveTransition = undefined;
  this.enterTransition = undefined;
};

Node.prototype.getName = function () {
  return this.name;
};

Node.prototype.transition = function (name, nextNode, executeCallback) {
  if (!name) {
    throw new Error('Transition name is missing.');
  }
  if (!nextNode) {
    throw new Error('Transition target node is missing.');
  }
  if (!executeCallback) {
    throw new Error('Transition execution callback is missing.');
  }
  this.transitions[name] = new Transition(name, nextNode, executeCallback);
  return this;
};

Node.prototype.getTransition = function (transitionName) {
  return this.transitions[transitionName];
};

Node.prototype.leave = function (leaveCallback) {
  if (!leaveCallback) {
    throw new Error('Leave-callback is missing.');
  }
  if (typeof leaveCallback !== 'function') {
    throw new Error('Leave-callback is not a function.');
  }
  this.leaveTransition = new Transition('leave', 'leave', leaveCallback);
  return this;
};

Node.prototype.enter = function (enterCallback) {
  if (!enterCallback) {
    throw new Error('Enter-callback is missing.');
  }
  if (typeof enterCallback !== 'function') {
    throw new Error('Enter-callback is not a function.');
  }
  this.enterTransition = new Transition('enter', 'enter', enterCallback);
  return this;
};

Node.prototype.runLeave = function (machine, payload, callback) {
  if (!machine) {
    throw new Error('Machine is missing.');
  }
  if (!payload) {
    throw new Error('Payload is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }
  if (this.leaveTransition) {
    return this.leaveTransition.runTransit(machine, this, payload, callback);
  }
  callback(null);
};

Node.prototype.runEnter = function (machine, payload, callback) {
  if (!machine) {
    throw new Error('Machine is missing.');
  }
  if (!payload) {
    throw new Error('Payload is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }
  if (this.enterTransition) {
    return this.enterTransition.runTransit(machine, this, payload, callback);
  }
  callback(null);
};

Node.prototype.runTransit = function (machine, transitionName, payload, callback) {
  if (!machine) {
    throw new Error('Machine is missing.');
  }
  if (!transitionName) {
    throw new Error('Transition name is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }
  if (!this.transitions[transitionName]) {
    return callback(new Error('Transition missing.'), this.name);
  }
  this.transitions[transitionName].runTransit(machine, this, payload, callback);
};

module.exports = Node;
