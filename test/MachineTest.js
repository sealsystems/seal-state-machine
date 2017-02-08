'use strict';

const _ = require('lodash');
const assert = require('assertthat');

const Node = require('../lib/Node');
const Machine = require('../lib/Machine');

suite('stateMachine.Machine', () => {
  let TestMachine;

  setup((done) => {
    TestMachine = function () {
    };
    _.extend(TestMachine.prototype, Machine.prototype);
    TestMachine.prototype.init();
    done();
  });

  test('is a function', (done) => {
    assert.that(Machine).is.ofType('function');
    done();
  });

  test('throws error if instantiated', (done) => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Machine();
      /* eslint-enable no-new */
    }).is.throwing('Do not call this function.');
    done();
  });

  test('init resets state and returns Machine prototype', (done) => {
    TestMachine.prototype.currentNode = 'hugo';
    assert.that(TestMachine.prototype.currentNode).is.equalTo('hugo');

    const Result = TestMachine.prototype.init();

    assert.that(TestMachine.prototype.currentNode).is.undefined();
    assert.that(Result).is.equalTo(TestMachine.prototype);
    done();
  });

  test('node function throws error if node name is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.node();
    }).is.throwing('Node name is missing.');
    done();
  });

  test('node function returns new node', (done) => {
    assert.that(TestMachine.prototype.nodes.Hugo).is.undefined();
    const hugo = TestMachine.prototype.node('Hugo');

    assert.that(hugo instanceof Node).is.true();
    assert.that(hugo.getName()).is.equalTo('Hugo');
    assert.that(TestMachine.prototype.nodes.Hugo).is.sameAs(hugo);
    done();
  });

  test('node function returns same node for same name if called multiple times', (done) => {
    assert.that(TestMachine.prototype.nodes.Hugo).is.undefined();
    const hugo1 = TestMachine.prototype.node('Hugo');
    const hugo2 = TestMachine.prototype.node('Hugo');

    assert.that(hugo1).is.not.undefined();
    assert.that(hugo2).is.not.undefined();
    assert.that(hugo1).is.sameAs(hugo2);
    done();
  });

  test('initialNode function throws error if node name is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.initialNode();
    }).is.throwing('Node name is missing.');
    done();
  });

  test('initialNode function throws error if node name is invalid', (done) => {
    assert.that(() => {
      TestMachine.prototype.initialNode('hugo');
    }).is.throwing('Invalid node name.');
    done();
  });

  test('initialNode function initializes currentNode', (done) => {
    assert.that(TestMachine.prototype.getCurrentNode()).is.undefined();
    TestMachine.prototype.node('gaius');
    TestMachine.prototype.node('julius');
    TestMachine.prototype.node('caesar');

    TestMachine.prototype.initialNode('julius');
    assert.that(TestMachine.prototype.getCurrentNode()).is.equalTo('julius');
    done();
  });

  test('transit function throws error if transition name is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.transit();
    }).is.throwing('Transition name is missing.');
    done();
  });

  test('transit function throws error if callback is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.transit('a-z');
    }).is.throwing('Callback is missing.');
    done();
  });

  test('transit function throws error if initial node is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.transit('a-z', () => {
      });
    }).is.throwing('Initial node is missing.');
    done();
  });

  test('transit function returns error if leave callback fails', (done) => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('bleibDa', 'hugo', () => {
      assert.that(true).is.false();
    });
    Hugo.leave((node, transition, payload, cb) => {
      cb(new Error('ohoh'));
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    testMachine.transit('bleibDa', (errTransit) => {
      assert.that(errTransit.message).is.equalTo('ohoh');
      done();
    });
  });

  test('transit function returns error if execution callback fails', (done) => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('bleibDa', 'hugo', (node, transition, payload, callback) => {
      callback(new Error('hopperla'));
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    testMachine.transit('bleibDa', (errTransit) => {
      assert.that(errTransit.message).is.equalTo('hopperla');
      done();
    });
  });

  test('transit function succeeds if transition is unknown', (done) => {
    TestMachine.prototype.node('hugo');
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    testMachine.transit('nichtDa', (errTransit, nextNode) => {
      assert.that(errTransit.message).is.equalTo('Transition missing.');
      assert.that(nextNode).is.equalTo('hugo');
      done();
    });
  });

  test('transit function throws error if next node is unknown', (done) => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('gehe-ins', 'nirvana', (node, transition, payload, callback) => {
      callback();
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    assert.that(() => {
      testMachine.transit('gehe-ins', () => {
        assert.that(true).is.false();
      });
    }).is.throwing('Invalid node name.');
    done();
  });

  test('transit function returns error if enter callback fails', (done) => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('bleibDa', 'hugo', (node, transition, payload, callback) => {
      callback();
    });
    Hugo.enter((node, transition, payload, cb) => {
      cb(new Error('noe'));
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    testMachine.transit('bleibDa', (errTransit) => {
      assert.that(errTransit.message).is.equalTo('noe');
      done();
    });
  });

  test('transit function executes transitions', (done) => {
    TestMachine.prototype.markAurel = 'Mark Aurel';
    TestMachine.prototype.verus = 'Verus';
    TestMachine.prototype.commodus = 'Commodus';

    TestMachine.prototype.node(TestMachine.prototype.markAurel);
    TestMachine.prototype.node(TestMachine.prototype.verus).
    transition('predecessor', TestMachine.prototype.markAurel, (node, transition, payload, callback) => {
      callback(null);
    }).
    transition('successor', TestMachine.prototype.commodus, (node, transition, payload, callback) => {
      callback(null);
    });
    TestMachine.prototype.node(TestMachine.prototype.commodus).
    transition('predecessor', TestMachine.prototype.verus, (node, transition, payload, callback) => {
      callback(null);
    });

    TestMachine.prototype.initialNode('Verus');

    const testMachine = new TestMachine();

    testMachine.transit('successor', (errTransit) => {
      assert.that(errTransit).is.null();
      assert.that(testMachine.getPreviousNode()).is.equalTo(testMachine.verus);
      assert.that(testMachine.getCurrentNode()).is.equalTo(testMachine.commodus);
      testMachine.transit('predecessor', (errPre1) => {
        assert.that(errPre1).is.null();
        assert.that(testMachine.getCurrentNode()).is.equalTo(testMachine.verus);
        testMachine.transit('predecessor', (errPre2) => {
          assert.that(errPre2).is.null();
          assert.that(testMachine.getCurrentNode()).is.equalTo(testMachine.markAurel);
          done();
        });
      });
    });
  });

  test('transit function inhibits parallel executions', (done) => {
    TestMachine.prototype.node('Pertinax').
    transition('stays', 'Pertinax', (node, transition, payload, callback) => {
      setTimeout(() => {
        callback(null);
      }, 100);
    });

    TestMachine.prototype.initialNode('Pertinax');

    const testMachine = new TestMachine();

    assert.that(testMachine.getCurrentTransition()).is.undefined();
    testMachine.transit('stays', (err1) => {
      assert.that(err1).is.null();
      assert.that(testMachine.getCurrentTransition()).is.undefined();
      done();
    });
    assert.that(testMachine.getCurrentTransition().transition).is.equalTo('stays');
    testMachine.transit('stays', (err2) => {
      assert.that(err2.message).is.equalTo('Transition running.');
    });
  });

  test('preTransition function throws error if callback is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.preTransition();
    }).is.throwing('Pre-transition callback is missing.');
    done();
  });

  test('preTransition function throws error if callback is not a function', (done) => {
    assert.that(() => {
      TestMachine.prototype.preTransition({});
    }).is.throwing('Pre-transition-callback is not a function.');
    done();
  });

  test('preTransition function creates preTransit transition', (done) => {
    TestMachine.prototype.preTransition(() => {
    });
    assert.that(TestMachine.prototype.preTransit).is.not.undefined();
    assert.that(TestMachine.prototype.preTransit.getName()).is.equalTo('preTransition');
    done();
  });

  test('postTransition function throws error if callback is missing', (done) => {
    assert.that(() => {
      TestMachine.prototype.postTransition();
    }).is.throwing('Post-transition callback is missing.');
    done();
  });

  test('postTransition function throws error if callback is not a function', (done) => {
    assert.that(() => {
      TestMachine.prototype.postTransition({});
    }).is.throwing('Post-transition-callback is not a function.');
    done();
  });

  test('postTransition function creates preTransit transition', (done) => {
    TestMachine.prototype.postTransition(() => {
    });
    assert.that(TestMachine.prototype.postTransit).is.not.undefined();
    assert.that(TestMachine.prototype.postTransit.getName()).is.equalTo('postTransition');
    done();
  });

  test('transit function returns error if preTransition callback fails', (done) => {
    TestMachine.prototype.node('falco');
    TestMachine.prototype.preTransition((node, transition, payload, cb) => {
      cb(new Error('usurpator killed'));
    });
    TestMachine.prototype.initialNode('falco');

    const testMachine = new TestMachine();

    testMachine.transit('selfish', (errTransit) => {
      assert.that(errTransit.message).is.equalTo('usurpator killed');
      done();
    });
  });

  test('transit function returns error if postTransition callback fails', (done) => {
    TestMachine.prototype.node('Didius Julianus').
    transition('selfish', 'Didius Julianus', (node, transition, payload, callback) => {
      callback(null);
    });

    TestMachine.prototype.postTransition((node, transition, payload, cb) => {
      cb(new Error('Already replaced by Septimius Severus'));
    });
    TestMachine.prototype.initialNode('Didius Julianus');

    const testMachine = new TestMachine();

    testMachine.transit('selfish', (errTransit) => {
      assert.that(errTransit.message).is.equalTo('Already replaced by Septimius Severus');
      done();
    });
  });

  test('two machine instances share same nodes', (done) => {
    TestMachine.prototype.node('Septimius Severus');
    TestMachine.prototype.initialNode('Septimius Severus');

    const testMachine1 = new TestMachine();
    const testMachine2 = new TestMachine();

    testMachine1.nodes['Septimius Severus'].myProp = 42;
    testMachine2.nodes['Septimius Severus'].myProp = 11;
    assert.that(testMachine1.nodes['Septimius Severus'].myProp).is.equalTo(11);
    assert.that(testMachine2.nodes['Septimius Severus'].myProp).is.equalTo(11);
    done();
  });

  test('two machine instances have different properties', (done) => {
    TestMachine.prototype.node('Caracalla').
    transition('back', 'Septimius Severus', (node, transition, payload, callback) => {
      callback(null);
    });
    TestMachine.prototype.node('Septimius Severus');
    TestMachine.prototype.initialNode('Caracalla');

    const testMachine1 = new TestMachine();
    const testMachine2 = new TestMachine();

    testMachine1.transit('back', (errTransit) => {
      assert.that(errTransit).is.null();
      assert.that(testMachine1.getCurrentNode()).is.equalTo('Septimius Severus');
      assert.that(testMachine2.getCurrentNode()).is.equalTo('Caracalla');
      done();
    });
  });
});
