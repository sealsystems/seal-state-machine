'use strict';

const _ = require('lodash');

const Machine = require('./Machine');

const stateMachine = {
  extend (Constructor) {
    Constructor = Constructor || function () {};

    _.extend(Constructor.prototype, Machine.prototype);

    Constructor.prototype.init();
    return Constructor;
  }
};

module.exports = stateMachine;
