'use strict';

const Node = require('./Node');
const Transition = require('./Transition');

const Machine = function () {
  throw new Error('Do not call this function.');
};

Machine.prototype.init = function () {
  this.currentNode = undefined;
  this.previousNode = undefined;
  this.currentTransit = undefined;
  this.preTransit = undefined;
  this.postTransit = undefined;
  this.nodes = {};
  return this;
};

Machine.prototype.node = function (nodeName) {
  if (!nodeName) {
    throw new Error('Node name is missing.');
  }
  this.nodes[nodeName] = this.nodes[nodeName] || new Node(nodeName);
  return this.nodes[nodeName];
};

Machine.prototype.initialNode = function (nodeName) {
  if (!nodeName) {
    throw new Error('Node name is missing.');
  }
  if (!this.nodes[nodeName]) {
    throw new Error('Invalid node name.');
  }
  this.currentNode = nodeName;
};

Machine.prototype.getCurrentNode = function () {
  return this.currentNode;
};

Machine.prototype.getPreviousNode = function () {
  return this.previousNode;
};

Machine.prototype.getCurrentTransition = function () {
  return this.currentTransit;
};

Machine.prototype.preTransition = function (preTransitCallback) {
  if (!preTransitCallback) {
    throw new Error('Pre-transition callback is missing.');
  }
  if (typeof preTransitCallback !== 'function') {
    throw new Error('Pre-transition-callback is not a function.');
  }
  this.preTransit = new Transition('preTransition', 'preTransition', preTransitCallback);
};

Machine.prototype.postTransition = function (postTransitCallback) {
  if (!postTransitCallback) {
    throw new Error('Post-transition callback is missing.');
  }
  if (typeof postTransitCallback !== 'function') {
    throw new Error('Post-transition-callback is not a function.');
  }
  this.postTransit = new Transition('postTransition', 'postTransition', postTransitCallback);
};

Machine.prototype.runPreTransit = function (payload, callback) {
  if (this.preTransit) {
    return this.preTransit.runTransit(this, this.nodes[this.currentNode], payload, callback);
  }
  callback(null);
};

Machine.prototype.runPostTransit = function (payload, callback) {
  if (this.postTransit) {
    return this.postTransit.runTransit(this, this.nodes[this.currentNode], payload, callback);
  }
  callback(null);
};

Machine.prototype.runTransitionOnNodes = function (transitionName, payload, callback) {
  if (!this.nodes[this.currentNode].getTransition(transitionName)) {
    return callback(new Error('Transition missing.'), this.currentNode);
  }

  this.nodes[this.currentNode].runLeave(this, payload, (errLeave) => {
    if (errLeave) {
      return callback(errLeave);
    }
    this.nodes[this.currentNode].runTransit(this, transitionName, payload, (errRun, nextNode) => {
      if (errRun) {
        return callback(errRun);
      }
      if (!this.nodes[nextNode]) {
        throw new Error('Invalid node name.');
      }

      this.previousNode = this.currentNode;
      this.currentNode = nextNode;
      this.nodes[this.currentNode].runEnter(this, payload, (errEnter) => {
        callback(errEnter, nextNode);
      });
    });
  });
};

Machine.prototype.transit = function (transitionName, payload, callback) {
  if (!transitionName) {
    throw new Error('Transition name is missing.');
  }

  if (!callback) {
    callback = payload;
    payload = {};
  }

  if (!callback) {
    throw new Error('Callback is missing.');
  }

  if (!this.currentNode) {
    throw new Error('Initial node is missing.');
  }

  this.runPreTransit(payload, (errPreTransit) => {
    if (errPreTransit) {
      return callback(errPreTransit);
    }

    if (this.currentTransit) {
      return callback(new Error('Transition running.'));
    }

    this.currentTransit = {
      transition: transitionName,
      node: this.currentNode
    };

    this.runTransitionOnNodes(transitionName, payload, (errTransit, nextNode) => {
      this.currentTransit = undefined;
      if (errTransit) {
        return callback(errTransit, nextNode);
      }
      this.runPostTransit(payload, (errPostTransit) => {
        callback(errPostTransit, nextNode, payload);
      });
    });
  });
  return this;
};

module.exports = Machine;
