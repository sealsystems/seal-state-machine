'use strict';

const assert = require('assertthat');

const stateMachine = require('../lib/stateMachine');

suite('stateMachine.index', () => {
  setup((done) => {
    done();
  });

  teardown((done) => {
    done();
  });

  test('is an object', (done) => {
    assert.that(stateMachine).is.ofType('object');
    done();
  });

  test('contains extend function', (done) => {
    assert.that(stateMachine.extend).is.ofType('function');
    done();
  });

  test('returns constructor when called with parameter', (done) => {
    const Constructor = function () {};
    const result = stateMachine.extend(Constructor);

    assert.that(result).is.equalTo(Constructor);
    assert.that(result.prototype.node).is.not.undefined();
    done();
  });

  test('returns default constructor when called without parameter', (done) => {
    const Result = stateMachine.extend();

    assert.that(Result).is.ofType('function');
    assert.that(Result.prototype.node).is.not.undefined();
    assert.that(new Result()).is.ofType('object');
    done();
  });

  test('changes between states', async () => {
    let endCalled = 0;
    let startCalled = 0;
    const MyConstructor = function () {};

    stateMachine.extend(MyConstructor);
    MyConstructor.prototype.node('start').transition('thisIsTheEnd', 'end', async (currentNode, transition, payload) => {
      endCalled++;
      payload.job = 4712;
      assert.that(currentNode.getName()).is.equalTo('start');
      assert.that(transition.getName()).is.equalTo('thisIsTheEnd');
    });
    MyConstructor.prototype.node('end').transition('andAgain', 'start', async (currentNode, transition, payload) => {
      startCalled++;
      payload.job++;
      assert.that(currentNode.getName()).is.equalTo('end');
      assert.that(transition.getName()).is.equalTo('andAgain');
    });

    const myMachine = new MyConstructor();

    myMachine.initialNode('start');
    assert.that(myMachine.getCurrentNode()).is.equalTo('start');

    const { nextNode, payload } = await myMachine.transit('thisIsTheEnd');

    assert.that(nextNode).is.equalTo('end');
    assert.that(payload.job).is.equalTo(4712);

    const result = await myMachine.transit('andAgain', payload);
    const nextNode2 = result.nextNode;

    assert.that(nextNode2).is.equalTo('start');
    assert.that(payload.job).is.equalTo(4713);

    assert.that(startCalled).is.equalTo(1);
    assert.that(endCalled).is.equalTo(1);
  });

  test('override default initial node', (done) => {
    const MyConstructor = function () {};

    stateMachine.extend(MyConstructor);
    MyConstructor.prototype.node('start').transition('thisIsTheEnd', 'end', async () => {});
    MyConstructor.prototype.node('end').transition('andAgain', 'start', async () => {});
    MyConstructor.prototype.initialNode('end');

    const myMachine = new MyConstructor();

    assert.that(myMachine.getCurrentNode()).is.equalTo('end');
    myMachine.initialNode('start');
    assert.that(myMachine.getCurrentNode()).is.equalTo('start');
    done();
  });
});
