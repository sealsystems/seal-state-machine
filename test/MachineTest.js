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

  test('transit function throws error if transition name is missing', async () => {
    await assert.that(async () => {
      await TestMachine.prototype.transit();
    }).is.throwingAsync('Transition name is missing.');
  });

  test('transit function throws error if initial node is missing', async () => {
    await assert.that(async () => {
      await TestMachine.prototype.transit('a-z');
    }).is.throwingAsync('Initial node is missing.');
  });

  test('transit function throws an error if leave-execution callback fails', async () => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('bleibDa', 'hugo', async () => {
      assert.that(true).is.false();
    });
    Hugo.leave(async () => {
      throw new Error('ohoh');
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('bleibDa');
    }).is.throwingAsync('ohoh');
  });

  test('transit function throws an error if execution callback fails', async () => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('bleibDa', 'hugo', async () => {
      throw new Error('hopperla');
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('bleibDa');
    }).is.throwingAsync('hopperla');
  });

  test('transit function throws an error if transition is unknown', async () => {
    TestMachine.prototype.node('hugo');
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('nichtDa');
    }).is.throwingAsync('Transition missing.');
  });

  test('transit function throws error if next node is unknown', async () => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('gehe-ins', 'nirvana', async () => {
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('gehe-ins');
    }).is.throwingAsync('Invalid node name.');
  });

  test('transit function returns error if enter callback fails', async () => {
    const Hugo = TestMachine.prototype.node('hugo');

    Hugo.transition('bleibDa', 'hugo', async () => {
    });
    Hugo.enter(async () => {
      throw new Error('noe');
    });
    TestMachine.prototype.initialNode('hugo');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('bleibDa');
    }).is.throwingAsync('noe');
  });

  test('transit function executes transitions', async () => {
    TestMachine.prototype.markAurel = 'Mark Aurel';
    TestMachine.prototype.verus = 'Verus';
    TestMachine.prototype.commodus = 'Commodus';

    TestMachine.prototype.node(TestMachine.prototype.markAurel);
    TestMachine.prototype.node(TestMachine.prototype.verus).
      transition('predecessor', TestMachine.prototype.markAurel, async () => {
      }).
      transition('successor', TestMachine.prototype.commodus, async () => {
      });
    TestMachine.prototype.node(TestMachine.prototype.commodus).
      transition('predecessor', TestMachine.prototype.verus, async () => {
      });

    TestMachine.prototype.initialNode('Verus');

    const testMachine = new TestMachine();

    await testMachine.transit('successor');
    assert.that(testMachine.getPreviousNode()).is.equalTo(testMachine.verus);
    assert.that(testMachine.getCurrentNode()).is.equalTo(testMachine.commodus);

    await testMachine.transit('predecessor');
    assert.that(testMachine.getCurrentNode()).is.equalTo(testMachine.verus);

    await testMachine.transit('predecessor');
    assert.that(testMachine.getCurrentNode()).is.equalTo(testMachine.markAurel);
  });

  test('transit function inhibits parallel executions', async () => {
    TestMachine.prototype.node('Pertinax').
      transition('stays', 'Pertinax', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

    TestMachine.prototype.initialNode('Pertinax');

    const testMachine = new TestMachine();

    assert.that(testMachine.getCurrentTransition()).is.undefined();
    testMachine.transit('stays');

    await assert.that(async () => {
      await testMachine.transit('stays');
    }).is.throwingAsync('Transition running.');
  });

  test('preTransition function throws error if callback is missing', async () => {
    await assert.that(async () => {
      await TestMachine.prototype.preTransition();
    }).is.throwingAsync('Pre-transition callback is missing.');
  });

  test('preTransition function throws error if callback is not a function', async () => {
    await assert.that(async () => {
      await TestMachine.prototype.preTransition({});
    }).is.throwingAsync('Pre-transition-callback is not a function.');
  });

  test('preTransition function creates preTransit transition', async () => {
    TestMachine.prototype.preTransition(async () => {
    });
    assert.that(TestMachine.prototype.preTransit).is.not.undefined();
    assert.that(TestMachine.prototype.preTransit.getName()).is.equalTo('preTransition');
  });

  test('postTransition function throws error if callback is missing', async () => {
    await assert.that(async () => {
      await TestMachine.prototype.postTransition();
    }).is.throwingAsync('Post-transition callback is missing.');
  });

  test('postTransition function throws error if callback is not a function', async () => {
    await assert.that(async () => {
      await TestMachine.prototype.postTransition({});
    }).is.throwingAsync('Post-transition-callback is not a function.');
  });

  test('postTransition function creates preTransit transition', async () => {
    TestMachine.prototype.postTransition(async () => {
    });
    assert.that(TestMachine.prototype.postTransit).is.not.undefined();
    assert.that(TestMachine.prototype.postTransit.getName()).is.equalTo('postTransition');
  });

  test('transit function returns error if preTransition callback fails', async () => {
    TestMachine.prototype.node('falco');
    TestMachine.prototype.preTransition(async () => {
      throw new Error('usurpator killed');
    });
    TestMachine.prototype.initialNode('falco');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('selfish');
    }).is.throwingAsync('usurpator killed');
  });

  test('transit function returns error if postTransition callback fails', async () => {
    TestMachine.prototype.node('Didius Julianus').
      transition('selfish', 'Didius Julianus', async () => {
      });

    TestMachine.prototype.postTransition(async () => {
      throw new Error('Already replaced by Septimius Severus');
    });
    TestMachine.prototype.initialNode('Didius Julianus');

    const testMachine = new TestMachine();

    await assert.that(async () => {
      await testMachine.transit('selfish');
    }).is.throwingAsync('Already replaced by Septimius Severus');
  });

  test('two machine instances share same nodes', async () => {
    TestMachine.prototype.node('Septimius Severus');
    TestMachine.prototype.initialNode('Septimius Severus');

    const testMachine1 = new TestMachine();
    const testMachine2 = new TestMachine();

    testMachine1.nodes['Septimius Severus'].myProp = 42;
    testMachine2.nodes['Septimius Severus'].myProp = 11;
    assert.that(testMachine1.nodes['Septimius Severus'].myProp).is.equalTo(11);
    assert.that(testMachine2.nodes['Septimius Severus'].myProp).is.equalTo(11);
  });

  test('two machine instances have different properties', async () => {
    TestMachine.prototype.node('Caracalla').
      transition('back', 'Septimius Severus', async () => {
      });
    TestMachine.prototype.node('Septimius Severus');
    TestMachine.prototype.initialNode('Caracalla');

    const testMachine1 = new TestMachine();
    const testMachine2 = new TestMachine();

    await testMachine1.transit('back');

    assert.that(testMachine1.getCurrentNode()).is.equalTo('Septimius Severus');
    assert.that(testMachine2.getCurrentNode()).is.equalTo('Caracalla');
  });
});
