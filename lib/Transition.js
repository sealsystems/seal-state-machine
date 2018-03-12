'use strict';

class Transition {
  constructor (name, nextNode, execute) {
    if (!name) {
      throw new Error('Transition name is missing.');
    }
    if (!nextNode) {
      throw new Error('Next node name is missing.');
    }
    if (!execute) {
      throw new Error('Transition execution callback is missing.');
    }

    this.name = name;
    this.nextNode = nextNode;
    this.execute = execute;
  }

  getName () {
    return this.name;
  }

  getNextNode () {
    return this.nextNode;
  }

  async runTransit (machine, node, payload) {
    if (!machine) {
      throw new Error('Machine is missing.');
    }
    if (!node) {
      throw new Error('Node is missing.');
    }
    if (!payload) {
      throw new Error('Payload is missing.');
    }

    await this.execute.call(machine, node, this, payload);

    return this.nextNode;
  }
}

module.exports = Transition;
