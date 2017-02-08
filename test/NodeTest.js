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
    testNode.leave(() => {
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
    testNode.enter(() => {
    });
    assert.that(testNode.enterTransition).is.not.undefined();
    assert.that(testNode.enterTransition.getName()).is.equalTo('enter');
    done();
  });

  test('runLeave function throws error if machine is missing', (done) => {
    assert.that(() => {
      testNode.runLeave();
    }).is.throwing('Machine is missing.');
    done();
  });

  test('runLeave function throws error if payload is missing', (done) => {
    assert.that(() => {
      testNode.runLeave({});
    }).is.throwing('Payload is missing.');
    done();
  });

  test('runLeave function throws error if callback is missing', (done) => {
    assert.that(() => {
      testNode.runLeave({}, {});
    }).is.throwing('Callback is missing.');
    done();
  });

  test('runLeave function calls leave function', (done) => {
    let leaveCalled = 0;

    testNode.leave((node, transition, payload, cb) => {
      leaveCalled++;
      cb(null);
    });
    testNode.runLeave({}, {}, (err) => {
      assert.that(err).is.null();
      assert.that(leaveCalled).is.equalTo(1);
      done();
    });
  });

  test('runLeave function calls callback if leave function is undefined', (done) => {
    testNode.runLeave({}, {}, (err) => {
      assert.that(err).is.null();
      done();
    });
  });

  test('runEnter function throws error if machine is missing', (done) => {
    assert.that(() => {
      testNode.runEnter();
    }).is.throwing('Machine is missing.');
    done();
  });

  test('runEnter function throws error if payload is missing', (done) => {
    assert.that(() => {
      testNode.runEnter({});
    }).is.throwing('Payload is missing.');
    done();
  });

  test('runEnter function throws error if callback is missing', (done) => {
    assert.that(() => {
      testNode.runEnter({}, {});
    }).is.throwing('Callback is missing.');
    done();
  });

  test('runEnter function calls enter function', (done) => {
    let enterCalled = 0;

    testNode.enter((node, transition, payload, cb) => {
      enterCalled++;
      cb(null);
    });
    testNode.runEnter({}, {}, (err) => {
      assert.that(err).is.null();
      assert.that(enterCalled).is.equalTo(1);
      done();
    });
  });

  test('runEnter function calls callback if enter function is undefined', (done) => {
    testNode.runEnter({}, {}, (err) => {
      assert.that(err).is.null();
      done();
    });
  });

  test('runTransit function throws error if machine is missing', (done) => {
    assert.that(() => {
      testNode.runTransit();
    }).is.throwing('Machine is missing.');
    done();
  });

  test('runTransit function throws error if transition name missing', (done) => {
    assert.that(() => {
      testNode.runTransit({});
    }).is.throwing('Transition name is missing.');
    done();
  });

  test('runTransit function throws error if callback is missing', (done) => {
    assert.that(() => {
      testNode.runTransit({}, 'silius');
    }).is.throwing('Callback is missing.');
    done();
  });

  test('runTransit function returns error if transition is missing', (done) => {
    testNode.runTransit({}, 'kill nero', {}, (err, nextNode) => {
      assert.that(err.message).is.equalTo('Transition missing.');
      assert.that(nextNode).is.equalTo('Test');
      done();
    });
  });

  test('runTransit function executes transition', (done) => {
    let transits = 0;

    testNode.transition('galba', 'Test', (node, transition, payload, cb) => {
      transits++;
      assert.that(payload.pay).is.equalTo('now');
      cb(null);
    });
    testNode.runTransit({}, 'galba', { pay: 'now' }, (err, nextNode) => {
      assert.that(err).is.null();
      assert.that(nextNode).is.equalTo('Test');
      assert.that(transits).is.equalTo(1);
      done();
    });
  });
});
