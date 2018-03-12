'use strict';

const assert = require('assertthat');

const Node = require('../lib/Node');
const Transition = require('../lib/Transition');

suite('stateMachine.Node', () => {
  let testNode;

  setup((done) => {
    testNode = new Node('Test');
    done();
  });

  test('is a function', (done) => {
    assert.that(Node).is.ofType('function');
    done();
  });

  test('throws error if name is missing', (done) => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Node();
      /* eslint-enable no-new */
    }).is.throwing('Node name is missing.');
    done();
  });

  test('getName function returns name of node', (done) => {
    const node = new Node('octavius');

    assert.that(node.getName()).is.equalTo('octavius');
    done();
  });

  test('transition function throws error if transition name is missing', (done) => {
    assert.that(() => {
      testNode.transition();
    }).is.throwing('Transition name is missing.');
    done();
  });

  test('transition function throws error if next node is missing', (done) => {
    assert.that(() => {
      testNode.transition('tiberius');
    }).is.throwing('Transition target node is missing.');
    done();
  });

  test('transition function throws error if execution callback is missing', (done) => {
    assert.that(() => {
      testNode.transition('clemens', 'caligula');
    }).is.throwing('Transition execution callback is missing.');
    done();
  });

  test('transition function creates transition', (done) => {
    testNode.transition('claudius', 'scribonianus', () => {
    });
    assert.that(testNode.transitions.claudius).is.not.undefined();
    done();
  });

  test('getTtransition function returns undefined if transition does not exist', (done) => {
    assert.that(testNode.getTransition('claudius')).is.undefined();
    done();
  });

  test('getTransition function returns transition', (done) => {
    testNode.transition('claudius', 'scribonianus', () => {
    });
    assert.that(testNode.getTransition('claudius')).is.not.undefined();
    assert.that(testNode.getTransition('claudius')).is.instanceOf(Transition);
    done();
  });

  test('leave function throws error if leave function is missing', (done) => {
    assert.that(() => {
      testNode.leave();
    }).is.throwing('Leave-callback is missing.');
    done();
  });

  test('leave function throws error if callback is not a function', (done) => {
    assert.that(() => {
      testNode.leave({});
    }).is.throwing('Leave-callback is not a function.');
    done();
  });

  test('leave function creates leave transition', (done) => {
    testNode.leave(async () => {
    });
    assert.that(testNode.leaveTransition).is.not.undefined();
    assert.that(testNode.leaveTransition.getName()).is.equalTo('leave');
    done();
  });

  test('enter function throws error if enter function is missing', (done) => {
    assert.that(() => {
      testNode.enter();
    }).is.throwing('Enter-callback is missing.');
    done();
  });

  test('enter function throws error if callback is not a function', (done) => {
    assert.that(() => {
      testNode.enter({});
    }).is.throwing('Enter-callback is not a function.');
    done();
  });

  test('enter function creates enter transition', (done) => {
    testNode.enter(async () => {
    });
    assert.that(testNode.enterTransition).is.not.undefined();
    assert.that(testNode.enterTransition.getName()).is.equalTo('enter');
    done();
  });

  test('runLeave function throws error if machine is missing', async () => {
    await assert.that(async () => {
      await testNode.runLeave();
    }).is.throwingAsync('Machine is missing.');
  });

  test('runLeave function throws error if payload is missing', async () => {
    await assert.that(async () => {
      await testNode.runLeave({});
    }).is.throwingAsync('Payload is missing.');
  });

  test('runLeave function calls leave function', async () => {
    let leaveCalled = 0;

    testNode.leave(async () => {
      leaveCalled++;
    });

    await testNode.runLeave({}, {});

    assert.that(leaveCalled).is.equalTo(1);
  });

  test('runLeave function returns if leave function is undefined', async () => {
    await testNode.runLeave({}, {});
  });

  test('runEnter function throws error if machine is missing', async () => {
    await assert.that(async () => {
      await testNode.runEnter();
    }).is.throwingAsync('Machine is missing.');
  });

  test('runEnter function throws error if payload is missing', async () => {
    await assert.that(async () => {
      await testNode.runEnter({});
    }).is.throwingAsync('Payload is missing.');
  });

  test('runEnter function calls enter function', async () => {
    let enterCalled = 0;

    testNode.enter(async () => {
      enterCalled++;
    });

    await testNode.runEnter({}, {});

    assert.that(enterCalled).is.equalTo(1);
  });

  test('runEnter function returns if enter function is undefined', async () => {
    await testNode.runEnter({}, {});
  });

  test('runTransit function throws error if machine is missing', async () => {
    await assert.that(async () => {
      await testNode.runTransit();
    }).is.throwingAsync('Machine is missing.');
  });

  test('runTransit function throws error if transition name missing', async () => {
    await assert.that(async () => {
      await testNode.runTransit({});
    }).is.throwingAsync('Transition name is missing.');
  });

  test('runTransit function throws error if transition is missing', async () => {
    await assert.that(async () => {
      await testNode.runTransit({}, 'kill nero', {});
    }).is.throwingAsync('Transition missing.');
  });

  test('runTransit function executes transition', async () => {
    let transits = 0;

    testNode.transition('galba', 'Test', async (node, transition, payload) => {
      transits++;
      assert.that(payload.pay).is.equalTo('now');
    });

    const nextNode = await testNode.runTransit({}, 'galba', { pay: 'now' });

    assert.that(nextNode).is.equalTo('Test');
    assert.that(transits).is.equalTo(1);
  });
});
