'use strict';

const Node = require('./Node');
const Transition = require('./Transition');

const Machine = function() {
  throw new Error('Do not call this function.');
};

Machine.prototype.init = function() {
  this.currentNode = undefined;
  this.previousNode = undefined;
  this.currentTransit = undefined;
  this.preTransit = undefined;
  this.postTransit = undefined;
  this.nodes = {};

  return this;
};

Machine.prototype.node = function(nodeName) {
  if (!nodeName) {
    throw new Error('Node name is missing.');
  }
  this.nodes[nodeName] = this.nodes[nodeName] || new Node(nodeName);

  return this.nodes[nodeName];
};

Machine.prototype.initialNode = function(nodeName) {
  if (!nodeName) {
    throw new Error('Node name is missing.');
  }
  if (!this.nodes[nodeName]) {
    throw new Error('Invalid node name.');
  }
  this.currentNode = nodeName;
};

Machine.prototype.getCurrentNode = function() {
  return this.currentNode;
};

Machine.prototype.getPreviousNode = function() {
  return this.previousNode;
};

Machine.prototype.getCurrentTransition = function() {
  return this.currentTransit;
};

Machine.prototype.preTransition = function(preTransitCallback) {
  if (!preTransitCallback) {
    throw new Error('Pre-transition callback is missing.');
  }
  if (typeof preTransitCallback !== 'function') {
    throw new Error('Pre-transition-callback is not a function.');
  }
  this.preTransit = new Transition('preTransition', 'preTransition', preTransitCallback);
};

Machine.prototype.postTransition = function(postTransitCallback) {
  if (!postTransitCallback) {
    throw new Error('Post-transition callback is missing.');
  }
  if (typeof postTransitCallback !== 'function') {
    throw new Error('Post-transition-callback is not a function.');
  }
  this.postTransit = new Transition('postTransition', 'postTransition', postTransitCallback);
};

Machine.prototype.runPreTransit = async function(payload) {
  if (this.preTransit) {
    return await this.preTransit.runTransit(this, this.nodes[this.currentNode], payload);
  }
};

Machine.prototype.runPostTransit = async function(payload) {
  if (this.postTransit) {
    return await this.postTransit.runTransit(this, this.nodes[this.currentNode], payload);
  }
};

Machine.prototype.runTransitionOnNodes = async function(transitionName, payload) {
  if (!this.nodes[this.currentNode].getTransition(transitionName)) {
    throw new Error('Transition missing.');
  }

  await this.nodes[this.currentNode].runLeave(this, payload);

  const nextNode = await this.nodes[this.currentNode].runTransit(this, transitionName, payload);

  if (!this.nodes[nextNode]) {
    throw new Error('Invalid node name.');
  }

  this.previousNode = this.currentNode;
  this.currentNode = nextNode;

  await this.nodes[this.currentNode].runEnter(this, payload);

  return nextNode;
};

Machine.prototype.transit = async function(transitionName, payload) {
  if (!transitionName) {
    throw new Error('Transition name is missing.');
  }
  if (!this.currentNode) {
    throw new Error('Initial node is missing.');
  }

  payload = payload || {};

  await this.runPreTransit(payload);

  if (this.currentTransit) {
    throw new Error('Transition running.');
  }

  this.currentTransit = {
    transition: transitionName,
    node: this.currentNode
  };

  let nextNode;

  try {
    nextNode = await this.runTransitionOnNodes(transitionName, payload);
    // eslint-disable-next-line no-useless-catch
  } catch (ex) {
    throw ex;
  } finally {
    this.currentTransit = undefined;
  }

  await this.runPostTransit(payload);

  return { nextNode, payload };
};

module.exports = Machine;
