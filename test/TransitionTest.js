'use strict';

const assert = require('assertthat');

const Transition = require('../lib/Transition');

suite('stateMachine.Transition', () => {
  test('is a function', (done) => {
    assert.that(Transition).is.ofType('function');
    done();
  });

  test('throws error if name is missing', (done) => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Transition();
      /* eslint-enable no-new */
    }).is.throwing('Transition name is missing.');
    done();
  });

  test('throws error if next node is missing', (done) => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Transition('otho');
      /* eslint-enable no-new */
    }).is.throwing('Next node name is missing.');
    done();
  });

  test('throws error if callback is missing', (done) => {
    assert.that(() => {
      /* eslint-disable no-new */
      new Transition('vitellius', 'vespasian');
      /* eslint-enable no-new */
    }).is.throwing('Transition execution callback is missing.');
    done();
  });

  test('getName function returns name of transition', (done) => {
    const transition = new Transition('SonOfVespasian', 'titus', () => {
    });

    assert.that(transition.getName()).is.equalTo('SonOfVespasian');
    done();
  });

  test('getNextNode function returns name of next node', (done) => {
    const transition = new Transition('kill titus', 'domitian', () => {
    });

    assert.that(transition.getNextNode()).is.equalTo('domitian');
    done();
  });

  test('runTransit function throws error if machine is missing', (done) => {
    const transition = new Transition('fromNerva', 'trajan', () => {
    });

    assert.that(() => {
      transition.runTransit();
    }).is.throwing('Machine is missing.');
    done();
  });

  test('runTransit function throws error if node is missing', (done) => {
    const transition = new Transition('fromTrajan', 'hadrian', () => {
    });

    assert.that(() => {
      transition.runTransit({});
    }).is.throwing('Node is missing.');
    done();
  });

  test('runTransit function throws error if payload is missing', (done) => {
    const transition = new Transition('fromHadrian', 'Antoninus Pius', () => {
    });

    assert.that(() => {
      transition.runTransit({}, {});
    }).is.throwing('Payload is missing.');
    done();
  });

  test('runTransit function throws error if callback is missing', (done) => {
    const transition = new Transition('fromHadrian', 'Antoninus Pius', () => {
    });

    assert.that(() => {
      transition.runTransit({}, {}, {});
    }).is.throwing('Callback is missing.');
    done();
  });

  test('runTransit function call execution callback', (done) => {
    let executed = 0;
    const transition = new Transition('fromAntonius', 'Mark Aurel', (machine, node, payload, callback) => {
      executed++;
      callback(null);
    });

    transition.runTransit({}, {}, {}, (err, nextNode) => {
      assert.that(err).is.null();
      assert.that(executed).is.equalTo(1);
      assert.that(nextNode).is.equalTo('Mark Aurel');
      done();
    });
  });
});
