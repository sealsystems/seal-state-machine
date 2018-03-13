'use strict';

const Transition = require('./Transition');

class Node {
  constructor (name) {
    if (!name) {
      throw new Error('Node name is missing.');
    }

    this.name = name;
    this.transitions = {};
    this.leaveTransition = undefined;
    this.enterTransition = undefined;
  }

  getName () {
    return this.name;
  }

  transition (name, nextNode, executionCallback) {
    if (!name) {
      throw new Error('Transition name is missing.');
    }
    if (!nextNode) {
      throw new Error('Transition target node is missing.');
    }
    if (!executionCallback) {
      throw new Error('Transition execution callback is missing.');
    }

    this.transitions[name] = new Transition(name, nextNode, executionCallback);

    return this;
  }

  getTransition (transitionName) {
    return this.transitions[transitionName];
  }

  leave (leaveCallback) {
    if (!leaveCallback) {
      throw new Error('Leave-callback is missing.');
    }
    if (typeof leaveCallback !== 'function') {
      throw new Error('Leave-callback is not a function.');
    }

    this.leaveTransition = new Transition('leave', 'leave', leaveCallback);

    return this;
  }

  enter (enterCallback) {
    if (!enterCallback) {
      throw new Error('Enter-callback is missing.');
    }
    if (typeof enterCallback !== 'function') {
      throw new Error('Enter-callback is not a function.');
    }

    this.enterTransition = new Transition('enter', 'enter', enterCallback);

    return this;
  }

  async runLeave (machine, payload) {
    if (!machine) {
      throw new Error('Machine is missing.');
    }
    if (!payload) {
      throw new Error('Payload is missing.');
    }

    if (this.leaveTransition) {
      return await this.leaveTransition.runTransit(machine, this, payload);
    }
  }

  async runEnter (machine, payload) {
    if (!machine) {
      throw new Error('Machine is missing.');
    }
    if (!payload) {
      throw new Error('Payload is missing.');
    }

    if (this.enterTransition) {
      return await this.enterTransition.runTransit(machine, this, payload);
    }
  }

  async runTransit (machine, transitionName, payload) {
    if (!machine) {
      throw new Error('Machine is missing.');
    }
    if (!transitionName) {
      throw new Error('Transition name is missing.');
    }

    if (!this.transitions[transitionName]) {
      throw new Error('Transition missing.');
    }

    return await this.transitions[transitionName].runTransit(machine, this, payload);
  }
}

module.exports = Node;
