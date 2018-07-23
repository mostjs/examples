(function () {
  'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  /** @license MIT License (c) copyright 2010-2016 original author or authors */
  // a with x appended


  function append(x, a) {
    var l = a.length;
    var b = new Array(l + 1);

    for (var i = 0; i < l; ++i) {
      b[i] = a[i];
    }

    b[l] = x;
    return b;
  } // drop :: Int -> [a] -> [a]
  // transform each element with f


  function map(f, a) {
    var l = a.length;
    var b = new Array(l);

    for (var i = 0; i < l; ++i) {
      b[i] = f(a[i]);
    }

    return b;
  } // reduce :: (a -> b -> a) -> a -> [b] -> a
  // accumulate via left-fold


  function reduce(f, z, a) {
    var r = z;

    for (var i = 0, l = a.length; i < l; ++i) {
      r = f(r, a[i], i);
    }

    return r;
  } // replace :: a -> Int -> [a]
  // remove element at index


  function remove(i, a) {
    // eslint-disable-line complexity
    if (i < 0) {
      throw new TypeError('i must be >= 0');
    }

    var l = a.length;

    if (l === 0 || i >= l) {
      // exit early if index beyond end of array
      return a;
    }

    if (l === 1) {
      // exit early if index in bounds and length === 1
      return [];
    }

    return unsafeRemove(i, a, l - 1);
  } // unsafeRemove :: Int -> [a] -> Int -> [a]
  // Internal helper to remove element at index


  function unsafeRemove(i, a, l) {
    var b = new Array(l);
    var j = void 0;

    for (j = 0; j < i; ++j) {
      b[j] = a[j];
    }

    for (j = i; j < l; ++j) {
      b[j] = a[j + 1];
    }

    return b;
  } // removeAll :: (a -> boolean) -> [a] -> [a]
  // remove all elements matching a predicate


  function removeAll(f, a) {
    var l = a.length;
    var b = new Array(l);
    var j = 0;

    for (var x, i = 0; i < l; ++i) {
      x = a[i];

      if (!f(x)) {
        b[j] = x;
        ++j;
      }
    }

    b.length = j;
    return b;
  } // findIndex :: a -> [a] -> Int
  // find index of x in a, from the left


  function findIndex(x, a) {
    for (var i = 0, l = a.length; i < l; ++i) {
      if (x === a[i]) {
        return i;
      }
    }

    return -1;
  } // isArrayLike :: * -> boolean


  var compose = function compose(f, g) {
    return function (x) {
      return f(g(x));
    };
  }; // apply :: (a -> b) -> a -> b


  function curry2(f) {
    function curried(a, b) {
      switch (arguments.length) {
        case 0:
          return curried;

        case 1:
          return function (b) {
            return f(a, b);
          };

        default:
          return f(a, b);
      }
    }

    return curried;
  } // curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)


  function curry3(f) {
    function curried(a, b, c) {
      // eslint-disable-line complexity
      switch (arguments.length) {
        case 0:
          return curried;

        case 1:
          return curry2(function (b, c) {
            return f(a, b, c);
          });

        case 2:
          return function (c) {
            return f(a, b, c);
          };

        default:
          return f(a, b, c);
      }
    }

    return curried;
  } // curry4 :: ((a, b, c, d) -> e) -> (a -> b -> c -> d -> e)

  var classCallCheck = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var ScheduledTask =
  /*#__PURE__*/
  function () {
    function ScheduledTask(time, localOffset, period, task, scheduler) {
      classCallCheck(this, ScheduledTask);
      this.time = time;
      this.localOffset = localOffset;
      this.period = period;
      this.task = task;
      this.scheduler = scheduler;
      this.active = true;
    }

    ScheduledTask.prototype.run = function run() {
      return this.task.run(this.time - this.localOffset);
    };

    ScheduledTask.prototype.error = function error(e) {
      return this.task.error(this.time - this.localOffset, e);
    };

    ScheduledTask.prototype.dispose = function dispose() {
      this.scheduler.cancel(this);
      return this.task.dispose();
    };

    return ScheduledTask;
  }();

  var RelativeScheduler =
  /*#__PURE__*/
  function () {
    function RelativeScheduler(origin, scheduler) {
      classCallCheck(this, RelativeScheduler);
      this.origin = origin;
      this.scheduler = scheduler;
    }

    RelativeScheduler.prototype.currentTime = function currentTime() {
      return this.scheduler.currentTime() - this.origin;
    };

    RelativeScheduler.prototype.scheduleTask = function scheduleTask(localOffset, delay, period, task) {
      return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task);
    };

    RelativeScheduler.prototype.relative = function relative(origin) {
      return new RelativeScheduler(origin + this.origin, this.scheduler);
    };

    RelativeScheduler.prototype.cancel = function cancel(task) {
      return this.scheduler.cancel(task);
    };

    RelativeScheduler.prototype.cancelAll = function cancelAll(f) {
      return this.scheduler.cancelAll(f);
    };

    return RelativeScheduler;
  }();
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var defer = function defer(task) {
    return Promise.resolve(task).then(runTask);
  };

  function runTask(task) {
    try {
      return task.run();
    } catch (e) {
      return task.error(e);
    }
  }
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var Scheduler =
  /*#__PURE__*/
  function () {
    function Scheduler(timer, timeline) {
      var _this = this;

      classCallCheck(this, Scheduler);
      this.timer = timer;
      this.timeline = timeline;
      this._timer = null;
      this._nextArrival = Infinity;

      this._runReadyTasksBound = function () {
        return _this._runReadyTasks(_this.currentTime());
      };
    }

    Scheduler.prototype.currentTime = function currentTime() {
      return this.timer.now();
    };

    Scheduler.prototype.scheduleTask = function scheduleTask(localOffset, delay, period, task) {
      var time = this.currentTime() + Math.max(0, delay);
      var st = new ScheduledTask(time, localOffset, period, task, this);
      this.timeline.add(st);

      this._scheduleNextRun();

      return st;
    };

    Scheduler.prototype.relative = function relative(offset) {
      return new RelativeScheduler(offset, this);
    };

    Scheduler.prototype.cancel = function cancel(task) {
      task.active = false;

      if (this.timeline.remove(task)) {
        this._reschedule();
      }
    };

    Scheduler.prototype.cancelAll = function cancelAll(f) {
      this.timeline.removeAll(f);

      this._reschedule();
    };

    Scheduler.prototype._reschedule = function _reschedule() {
      if (this.timeline.isEmpty()) {
        this._unschedule();
      } else {
        this._scheduleNextRun(this.currentTime());
      }
    };

    Scheduler.prototype._unschedule = function _unschedule() {
      this.timer.clearTimer(this._timer);
      this._timer = null;
    };

    Scheduler.prototype._scheduleNextRun = function _scheduleNextRun() {
      // eslint-disable-line complexity
      if (this.timeline.isEmpty()) {
        return;
      }

      var nextArrival = this.timeline.nextArrival();

      if (this._timer === null) {
        this._scheduleNextArrival(nextArrival);
      } else if (nextArrival < this._nextArrival) {
        this._unschedule();

        this._scheduleNextArrival(nextArrival);
      }
    };

    Scheduler.prototype._scheduleNextArrival = function _scheduleNextArrival(nextArrival) {
      this._nextArrival = nextArrival;
      var delay = Math.max(0, nextArrival - this.currentTime());
      this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
    };

    Scheduler.prototype._runReadyTasks = function _runReadyTasks() {
      this._timer = null;
      this.timeline.runTasks(this.currentTime(), runTask);

      this._scheduleNextRun();
    };

    return Scheduler;
  }();
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var Timeline =
  /*#__PURE__*/
  function () {
    function Timeline() {
      classCallCheck(this, Timeline);
      this.tasks = [];
    }

    Timeline.prototype.nextArrival = function nextArrival() {
      return this.isEmpty() ? Infinity : this.tasks[0].time;
    };

    Timeline.prototype.isEmpty = function isEmpty() {
      return this.tasks.length === 0;
    };

    Timeline.prototype.add = function add(st) {
      insertByTime(st, this.tasks);
    };

    Timeline.prototype.remove = function remove$$1(st) {
      var i = binarySearch(getTime(st), this.tasks);

      if (i >= 0 && i < this.tasks.length) {
        var at = findIndex(st, this.tasks[i].events);

        if (at >= 0) {
          this.tasks[i].events.splice(at, 1);
          return true;
        }
      }

      return false;
    };

    Timeline.prototype.removeAll = function removeAll$$1(f) {
      for (var i = 0; i < this.tasks.length; ++i) {
        removeAllFrom(f, this.tasks[i]);
      }
    };

    Timeline.prototype.runTasks = function runTasks(t, runTask) {
      var tasks = this.tasks;
      var l = tasks.length;
      var i = 0;

      while (i < l && tasks[i].time <= t) {
        ++i;
      }

      this.tasks = tasks.slice(i); // Run all ready tasks

      for (var j = 0; j < i; ++j) {
        this.tasks = runReadyTasks(runTask, tasks[j].events, this.tasks);
      }
    };

    return Timeline;
  }();

  function runReadyTasks(runTask, events, tasks) {
    // eslint-disable-line complexity
    for (var i = 0; i < events.length; ++i) {
      var task = events[i];

      if (task.active) {
        runTask(task); // Reschedule periodic repeating tasks
        // Check active again, since a task may have canceled itself

        if (task.period >= 0 && task.active) {
          task.time = task.time + task.period;
          insertByTime(task, tasks);
        }
      }
    }

    return tasks;
  }

  function insertByTime(task, timeslots) {
    var l = timeslots.length;
    var time = getTime(task);

    if (l === 0) {
      timeslots.push(newTimeslot(time, [task]));
      return;
    }

    var i = binarySearch(time, timeslots);

    if (i >= l) {
      timeslots.push(newTimeslot(time, [task]));
    } else {
      insertAtTimeslot(task, timeslots, time, i);
    }
  }

  function insertAtTimeslot(task, timeslots, time, i) {
    var timeslot = timeslots[i];

    if (time === timeslot.time) {
      addEvent(task, timeslot.events, time);
    } else {
      timeslots.splice(i, 0, newTimeslot(time, [task]));
    }
  }

  function addEvent(task, events) {
    if (events.length === 0 || task.time >= events[events.length - 1].time) {
      events.push(task);
    } else {
      spliceEvent(task, events);
    }
  }

  function spliceEvent(task, events) {
    for (var j = 0; j < events.length; j++) {
      if (task.time < events[j].time) {
        events.splice(j, 0, task);
        break;
      }
    }
  }

  function getTime(scheduledTask) {
    return Math.floor(scheduledTask.time);
  }

  function removeAllFrom(f, timeslot) {
    timeslot.events = removeAll(f, timeslot.events);
  }

  function binarySearch(t, sortedArray) {
    // eslint-disable-line complexity
    var lo = 0;
    var hi = sortedArray.length;
    var mid = void 0,
        y = void 0;

    while (lo < hi) {
      mid = Math.floor((lo + hi) / 2);
      y = sortedArray[mid];

      if (t === y.time) {
        return mid;
      } else if (t < y.time) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }

    return hi;
  }

  var newTimeslot = function newTimeslot(t, events) {
    return {
      time: t,
      events: events
    };
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  /* global setTimeout, clearTimeout */


  var ClockTimer =
  /*#__PURE__*/
  function () {
    function ClockTimer(clock) {
      classCallCheck(this, ClockTimer);
      this._clock = clock;
    }

    ClockTimer.prototype.now = function now() {
      return this._clock.now();
    };

    ClockTimer.prototype.setTimer = function setTimer(f, dt) {
      return dt <= 0 ? runAsap(f) : setTimeout(f, dt);
    };

    ClockTimer.prototype.clearTimer = function clearTimer(t) {
      return t instanceof Asap ? t.cancel() : clearTimeout(t);
    };

    return ClockTimer;
  }();

  var Asap =
  /*#__PURE__*/
  function () {
    function Asap(f) {
      classCallCheck(this, Asap);
      this.f = f;
      this.active = true;
    }

    Asap.prototype.run = function run() {
      return this.active && this.f();
    };

    Asap.prototype.error = function error(e) {
      throw e;
    };

    Asap.prototype.cancel = function cancel() {
      this.active = false;
    };

    return Asap;
  }();

  function runAsap(f) {
    var task = new Asap(f);
    defer(task);
    return task;
  }
  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  /* global performance, process */


  var RelativeClock =
  /*#__PURE__*/
  function () {
    function RelativeClock(clock, origin) {
      classCallCheck(this, RelativeClock);
      this.origin = origin;
      this.clock = clock;
    }

    RelativeClock.prototype.now = function now() {
      return this.clock.now() - this.origin;
    };

    return RelativeClock;
  }();

  var HRTimeClock =
  /*#__PURE__*/
  function () {
    function HRTimeClock(hrtime, origin) {
      classCallCheck(this, HRTimeClock);
      this.origin = origin;
      this.hrtime = hrtime;
    }

    HRTimeClock.prototype.now = function now() {
      var hrt = this.hrtime(this.origin);
      return (hrt[0] * 1e9 + hrt[1]) / 1e6;
    };

    return HRTimeClock;
  }();

  var clockRelativeTo = function clockRelativeTo(clock) {
    return new RelativeClock(clock, clock.now());
  };

  var newPerformanceClock = function newPerformanceClock() {
    return clockRelativeTo(performance);
  };

  var newDateClock = function newDateClock() {
    return clockRelativeTo(Date);
  };

  var newHRTimeClock = function newHRTimeClock() {
    return new HRTimeClock(process.hrtime, process.hrtime());
  };

  var newPlatformClock = function newPlatformClock() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return newPerformanceClock();
    } else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
      return newHRTimeClock();
    }

    return newDateClock();
  }; // Read the current time from the provided Scheduler


  var currentTime = function currentTime(scheduler) {
    return scheduler.currentTime();
  }; // Schedule a task to run as soon as possible, but
  // not in the current call stack


  var asap =
  /*#__PURE__*/
  curry2(function (task, scheduler) {
    return scheduler.scheduleTask(0, 0, -1, task);
  }); // Schedule a task to run after a millisecond delay

  var delay =
  /*#__PURE__*/
  curry3(function (delay, task, scheduler) {
    return scheduler.scheduleTask(0, delay, -1, task);
  }); // Schedule a task to run periodically, with the
  // first run starting asap

  var periodic =
  /*#__PURE__*/
  curry3(function (period, task, scheduler) {
    return scheduler.scheduleTask(0, 0, period, task);
  }); // Cancel a scheduledTask
  // is true


  var cancelAllTasks =
  /*#__PURE__*/
  curry2(function (predicate, scheduler) {
    return scheduler.cancelAll(predicate);
  });
  var schedulerRelativeTo =
  /*#__PURE__*/
  curry2(function (offset, scheduler) {
    return new RelativeScheduler(offset, scheduler);
  });

  var newDefaultScheduler = function newDefaultScheduler() {
    return new Scheduler(newDefaultTimer(), new Timeline());
  };

  var newDefaultTimer = function newDefaultTimer() {
    return new ClockTimer(newPlatformClock());
  };

  var classCallCheck$1 = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var disposeNone = function disposeNone() {
    return NONE;
  };

  var NONE =
  /*#__PURE__*/
  new (function () {
    function DisposeNone() {
      classCallCheck$1(this, DisposeNone);
    }

    DisposeNone.prototype.dispose = function dispose() {};

    return DisposeNone;
  }())();

  var isDisposeNone = function isDisposeNone(d) {
    return d === NONE;
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */
  // Wrap an existing disposable (which may not already have been once()d)
  // so that it will only dispose its underlying resource at most once.


  var disposeOnce = function disposeOnce(disposable) {
    return new DisposeOnce(disposable);
  };

  var DisposeOnce =
  /*#__PURE__*/
  function () {
    function DisposeOnce(disposable) {
      classCallCheck$1(this, DisposeOnce);
      this.disposed = false;
      this.disposable = disposable;
    }

    DisposeOnce.prototype.dispose = function dispose() {
      if (!this.disposed) {
        this.disposed = true;
        this.disposable.dispose();
        this.disposable = undefined;
      }
    };

    return DisposeOnce;
  }();
  // disposed/released. It aggregates a function to dispose
  // the resource and a handle to a key/id/handle/reference
  // that identifies the resource

  var DisposeWith =
  /*#__PURE__*/
  function () {
    function DisposeWith(dispose, resource) {
      classCallCheck$1(this, DisposeWith);
      this._dispose = dispose;
      this._resource = resource;
    }

    DisposeWith.prototype.dispose = function dispose() {
      this._dispose(this._resource);
    };

    return DisposeWith;
  }();
  /** @license MIT License (c) copyright 2010 original author or authors */
  // Aggregate a list of disposables into a DisposeAll


  var disposeAll = function disposeAll(ds) {
    var merged = reduce(merge, [], ds);
    return merged.length === 0 ? disposeNone() : new DisposeAll(merged);
  }; // Convenience to aggregate 2 disposables


  var disposeBoth =
  /*#__PURE__*/
  curry2(function (d1, d2) {
    return disposeAll([d1, d2]);
  });

  var merge = function merge(ds, d) {
    return isDisposeNone(d) ? ds : d instanceof DisposeAll ? ds.concat(d.disposables) : append(d, ds);
  };

  var DisposeAll =
  /*#__PURE__*/
  function () {
    function DisposeAll(disposables) {
      classCallCheck$1(this, DisposeAll);
      this.disposables = disposables;
    }

    DisposeAll.prototype.dispose = function dispose() {
      throwIfErrors(disposeCollectErrors(this.disposables));
    };

    return DisposeAll;
  }(); // Dispose all, safely collecting errors into an array


  var disposeCollectErrors = function disposeCollectErrors(disposables) {
    return reduce(appendIfError, [], disposables);
  }; // Call dispose and if throws, append thrown error to errors


  var appendIfError = function appendIfError(errors, d) {
    try {
      d.dispose();
    } catch (e) {
      errors.push(e);
    }

    return errors;
  }; // Throw DisposeAllError if errors is non-empty


  var throwIfErrors = function throwIfErrors(errors) {
    if (errors.length > 0) {
      throw new DisposeAllError(errors.length + ' errors', errors);
    }
  };

  var DisposeAllError =
  /*#__PURE__*/
  function (Error) {
    function DisposeAllError(message, errors) {
      Error.call(this, message);
      this.message = message;
      this.name = DisposeAllError.name;
      this.errors = errors;

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DisposeAllError);
      }

      this.stack = '' + this.stack + formatErrorStacks(this.errors);
    }

    DisposeAllError.prototype =
    /*#__PURE__*/
    Object.create(Error.prototype);
    return DisposeAllError;
  }(Error);

  var formatErrorStacks = function formatErrorStacks(errors) {
    return reduce(formatErrorStack, '', errors);
  };

  var formatErrorStack = function formatErrorStack(s, e, i) {
    return s + ('\n[' + (i + 1) + '] ' + e.stack);
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */
  // Try to dispose the disposable.  If it throws, send
  // the error to sink.error with the provided Time value


  var tryDispose =
  /*#__PURE__*/
  curry3(function (t, disposable, sink) {
    try {
      disposable.dispose();
    } catch (e) {
      sink.error(t, e);
    }
  });

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  function fatalError(e) {
    setTimeout(rethrow, 0, e);
  }

  function rethrow(e) {
    throw e;
  }

  var classCallCheck$2 = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var inherits = function inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + _typeof(superClass));
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (_typeof(call) === "object" || typeof call === "function") ? call : self;
  };
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var propagateTask$1 = function propagateTask(run, value, sink) {
    return new PropagateTask(run, value, sink);
  };

  var propagateEventTask$1 = function propagateEventTask(value, sink) {
    return propagateTask$1(runEvent, value, sink);
  };

  var propagateEndTask = function propagateEndTask(sink) {
    return propagateTask$1(runEnd, undefined, sink);
  };

  var propagateErrorTask$1 = function propagateErrorTask(value, sink) {
    return propagateTask$1(runError, value, sink);
  };

  var PropagateTask =
  /*#__PURE__*/
  function () {
    function PropagateTask(run, value, sink) {
      classCallCheck$2(this, PropagateTask);
      this._run = run;
      this.value = value;
      this.sink = sink;
      this.active = true;
    }

    PropagateTask.prototype.dispose = function dispose$$1() {
      this.active = false;
    };

    PropagateTask.prototype.run = function run(t) {
      if (!this.active) {
        return;
      }

      var run = this._run;
      run(t, this.value, this.sink);
    };

    PropagateTask.prototype.error = function error(t, e) {
      // TODO: Remove this check and just do this.sink.error(t, e)?
      if (!this.active) {
        return fatalError(e);
      }

      this.sink.error(t, e);
    };

    return PropagateTask;
  }();

  var runEvent = function runEvent(t, x, sink) {
    return sink.event(t, x);
  };

  var runEnd = function runEnd(t, _, sink) {
    return sink.end(t);
  };

  var runError = function runError(t, e, sink) {
    return sink.error(t, e);
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var empty = function empty() {
    return EMPTY;
  };

  var isCanonicalEmpty = function isCanonicalEmpty(stream) {
    return stream === EMPTY;
  };

  var Empty =
  /*#__PURE__*/
  function () {
    function Empty() {
      classCallCheck$2(this, Empty);
    }

    Empty.prototype.run = function run(sink, scheduler$$1) {
      return asap(propagateEndTask(sink), scheduler$$1);
    };

    return Empty;
  }();

  var EMPTY =
  /*#__PURE__*/
  new Empty();

  var Never =
  /*#__PURE__*/
  function () {
    function Never() {
      classCallCheck$2(this, Never);
    }

    Never.prototype.run = function run() {
      return disposeNone();
    };

    return Never;
  }();

  var NEVER =
  /*#__PURE__*/
  new Never();
  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  var at = function at(t, x) {
    return new At(t, x);
  };

  var At =
  /*#__PURE__*/
  function () {
    function At(t, x) {
      classCallCheck$2(this, At);
      this.time = t;
      this.value = x;
    }

    At.prototype.run = function run(sink, scheduler$$1) {
      return delay(this.time, propagateTask$1(runAt, this.value, sink), scheduler$$1);
    };

    return At;
  }();

  function runAt(t, x, sink) {
    sink.event(t, x);
    sink.end(t);
  }
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var now = function now(x) {
    return at(0, x);
  };

  var Periodic =
  /*#__PURE__*/
  function () {
    function Periodic(period) {
      classCallCheck$2(this, Periodic);
      this.period = period;
    }

    Periodic.prototype.run = function run(sink, scheduler$$1) {
      return periodic(this.period, propagateEventTask$1(undefined, sink), scheduler$$1);
    };

    return Periodic;
  }();
  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  /** @author Brian Cavalier */


  var Pipe =
  /*#__PURE__*/
  function () {
    function Pipe(sink) {
      classCallCheck$2(this, Pipe);
      this.sink = sink;
    }

    Pipe.prototype.event = function event(t, x) {
      return this.sink.event(t, x);
    };

    Pipe.prototype.end = function end(t) {
      return this.sink.end(t);
    };

    Pipe.prototype.error = function error(t, e) {
      return this.sink.error(t, e);
    };

    return Pipe;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var Filter =
  /*#__PURE__*/
  function () {
    function Filter(p, source) {
      classCallCheck$2(this, Filter);
      this.p = p;
      this.source = source;
    }

    Filter.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new FilterSink(this.p, sink), scheduler$$1);
    };
    /**
     * Create a filtered source, fusing adjacent filter.filter if possible
     * @param {function(x:*):boolean} p filtering predicate
     * @param {{run:function}} source source to filter
     * @returns {Filter} filtered source
     */


    Filter.create = function create(p, source) {
      if (isCanonicalEmpty(source)) {
        return source;
      }

      if (source instanceof Filter) {
        return new Filter(and(source.p, p), source.source);
      }

      return new Filter(p, source);
    };

    return Filter;
  }();

  var FilterSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(FilterSink, _Pipe);

    function FilterSink(p, sink) {
      classCallCheck$2(this, FilterSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.p = p;
      return _this;
    }

    FilterSink.prototype.event = function event(t, x) {
      var p = this.p;
      p(x) && this.sink.event(t, x);
    };

    return FilterSink;
  }(Pipe);

  var and = function and(p, q) {
    return function (x) {
      return p(x) && q(x);
    };
  };
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var FilterMap =
  /*#__PURE__*/
  function () {
    function FilterMap(p, f, source) {
      classCallCheck$2(this, FilterMap);
      this.p = p;
      this.f = f;
      this.source = source;
    }

    FilterMap.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler$$1);
    };

    return FilterMap;
  }();

  var FilterMapSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(FilterMapSink, _Pipe);

    function FilterMapSink(p, f, sink) {
      classCallCheck$2(this, FilterMapSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.p = p;
      _this.f = f;
      return _this;
    }

    FilterMapSink.prototype.event = function event(t, x) {
      var f = this.f;
      var p = this.p;
      p(x) && this.sink.event(t, f(x));
    };

    return FilterMapSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var Map$1 =
  /*#__PURE__*/
  function () {
    function Map(f, source) {
      classCallCheck$2(this, Map);
      this.f = f;
      this.source = source;
    }

    Map.prototype.run = function run(sink, scheduler$$1) {
      // eslint-disable-line no-extend-native
      return this.source.run(new MapSink(this.f, sink), scheduler$$1);
    };
    /**
     * Create a mapped source, fusing adjacent map.map, filter.map,
     * and filter.map.map if possible
     * @param {function(*):*} f mapping function
     * @param {{run:function}} source source to map
     * @returns {Map|FilterMap} mapped source, possibly fused
     */


    Map.create = function create(f, source) {
      if (isCanonicalEmpty(source)) {
        return empty();
      }

      if (source instanceof Map) {
        return new Map(compose(f, source.f), source.source);
      }

      if (source instanceof Filter) {
        return new FilterMap(source.p, f, source.source);
      }

      return new Map(f, source);
    };

    return Map;
  }();

  var MapSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(MapSink, _Pipe);

    function MapSink(f, sink) {
      classCallCheck$2(this, MapSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      return _this;
    }

    MapSink.prototype.event = function event(t, x) {
      var f = this.f;
      this.sink.event(t, f(x));
    };

    return MapSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var SettableDisposable =
  /*#__PURE__*/
  function () {
    function SettableDisposable() {
      classCallCheck$2(this, SettableDisposable);
      this.disposable = undefined;
      this.disposed = false;
    }

    SettableDisposable.prototype.setDisposable = function setDisposable(disposable$$1) {
      if (this.disposable !== void 0) {
        throw new Error('setDisposable called more than once');
      }

      this.disposable = disposable$$1;

      if (this.disposed) {
        disposable$$1.dispose();
      }
    };

    SettableDisposable.prototype.dispose = function dispose$$1() {
      if (this.disposed) {
        return;
      }

      this.disposed = true;

      if (this.disposable !== void 0) {
        this.disposable.dispose();
      }
    };

    return SettableDisposable;
  }();

  var Slice =
  /*#__PURE__*/
  function () {
    function Slice(bounds, source) {
      classCallCheck$2(this, Slice);
      this.source = source;
      this.bounds = bounds;
    }

    Slice.prototype.run = function run(sink, scheduler$$1) {
      var disposable$$1 = new SettableDisposable();
      var sliceSink = new SliceSink(this.bounds.min, this.bounds.max - this.bounds.min, sink, disposable$$1);
      disposable$$1.setDisposable(this.source.run(sliceSink, scheduler$$1));
      return disposable$$1;
    };

    return Slice;
  }();

  var SliceSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(SliceSink, _Pipe);

    function SliceSink(skip, take, sink, disposable$$1) {
      classCallCheck$2(this, SliceSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.skip = skip;
      _this.take = take;
      _this.disposable = disposable$$1;
      return _this;
    }

    SliceSink.prototype.event = function event(t, x) {
      /* eslint complexity: [1, 4] */
      if (this.skip > 0) {
        this.skip -= 1;
        return;
      }

      if (this.take === 0) {
        return;
      }

      this.take -= 1;
      this.sink.event(t, x);

      if (this.take === 0) {
        this.disposable.dispose();
        this.sink.end(t);
      }
    };

    return SliceSink;
  }(Pipe);

  var TakeWhile =
  /*#__PURE__*/
  function () {
    function TakeWhile(p, source) {
      classCallCheck$2(this, TakeWhile);
      this.p = p;
      this.source = source;
    }

    TakeWhile.prototype.run = function run(sink, scheduler$$1) {
      var disposable$$1 = new SettableDisposable();
      var takeWhileSink = new TakeWhileSink(this.p, sink, disposable$$1);
      disposable$$1.setDisposable(this.source.run(takeWhileSink, scheduler$$1));
      return disposable$$1;
    };

    return TakeWhile;
  }();

  var TakeWhileSink =
  /*#__PURE__*/
  function (_Pipe2) {
    inherits(TakeWhileSink, _Pipe2);

    function TakeWhileSink(p, sink, disposable$$1) {
      classCallCheck$2(this, TakeWhileSink);

      var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

      _this2.p = p;
      _this2.active = true;
      _this2.disposable = disposable$$1;
      return _this2;
    }

    TakeWhileSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      var p = this.p;
      this.active = p(x);

      if (this.active) {
        this.sink.event(t, x);
      } else {
        this.disposable.dispose();
        this.sink.end(t);
      }
    };

    return TakeWhileSink;
  }(Pipe);

  var SkipWhile =
  /*#__PURE__*/
  function () {
    function SkipWhile(p, source) {
      classCallCheck$2(this, SkipWhile);
      this.p = p;
      this.source = source;
    }

    SkipWhile.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new SkipWhileSink(this.p, sink), scheduler$$1);
    };

    return SkipWhile;
  }();

  var SkipWhileSink =
  /*#__PURE__*/
  function (_Pipe3) {
    inherits(SkipWhileSink, _Pipe3);

    function SkipWhileSink(p, sink) {
      classCallCheck$2(this, SkipWhileSink);

      var _this3 = possibleConstructorReturn(this, _Pipe3.call(this, sink));

      _this3.p = p;
      _this3.skipping = true;
      return _this3;
    }

    SkipWhileSink.prototype.event = function event(t, x) {
      if (this.skipping) {
        var p = this.p;
        this.skipping = p(x);

        if (this.skipping) {
          return;
        }
      }

      this.sink.event(t, x);
    };

    return SkipWhileSink;
  }(Pipe);

  var SkipAfter =
  /*#__PURE__*/
  function () {
    function SkipAfter(p, source) {
      classCallCheck$2(this, SkipAfter);
      this.p = p;
      this.source = source;
    }

    SkipAfter.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new SkipAfterSink(this.p, sink), scheduler$$1);
    };

    return SkipAfter;
  }();

  var SkipAfterSink =
  /*#__PURE__*/
  function (_Pipe4) {
    inherits(SkipAfterSink, _Pipe4);

    function SkipAfterSink(p, sink) {
      classCallCheck$2(this, SkipAfterSink);

      var _this4 = possibleConstructorReturn(this, _Pipe4.call(this, sink));

      _this4.p = p;
      _this4.skipping = false;
      return _this4;
    }

    SkipAfterSink.prototype.event = function event(t, x) {
      if (this.skipping) {
        return;
      }

      var p = this.p;
      this.skipping = p(x);
      this.sink.event(t, x);

      if (this.skipping) {
        this.sink.end(t);
      }
    };

    return SkipAfterSink;
  }(Pipe);

  var ZipItems =
  /*#__PURE__*/
  function () {
    function ZipItems(f, items, source) {
      classCallCheck$2(this, ZipItems);
      this.f = f;
      this.items = items;
      this.source = source;
    }

    ZipItems.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new ZipItemsSink(this.f, this.items, sink), scheduler$$1);
    };

    return ZipItems;
  }();

  var ZipItemsSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(ZipItemsSink, _Pipe);

    function ZipItemsSink(f, items, sink) {
      classCallCheck$2(this, ZipItemsSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.items = items;
      _this.index = 0;
      return _this;
    }

    ZipItemsSink.prototype.event = function event(t, b) {
      var f = this.f;
      this.sink.event(t, f(this.items[this.index], b));
      this.index += 1;
    };

    return ZipItemsSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var runEffects$1 =
  /*#__PURE__*/
  curry2(function (stream, scheduler$$1) {
    return new Promise(function (resolve, reject) {
      return runStream(stream, scheduler$$1, resolve, reject);
    });
  });

  function runStream(stream, scheduler$$1, resolve, reject) {
    var disposable$$1 = new SettableDisposable();
    var observer = new RunEffectsSink(resolve, reject, disposable$$1);
    disposable$$1.setDisposable(stream.run(observer, scheduler$$1));
  }

  var RunEffectsSink =
  /*#__PURE__*/
  function () {
    function RunEffectsSink(end, error, disposable$$1) {
      classCallCheck$2(this, RunEffectsSink);
      this._end = end;
      this._error = error;
      this._disposable = disposable$$1;
      this.active = true;
    }

    RunEffectsSink.prototype.event = function event(t, x) {};

    RunEffectsSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }

      this._dispose(this._error, this._end, undefined);
    };

    RunEffectsSink.prototype.error = function error(t, e) {
      this._dispose(this._error, this._error, e);
    };

    RunEffectsSink.prototype._dispose = function _dispose(error, end, x) {
      this.active = false;
      tryDispose$1(error, end, x, this._disposable);
    };

    return RunEffectsSink;
  }();

  function tryDispose$1(error, end, x, disposable$$1) {
    try {
      disposable$$1.dispose();
    } catch (e) {
      error(e);
      return;
    }

    end(x);
  }
  /** @license MIT License (c) copyright 2010-2017 original author or authors */
  // Run a Stream, sending all its events to the
  // provided Sink.


  var run$1 = function run(sink, scheduler$$1, stream) {
    return stream.run(sink, scheduler$$1);
  };

  var RelativeSink =
  /*#__PURE__*/
  function () {
    function RelativeSink(offset, sink) {
      classCallCheck$2(this, RelativeSink);
      this.sink = sink;
      this.offset = offset;
    }

    RelativeSink.prototype.event = function event(t, x) {
      this.sink.event(t + this.offset, x);
    };

    RelativeSink.prototype.error = function error(t, e) {
      this.sink.error(t + this.offset, e);
    };

    RelativeSink.prototype.end = function end(t) {
      this.sink.end(t + this.offset);
    };

    return RelativeSink;
  }(); // Create a stream with its own local clock
  // This transforms time from the provided scheduler's clock to a stream-local
  // clock (which starts at 0), and then *back* to the scheduler's clock before
  // propagating events to sink.  In other words, upstream sources will see local times,
  // and downstream sinks will see non-local (original) times.


  var withLocalTime$1 = function withLocalTime(origin, stream) {
    return new WithLocalTime(origin, stream);
  };

  var WithLocalTime =
  /*#__PURE__*/
  function () {
    function WithLocalTime(origin, source) {
      classCallCheck$2(this, WithLocalTime);
      this.origin = origin;
      this.source = source;
    }

    WithLocalTime.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(relativeSink(this.origin, sink), schedulerRelativeTo(this.origin, scheduler$$1));
    };

    return WithLocalTime;
  }(); // Accumulate offsets instead of nesting RelativeSinks, which can happen
  // with higher-order stream and combinators like continueWith when they're
  // applied recursively.


  var relativeSink = function relativeSink(origin, sink) {
    return sink instanceof RelativeSink ? new RelativeSink(origin + sink.offset, sink.sink) : new RelativeSink(origin, sink);
  };

  var Loop =
  /*#__PURE__*/
  function () {
    function Loop(stepper, seed, source) {
      classCallCheck$2(this, Loop);
      this.step = stepper;
      this.seed = seed;
      this.source = source;
    }

    Loop.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new LoopSink(this.step, this.seed, sink), scheduler$$1);
    };

    return Loop;
  }();

  var LoopSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(LoopSink, _Pipe);

    function LoopSink(stepper, seed, sink) {
      classCallCheck$2(this, LoopSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.step = stepper;
      _this.seed = seed;
      return _this;
    }

    LoopSink.prototype.event = function event(t, x) {
      var result = this.step(this.seed, x);
      this.seed = result.seed;
      this.sink.event(t, result.value);
    };

    return LoopSink;
  }(Pipe);

  var Scan =
  /*#__PURE__*/
  function () {
    function Scan(f, z, source) {
      classCallCheck$2(this, Scan);
      this.source = source;
      this.f = f;
      this.value = z;
    }

    Scan.prototype.run = function run(sink, scheduler$$1) {
      var d1 = asap(propagateEventTask$1(this.value, sink), scheduler$$1);
      var d2 = this.source.run(new ScanSink(this.f, this.value, sink), scheduler$$1);
      return disposeBoth(d1, d2);
    };

    return Scan;
  }();

  var ScanSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(ScanSink, _Pipe);

    function ScanSink(f, z, sink) {
      classCallCheck$2(this, ScanSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.value = z;
      return _this;
    }

    ScanSink.prototype.event = function event(t, x) {
      var f = this.f;
      this.value = f(this.value, x);
      this.sink.event(t, this.value);
    };

    return ScanSink;
  }(Pipe);

  var ContinueWith =
  /*#__PURE__*/
  function () {
    function ContinueWith(f, source) {
      classCallCheck$2(this, ContinueWith);
      this.f = f;
      this.source = source;
    }

    ContinueWith.prototype.run = function run(sink, scheduler$$1) {
      return new ContinueWithSink(this.f, this.source, sink, scheduler$$1);
    };

    return ContinueWith;
  }();

  var ContinueWithSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(ContinueWithSink, _Pipe);

    function ContinueWithSink(f, source, sink, scheduler$$1) {
      classCallCheck$2(this, ContinueWithSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.scheduler = scheduler$$1;
      _this.active = true;
      _this.disposable = disposeOnce(source.run(_this, scheduler$$1));
      return _this;
    }

    ContinueWithSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      this.sink.event(t, x);
    };

    ContinueWithSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }

      tryDispose(t, this.disposable, this.sink);

      this._startNext(t, this.sink);
    };

    ContinueWithSink.prototype._startNext = function _startNext(t, sink) {
      try {
        this.disposable = this._continue(this.f, t, sink);
      } catch (e) {
        sink.error(t, e);
      }
    };

    ContinueWithSink.prototype._continue = function _continue(f, t, sink) {
      return run$1(sink, this.scheduler, withLocalTime$1(t, f()));
    };

    ContinueWithSink.prototype.dispose = function dispose$$1() {
      this.active = false;
      return this.disposable.dispose();
    };

    return ContinueWithSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  /**
   * Transform each value in the stream by applying f to each
   * @param {function(*):*} f mapping function
   * @param {Stream} stream stream to map
   * @returns {Stream} stream containing items transformed by f
   */


  var map$2 = function map$$1(f, stream) {
    return Map$1.create(f, stream);
  };
  /**
  * Perform a side effect for each item in the stream
  * @param {function(x:*):*} f side effect to execute for each item. The
  *  return value will be discarded.
  * @param {Stream} stream stream to tap
  * @returns {Stream} new stream containing the same items as this stream
  */


  var tap$1 = function tap(f, stream) {
    return new Tap(f, stream);
  };

  var Tap =
  /*#__PURE__*/
  function () {
    function Tap(f, source) {
      classCallCheck$2(this, Tap);
      this.source = source;
      this.f = f;
    }

    Tap.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new TapSink(this.f, sink), scheduler$$1);
    };

    return Tap;
  }();

  var TapSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(TapSink, _Pipe);

    function TapSink(f, sink) {
      classCallCheck$2(this, TapSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      return _this;
    }

    TapSink.prototype.event = function event(t, x) {
      var f = this.f;
      f(x);
      this.sink.event(t, x);
    };

    return TapSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var IndexSink =
  /*#__PURE__*/
  function (_Sink) {
    inherits(IndexSink, _Sink);

    function IndexSink(i, sink) {
      classCallCheck$2(this, IndexSink);

      var _this = possibleConstructorReturn(this, _Sink.call(this, sink));

      _this.index = i;
      _this.active = true;
      _this.value = undefined;
      return _this;
    }

    IndexSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      this.value = x;
      this.sink.event(t, this);
    };

    IndexSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }

      this.active = false;
      this.sink.event(t, this);
    };

    return IndexSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  function invoke(f, args) {
    /* eslint complexity: [2,7] */
    switch (args.length) {
      case 0:
        return f();

      case 1:
        return f(args[0]);

      case 2:
        return f(args[0], args[1]);

      case 3:
        return f(args[0], args[1], args[2]);

      case 4:
        return f(args[0], args[1], args[2], args[3]);

      case 5:
        return f(args[0], args[1], args[2], args[3], args[4]);

      default:
        return f.apply(void 0, args);
    }
  }

  var Combine =
  /*#__PURE__*/
  function () {
    function Combine(f, sources) {
      classCallCheck$2(this, Combine);
      this.f = f;
      this.sources = sources;
    }

    Combine.prototype.run = function run(sink, scheduler$$1) {
      var l = this.sources.length;
      var disposables = new Array(l);
      var sinks = new Array(l);
      var mergeSink = new CombineSink(disposables, sinks, sink, this.f);

      for (var indexSink, i = 0; i < l; ++i) {
        indexSink = sinks[i] = new IndexSink(i, mergeSink);
        disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
      }

      return disposeAll(disposables);
    };

    return Combine;
  }();

  var CombineSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(CombineSink, _Pipe);

    function CombineSink(disposables, sinks, sink, f) {
      classCallCheck$2(this, CombineSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.disposables = disposables;
      _this.sinks = sinks;
      _this.f = f;
      var l = sinks.length;
      _this.awaiting = l;
      _this.values = new Array(l);
      _this.hasValue = new Array(l).fill(false);
      _this.activeCount = sinks.length;
      return _this;
    }

    CombineSink.prototype.event = function event(t, indexedValue) {
      if (!indexedValue.active) {
        this._dispose(t, indexedValue.index);

        return;
      }

      var i = indexedValue.index;

      var awaiting = this._updateReady(i);

      this.values[i] = indexedValue.value;

      if (awaiting === 0) {
        this.sink.event(t, invoke(this.f, this.values));
      }
    };

    CombineSink.prototype._updateReady = function _updateReady(index) {
      if (this.awaiting > 0) {
        if (!this.hasValue[index]) {
          this.hasValue[index] = true;
          this.awaiting -= 1;
        }
      }

      return this.awaiting;
    };

    CombineSink.prototype._dispose = function _dispose(t, index) {
      tryDispose(t, this.disposables[index], this.sink);

      if (--this.activeCount === 0) {
        this.sink.end(t);
      }
    };

    return CombineSink;
  }(Pipe);
  /** @license MIT License (c) copyright 2010 original author or authors */

  /**
   * Doubly linked list
   * @constructor
   */


  var LinkedList =
  /*#__PURE__*/
  function () {
    function LinkedList() {
      classCallCheck$2(this, LinkedList);
      this.head = null;
      this.length = 0;
    }
    /**
     * Add a node to the end of the list
     * @param {{prev:Object|null, next:Object|null, dispose:function}} x node to add
     */


    LinkedList.prototype.add = function add(x) {
      if (this.head !== null) {
        this.head.prev = x;
        x.next = this.head;
      }

      this.head = x;
      ++this.length;
    };
    /**
     * Remove the provided node from the list
     * @param {{prev:Object|null, next:Object|null, dispose:function}} x node to remove
     */


    LinkedList.prototype.remove = function remove$$1(x) {
      // eslint-disable-line  complexity
      --this.length;

      if (x === this.head) {
        this.head = this.head.next;
      }

      if (x.next !== null) {
        x.next.prev = x.prev;
        x.next = null;
      }

      if (x.prev !== null) {
        x.prev.next = x.next;
        x.prev = null;
      }
    };
    /**
     * @returns {boolean} true iff there are no nodes in the list
     */


    LinkedList.prototype.isEmpty = function isEmpty() {
      return this.length === 0;
    };
    /**
     * Dispose all nodes
     * @returns {void}
     */


    LinkedList.prototype.dispose = function dispose$$1() {
      if (this.isEmpty()) {
        return;
      }

      var head = this.head;
      this.head = null;
      this.length = 0;

      while (head !== null) {
        head.dispose();
        head = head.next;
      }
    };

    return LinkedList;
  }();

  var MergeConcurrently =
  /*#__PURE__*/
  function () {
    function MergeConcurrently(f, concurrency, source) {
      classCallCheck$2(this, MergeConcurrently);
      this.f = f;
      this.concurrency = concurrency;
      this.source = source;
    }

    MergeConcurrently.prototype.run = function run(sink, scheduler$$1) {
      return new Outer(this.f, this.concurrency, this.source, sink, scheduler$$1);
    };

    return MergeConcurrently;
  }();

  var Outer =
  /*#__PURE__*/
  function () {
    function Outer(f, concurrency, source, sink, scheduler$$1) {
      classCallCheck$2(this, Outer);
      this.f = f;
      this.concurrency = concurrency;
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.pending = [];
      this.current = new LinkedList();
      this.disposable = disposeOnce(source.run(this, scheduler$$1));
      this.active = true;
    }

    Outer.prototype.event = function event(t, x) {
      this._addInner(t, x);
    };

    Outer.prototype._addInner = function _addInner(t, x) {
      if (this.current.length < this.concurrency) {
        this._startInner(t, x);
      } else {
        this.pending.push(x);
      }
    };

    Outer.prototype._startInner = function _startInner(t, x) {
      try {
        this._initInner(t, x);
      } catch (e) {
        this.error(t, e);
      }
    };

    Outer.prototype._initInner = function _initInner(t, x) {
      var innerSink = new Inner(t, this, this.sink);
      innerSink.disposable = mapAndRun(this.f, t, x, innerSink, this.scheduler);
      this.current.add(innerSink);
    };

    Outer.prototype.end = function end(t) {
      this.active = false;
      tryDispose(t, this.disposable, this.sink);

      this._checkEnd(t);
    };

    Outer.prototype.error = function error(t, e) {
      this.active = false;
      this.sink.error(t, e);
    };

    Outer.prototype.dispose = function dispose$$1() {
      this.active = false;
      this.pending.length = 0;
      this.disposable.dispose();
      this.current.dispose();
    };

    Outer.prototype._endInner = function _endInner(t, inner) {
      this.current.remove(inner);
      tryDispose(t, inner, this);

      if (this.pending.length === 0) {
        this._checkEnd(t);
      } else {
        this._startInner(t, this.pending.shift());
      }
    };

    Outer.prototype._checkEnd = function _checkEnd(t) {
      if (!this.active && this.current.isEmpty()) {
        this.sink.end(t);
      }
    };

    return Outer;
  }();

  var mapAndRun = function mapAndRun(f, t, x, sink, scheduler$$1) {
    return f(x).run(sink, schedulerRelativeTo(t, scheduler$$1));
  };

  var Inner =
  /*#__PURE__*/
  function () {
    function Inner(time, outer, sink) {
      classCallCheck$2(this, Inner);
      this.prev = this.next = null;
      this.time = time;
      this.outer = outer;
      this.sink = sink;
      this.disposable = void 0;
    }

    Inner.prototype.event = function event(t, x) {
      this.sink.event(t + this.time, x);
    };

    Inner.prototype.end = function end(t) {
      this.outer._endInner(t + this.time, this);
    };

    Inner.prototype.error = function error(t, e) {
      this.outer.error(t + this.time, e);
    };

    Inner.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return Inner;
  }();

  var Merge =
  /*#__PURE__*/
  function () {
    function Merge(sources) {
      classCallCheck$2(this, Merge);
      this.sources = sources;
    }

    Merge.prototype.run = function run(sink, scheduler$$1) {
      var l = this.sources.length;
      var disposables = new Array(l);
      var sinks = new Array(l);
      var mergeSink = new MergeSink(disposables, sinks, sink);

      for (var indexSink, i = 0; i < l; ++i) {
        indexSink = sinks[i] = new IndexSink(i, mergeSink);
        disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
      }

      return disposeAll(disposables);
    };

    return Merge;
  }();

  var MergeSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(MergeSink, _Pipe);

    function MergeSink(disposables, sinks, sink) {
      classCallCheck$2(this, MergeSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.disposables = disposables;
      _this.activeCount = sinks.length;
      return _this;
    }

    MergeSink.prototype.event = function event(t, indexValue) {
      if (!indexValue.active) {
        this._dispose(t, indexValue.index);

        return;
      }

      this.sink.event(t, indexValue.value);
    };

    MergeSink.prototype._dispose = function _dispose(t, index) {
      tryDispose(t, this.disposables[index], this.sink);

      if (--this.activeCount === 0) {
        this.sink.end(t);
      }
    };

    return MergeSink;
  }(Pipe);

  var Snapshot =
  /*#__PURE__*/
  function () {
    function Snapshot(f, values, sampler) {
      classCallCheck$2(this, Snapshot);
      this.f = f;
      this.values = values;
      this.sampler = sampler;
    }

    Snapshot.prototype.run = function run(sink, scheduler$$1) {
      var sampleSink = new SnapshotSink(this.f, sink);
      var valuesDisposable = this.values.run(sampleSink.latest, scheduler$$1);
      var samplerDisposable = this.sampler.run(sampleSink, scheduler$$1);
      return disposeBoth(samplerDisposable, valuesDisposable);
    };

    return Snapshot;
  }();

  var SnapshotSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(SnapshotSink, _Pipe);

    function SnapshotSink(f, sink) {
      classCallCheck$2(this, SnapshotSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.latest = new LatestValueSink(_this);
      return _this;
    }

    SnapshotSink.prototype.event = function event(t, x) {
      if (this.latest.hasValue) {
        var f = this.f;
        this.sink.event(t, f(this.latest.value, x));
      }
    };

    return SnapshotSink;
  }(Pipe);

  var LatestValueSink =
  /*#__PURE__*/
  function (_Pipe2) {
    inherits(LatestValueSink, _Pipe2);

    function LatestValueSink(sink) {
      classCallCheck$2(this, LatestValueSink);

      var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

      _this2.hasValue = false;
      return _this2;
    }

    LatestValueSink.prototype.event = function event(t, x) {
      this.value = x;
      this.hasValue = true;
    };

    LatestValueSink.prototype.end = function end() {};

    return LatestValueSink;
  }(Pipe); // Copied and modified from https://github.com/invertase/denque
  // MIT License
  // These constants were extracted directly from denque's shift()
  // It's not clear exactly why the authors chose these particular
  // values, but given denque's stated goals, it seems likely that
  // they were chosen for speed/memory reasons.
  // Max value of _head at which Queue is willing to shink
  // its internal array


  var HEAD_MAX_SHRINK = 2; // Min value of _tail at which Queue is willing to shink
  // its internal array

  var TAIL_MIN_SHRINK = 10000;

  var Queue =
  /*#__PURE__*/
  function () {
    function Queue() {
      classCallCheck$2(this, Queue);
      this._head = 0;
      this._tail = 0;
      this._capacityMask = 0x3;
      this._list = new Array(4);
    }

    Queue.prototype.push = function push(x) {
      var tail$$1 = this._tail;
      this._list[tail$$1] = x;
      this._tail = tail$$1 + 1 & this._capacityMask;

      if (this._tail === this._head) {
        this._growArray();
      }

      if (this._head < this._tail) {
        return this._tail - this._head;
      } else {
        return this._capacityMask + 1 - (this._head - this._tail);
      }
    };

    Queue.prototype.shift = function shift() {
      var head = this._head;

      if (head === this._tail) {
        return undefined;
      }

      var x = this._list[head];
      this._list[head] = undefined;
      this._head = head + 1 & this._capacityMask;

      if (head < HEAD_MAX_SHRINK && this._tail > TAIL_MIN_SHRINK && this._tail <= this._list.length >>> 2) {
        this._shrinkArray();
      }

      return x;
    };

    Queue.prototype.isEmpty = function isEmpty() {
      return this._head === this._tail;
    };

    Queue.prototype.length = function length() {
      if (this._head === this._tail) {
        return 0;
      } else if (this._head < this._tail) {
        return this._tail - this._head;
      } else {
        return this._capacityMask + 1 - (this._head - this._tail);
      }
    };

    Queue.prototype._growArray = function _growArray() {
      if (this._head) {
        // copy existing data, head to end, then beginning to tail.
        this._list = this._copyArray();
        this._head = 0;
      } // head is at 0 and array is now full, safe to extend


      this._tail = this._list.length;
      this._list.length *= 2;
      this._capacityMask = this._capacityMask << 1 | 1;
    };

    Queue.prototype._shrinkArray = function _shrinkArray() {
      this._list.length >>>= 1;
      this._capacityMask >>>= 1;
    };

    Queue.prototype._copyArray = function _copyArray() {
      var newArray = [];
      var list = this._list;
      var len = list.length;
      var i = void 0;

      for (i = this._head; i < len; i++) {
        newArray.push(list[i]);
      }

      for (i = 0; i < this._tail; i++) {
        newArray.push(list[i]);
      }

      return newArray;
    };

    return Queue;
  }();

  var Zip =
  /*#__PURE__*/
  function () {
    function Zip(f, sources) {
      classCallCheck$2(this, Zip);
      this.f = f;
      this.sources = sources;
    }

    Zip.prototype.run = function run(sink, scheduler$$1) {
      var l = this.sources.length;
      var disposables = new Array(l);
      var sinks = new Array(l);
      var buffers = new Array(l);
      var zipSink = new ZipSink(this.f, buffers, sinks, sink);

      for (var indexSink, i = 0; i < l; ++i) {
        buffers[i] = new Queue();
        indexSink = sinks[i] = new IndexSink(i, zipSink);
        disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
      }

      return disposeAll(disposables);
    };

    return Zip;
  }();

  var ZipSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(ZipSink, _Pipe);

    function ZipSink(f, buffers, sinks, sink) {
      classCallCheck$2(this, ZipSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.sinks = sinks;
      _this.buffers = buffers;
      return _this;
    }

    ZipSink.prototype.event = function event(t, indexedValue) {
      /* eslint complexity: [1, 5] */
      if (!indexedValue.active) {
        this._dispose(t, indexedValue.index);

        return;
      }

      var buffers = this.buffers;
      var buffer = buffers[indexedValue.index];
      buffer.push(indexedValue.value);

      if (buffer.length() === 1) {
        if (!ready(this.buffers)) {
          return;
        }

        emitZipped(this.f, t, buffers, this.sink);

        if (ended(this.buffers, this.sinks)) {
          this.sink.end(t);
        }
      }
    };

    ZipSink.prototype._dispose = function _dispose(t, index) {
      var buffer = this.buffers[index];

      if (buffer.isEmpty()) {
        this.sink.end(t);
      }
    };

    return ZipSink;
  }(Pipe);

  var emitZipped = function emitZipped(f, t, buffers, sink) {
    return sink.event(t, invoke(f, map(head, buffers)));
  };

  var head = function head(buffer) {
    return buffer.shift();
  };

  function ended(buffers, sinks) {
    for (var i = 0, l = buffers.length; i < l; ++i) {
      if (buffers[i].isEmpty() && !sinks[i].active) {
        return true;
      }
    }

    return false;
  }

  function ready(buffers) {
    for (var i = 0, l = buffers.length; i < l; ++i) {
      if (buffers[i].isEmpty()) {
        return false;
      }
    }

    return true;
  }
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  /**
   * Given a stream of streams, return a new stream that adopts the behavior
   * of the most recent inner stream.
   * @param {Stream} stream of streams on which to switch
   * @returns {Stream} switching stream
   */


  var switchLatest = function switchLatest(stream) {
    return isCanonicalEmpty(stream) ? empty() : new Switch(stream);
  };

  var Switch =
  /*#__PURE__*/
  function () {
    function Switch(source) {
      classCallCheck$2(this, Switch);
      this.source = source;
    }

    Switch.prototype.run = function run(sink, scheduler$$1) {
      var switchSink = new SwitchSink(sink, scheduler$$1);
      return disposeBoth(switchSink, this.source.run(switchSink, scheduler$$1));
    };

    return Switch;
  }();

  var SwitchSink =
  /*#__PURE__*/
  function () {
    function SwitchSink(sink, scheduler$$1) {
      classCallCheck$2(this, SwitchSink);
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.current = null;
      this.ended = false;
    }

    SwitchSink.prototype.event = function event(t, stream) {
      this._disposeCurrent(t);

      this.current = new Segment(stream, t, Infinity, this, this.sink, this.scheduler);
    };

    SwitchSink.prototype.end = function end(t) {
      this.ended = true;

      this._checkEnd(t);
    };

    SwitchSink.prototype.error = function error(t, e) {
      this.ended = true;
      this.sink.error(t, e);
    };

    SwitchSink.prototype.dispose = function dispose$$1() {
      return this._disposeCurrent(currentTime(this.scheduler));
    };

    SwitchSink.prototype._disposeCurrent = function _disposeCurrent(t) {
      if (this.current !== null) {
        return this.current._dispose(t);
      }
    };

    SwitchSink.prototype._disposeInner = function _disposeInner(t, inner) {
      inner._dispose(t);

      if (inner === this.current) {
        this.current = null;
      }
    };

    SwitchSink.prototype._checkEnd = function _checkEnd(t) {
      if (this.ended && this.current === null) {
        this.sink.end(t);
      }
    };

    SwitchSink.prototype._endInner = function _endInner(t, inner) {
      this._disposeInner(t, inner);

      this._checkEnd(t);
    };

    SwitchSink.prototype._errorInner = function _errorInner(t, e, inner) {
      this._disposeInner(t, inner);

      this.sink.error(t, e);
    };

    return SwitchSink;
  }();

  var Segment =
  /*#__PURE__*/
  function () {
    function Segment(source, min, max, outer, sink, scheduler$$1) {
      classCallCheck$2(this, Segment);
      this.min = min;
      this.max = max;
      this.outer = outer;
      this.sink = sink;
      this.disposable = source.run(this, schedulerRelativeTo(min, scheduler$$1));
    }

    Segment.prototype.event = function event(t, x) {
      var time = Math.max(0, t + this.min);

      if (time < this.max) {
        this.sink.event(time, x);
      }
    };

    Segment.prototype.end = function end(t) {
      this.outer._endInner(t + this.min, this);
    };

    Segment.prototype.error = function error(t, e) {
      this.outer._errorInner(t + this.min, e, this);
    };

    Segment.prototype._dispose = function _dispose(t) {
      tryDispose(t + this.min, this.disposable, this.sink);
    };

    return Segment;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  /**
   * Retain only items matching a predicate
   * @param {function(x:*):boolean} p filtering predicate called for each item
   * @param {Stream} stream stream to filter
   * @returns {Stream} stream containing only items for which predicate returns truthy
   */


  var filter$1 = function filter(p, stream) {
    return Filter.create(p, stream);
  };
  /**
   * Skip repeated events, using === to detect duplicates
   * @param {Stream} stream stream from which to omit repeated events
   * @returns {Stream} stream without repeated events
   */


  var skipRepeats = function skipRepeats(stream) {
    return skipRepeatsWith$1(same, stream);
  };
  /**
   * Skip repeated events using the provided equals function to detect duplicates
   * @param {function(a:*, b:*):boolean} equals optional function to compare items
   * @param {Stream} stream stream from which to omit repeated events
   * @returns {Stream} stream without repeated events
   */


  var skipRepeatsWith$1 = function skipRepeatsWith(equals, stream) {
    return isCanonicalEmpty(stream) ? empty() : new SkipRepeats(equals, stream);
  };

  var SkipRepeats =
  /*#__PURE__*/
  function () {
    function SkipRepeats(equals, source) {
      classCallCheck$2(this, SkipRepeats);
      this.equals = equals;
      this.source = source;
    }

    SkipRepeats.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler$$1);
    };

    return SkipRepeats;
  }();

  var SkipRepeatsSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(SkipRepeatsSink, _Pipe);

    function SkipRepeatsSink(equals, sink) {
      classCallCheck$2(this, SkipRepeatsSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.equals = equals;
      _this.value = void 0;
      _this.init = true;
      return _this;
    }

    SkipRepeatsSink.prototype.event = function event(t, x) {
      if (this.init) {
        this.init = false;
        this.value = x;
        this.sink.event(t, x);
      } else if (!this.equals(this.value, x)) {
        this.value = x;
        this.sink.event(t, x);
      }
    };

    return SkipRepeatsSink;
  }(Pipe);

  function same(a, b) {
    return a === b;
  }

  var Until =
  /*#__PURE__*/
  function () {
    function Until(maxSignal, source) {
      classCallCheck$2(this, Until);
      this.maxSignal = maxSignal;
      this.source = source;
    }

    Until.prototype.run = function run(sink, scheduler$$1) {
      var min = new Bound(-Infinity, sink);
      var max = new UpperBound(this.maxSignal, sink, scheduler$$1);
      var disposable$$1 = this.source.run(new TimeWindowSink(min, max, sink), scheduler$$1);
      return disposeAll([min, max, disposable$$1]);
    };

    return Until;
  }();

  var Since =
  /*#__PURE__*/
  function () {
    function Since(minSignal, source) {
      classCallCheck$2(this, Since);
      this.minSignal = minSignal;
      this.source = source;
    }

    Since.prototype.run = function run(sink, scheduler$$1) {
      var min = new LowerBound(this.minSignal, sink, scheduler$$1);
      var max = new Bound(Infinity, sink);
      var disposable$$1 = this.source.run(new TimeWindowSink(min, max, sink), scheduler$$1);
      return disposeAll([min, max, disposable$$1]);
    };

    return Since;
  }();

  var Bound =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(Bound, _Pipe);

    function Bound(value, sink) {
      classCallCheck$2(this, Bound);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.value = value;
      return _this;
    }

    Bound.prototype.event = function event() {};

    Bound.prototype.end = function end() {};

    Bound.prototype.dispose = function dispose$$1() {};

    return Bound;
  }(Pipe);

  var TimeWindowSink =
  /*#__PURE__*/
  function (_Pipe2) {
    inherits(TimeWindowSink, _Pipe2);

    function TimeWindowSink(min, max, sink) {
      classCallCheck$2(this, TimeWindowSink);

      var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

      _this2.min = min;
      _this2.max = max;
      return _this2;
    }

    TimeWindowSink.prototype.event = function event(t, x) {
      if (t >= this.min.value && t < this.max.value) {
        this.sink.event(t, x);
      }
    };

    return TimeWindowSink;
  }(Pipe);

  var LowerBound =
  /*#__PURE__*/
  function (_Pipe3) {
    inherits(LowerBound, _Pipe3);

    function LowerBound(signal, sink, scheduler$$1) {
      classCallCheck$2(this, LowerBound);

      var _this3 = possibleConstructorReturn(this, _Pipe3.call(this, sink));

      _this3.value = Infinity;
      _this3.disposable = signal.run(_this3, scheduler$$1);
      return _this3;
    }

    LowerBound.prototype.event = function event(t
    /*, x */
    ) {
      if (t < this.value) {
        this.value = t;
      }
    };

    LowerBound.prototype.end = function end() {};

    LowerBound.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return LowerBound;
  }(Pipe);

  var UpperBound =
  /*#__PURE__*/
  function (_Pipe4) {
    inherits(UpperBound, _Pipe4);

    function UpperBound(signal, sink, scheduler$$1) {
      classCallCheck$2(this, UpperBound);

      var _this4 = possibleConstructorReturn(this, _Pipe4.call(this, sink));

      _this4.value = Infinity;
      _this4.disposable = signal.run(_this4, scheduler$$1);
      return _this4;
    }

    UpperBound.prototype.event = function event(t, x) {
      if (t < this.value) {
        this.value = t;
        this.sink.end(t);
      }
    };

    UpperBound.prototype.end = function end() {};

    UpperBound.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return UpperBound;
  }(Pipe);

  var Delay =
  /*#__PURE__*/
  function () {
    function Delay(dt, source) {
      classCallCheck$2(this, Delay);
      this.dt = dt;
      this.source = source;
    }

    Delay.prototype.run = function run(sink, scheduler$$1) {
      var delaySink = new DelaySink(this.dt, sink, scheduler$$1);
      return disposeBoth(delaySink, this.source.run(delaySink, scheduler$$1));
    };

    return Delay;
  }();

  var DelaySink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(DelaySink, _Pipe);

    function DelaySink(dt, sink, scheduler$$1) {
      classCallCheck$2(this, DelaySink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.dt = dt;
      _this.scheduler = scheduler$$1;
      return _this;
    }

    DelaySink.prototype.dispose = function dispose$$1() {
      var _this2 = this;

      cancelAllTasks(function (task) {
        return task.sink === _this2.sink;
      }, this.scheduler);
    };

    DelaySink.prototype.event = function event(t, x) {
      delay(this.dt, propagateEventTask$1(x, this.sink), this.scheduler);
    };

    DelaySink.prototype.end = function end(t) {
      delay(this.dt, propagateEndTask(this.sink), this.scheduler);
    };

    return DelaySink;
  }(Pipe);

  var Throttle =
  /*#__PURE__*/
  function () {
    function Throttle(period, source) {
      classCallCheck$2(this, Throttle);
      this.period = period;
      this.source = source;
    }

    Throttle.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new ThrottleSink(this.period, sink), scheduler$$1);
    };

    return Throttle;
  }();

  var ThrottleSink =
  /*#__PURE__*/
  function (_Pipe) {
    inherits(ThrottleSink, _Pipe);

    function ThrottleSink(period, sink) {
      classCallCheck$2(this, ThrottleSink);

      var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

      _this.time = 0;
      _this.period = period;
      return _this;
    }

    ThrottleSink.prototype.event = function event(t, x) {
      if (t >= this.time) {
        this.time = t + this.period;
        this.sink.event(t, x);
      }
    };

    return ThrottleSink;
  }(Pipe);
  /**
   * Wait for a burst of events to subside and emit only the last event in the burst
   * @param {Number} period events occuring more frequently than this
   *  will be suppressed
   * @param {Stream} stream stream to debounce
   * @returns {Stream} new debounced stream
   */


  var debounce$1 = function debounce(period, stream) {
    return isCanonicalEmpty(stream) ? empty() : new Debounce(period, stream);
  };

  var Debounce =
  /*#__PURE__*/
  function () {
    function Debounce(dt, source) {
      classCallCheck$2(this, Debounce);
      this.dt = dt;
      this.source = source;
    }

    Debounce.prototype.run = function run(sink, scheduler$$1) {
      return new DebounceSink(this.dt, this.source, sink, scheduler$$1);
    };

    return Debounce;
  }();

  var DebounceSink =
  /*#__PURE__*/
  function () {
    function DebounceSink(dt, source, sink, scheduler$$1) {
      classCallCheck$2(this, DebounceSink);
      this.dt = dt;
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.value = void 0;
      this.timer = null;
      this.disposable = source.run(this, scheduler$$1);
    }

    DebounceSink.prototype.event = function event(t, x) {
      this._clearTimer();

      this.value = x;
      this.timer = delay(this.dt, new DebounceTask(this, x), this.scheduler);
    };

    DebounceSink.prototype._event = function _event(t, x) {
      this._clearTimer();

      this.sink.event(t, x);
    };

    DebounceSink.prototype.end = function end(t) {
      if (this._clearTimer()) {
        this.sink.event(t, this.value);
        this.value = undefined;
      }

      this.sink.end(t);
    };

    DebounceSink.prototype.error = function error(t, x) {
      this._clearTimer();

      this.sink.error(t, x);
    };

    DebounceSink.prototype.dispose = function dispose$$1() {
      this._clearTimer();

      this.disposable.dispose();
    };

    DebounceSink.prototype._clearTimer = function _clearTimer() {
      if (this.timer === null) {
        return false;
      }

      this.timer.dispose();
      this.timer = null;
      return true;
    };

    return DebounceSink;
  }();

  var DebounceTask =
  /*#__PURE__*/
  function () {
    function DebounceTask(debounce, value) {
      classCallCheck$2(this, DebounceTask);
      this.debounce = debounce;
      this.value = value;
    }

    DebounceTask.prototype.run = function run(t) {
      this.debounce._event(t, this.value);
    };

    DebounceTask.prototype.error = function error(t, e) {
      this.debounce.error(t, e);
    };

    DebounceTask.prototype.dispose = function dispose$$1() {};

    return DebounceTask;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  /**
   * Turn a Stream<Promise<T>> into Stream<T> by awaiting each promise.
   * Event order is preserved. The stream will fail if any promise rejects.
   */


  var awaitPromises = function awaitPromises(stream) {
    return isCanonicalEmpty(stream) ? empty() : new Await(stream);
  };
  /**
   * Create a stream containing only the promise's fulfillment
   * value at the time it fulfills.
   * @param {Promise<T>} p promise
   * @return {Stream<T>} stream containing promise's fulfillment value.
   *  If the promise rejects, the stream will error
   */


  var fromPromise =
  /*#__PURE__*/
  compose(awaitPromises, now);

  var Await =
  /*#__PURE__*/
  function () {
    function Await(source) {
      classCallCheck$2(this, Await);
      this.source = source;
    }

    Await.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new AwaitSink(sink, scheduler$$1), scheduler$$1);
    };

    return Await;
  }();

  var AwaitSink =
  /*#__PURE__*/
  function () {
    function AwaitSink(sink, scheduler$$1) {
      var _this = this;

      classCallCheck$2(this, AwaitSink);
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.queue = Promise.resolve(); // Pre-create closures, to avoid creating them per event

      this._eventBound = function (x) {
        return _this.sink.event(currentTime(_this.scheduler), x);
      };

      this._endBound = function () {
        return _this.sink.end(currentTime(_this.scheduler));
      };

      this._errorBound = function (e) {
        return _this.sink.error(currentTime(_this.scheduler), e);
      };
    }

    AwaitSink.prototype.event = function event(t, promise) {
      var _this2 = this;

      this.queue = this.queue.then(function () {
        return _this2._event(promise);
      }).catch(this._errorBound);
    };

    AwaitSink.prototype.end = function end(t) {
      this.queue = this.queue.then(this._endBound).catch(this._errorBound);
    };

    AwaitSink.prototype.error = function error(t, e) {
      var _this3 = this; // Don't resolve error values, propagate directly


      this.queue = this.queue.then(function () {
        return _this3._errorBound(e);
      }).catch(fatalError);
    };

    AwaitSink.prototype._event = function _event(promise) {
      return promise.then(this._eventBound);
    };

    return AwaitSink;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var SafeSink =
  /*#__PURE__*/
  function () {
    function SafeSink(sink) {
      classCallCheck$2(this, SafeSink);
      this.sink = sink;
      this.active = true;
    }

    SafeSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      this.sink.event(t, x);
    };

    SafeSink.prototype.end = function end(t, x) {
      if (!this.active) {
        return;
      }

      this.disable();
      this.sink.end(t, x);
    };

    SafeSink.prototype.error = function error(t, e) {
      this.disable();
      this.sink.error(t, e);
    };

    SafeSink.prototype.disable = function disable() {
      this.active = false;
      return this.sink;
    };

    return SafeSink;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  function tryEvent(t, x, sink) {
    try {
      sink.event(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  function tryEnd(t, sink) {
    try {
      sink.end(t);
    } catch (e) {
      sink.error(t, e);
    }
  }

  var ErrorStream =
  /*#__PURE__*/
  function () {
    function ErrorStream(e) {
      classCallCheck$2(this, ErrorStream);
      this.value = e;
    }

    ErrorStream.prototype.run = function run(sink, scheduler$$1) {
      return asap(propagateErrorTask$1(this.value, sink), scheduler$$1);
    };

    return ErrorStream;
  }();

  var RecoverWith =
  /*#__PURE__*/
  function () {
    function RecoverWith(f, source) {
      classCallCheck$2(this, RecoverWith);
      this.f = f;
      this.source = source;
    }

    RecoverWith.prototype.run = function run(sink, scheduler$$1) {
      return new RecoverWithSink(this.f, this.source, sink, scheduler$$1);
    };

    return RecoverWith;
  }();

  var RecoverWithSink =
  /*#__PURE__*/
  function () {
    function RecoverWithSink(f, source, sink, scheduler$$1) {
      classCallCheck$2(this, RecoverWithSink);
      this.f = f;
      this.sink = new SafeSink(sink);
      this.scheduler = scheduler$$1;
      this.disposable = source.run(this, scheduler$$1);
    }

    RecoverWithSink.prototype.event = function event(t, x) {
      tryEvent(t, x, this.sink);
    };

    RecoverWithSink.prototype.end = function end(t) {
      tryEnd(t, this.sink);
    };

    RecoverWithSink.prototype.error = function error(t, e) {
      var nextSink = this.sink.disable();
      tryDispose(t, this.disposable, this.sink);

      this._startNext(t, e, nextSink);
    };

    RecoverWithSink.prototype._startNext = function _startNext(t, x, sink) {
      try {
        this.disposable = this._continue(this.f, t, x, sink);
      } catch (e) {
        sink.error(t, e);
      }
    };

    RecoverWithSink.prototype._continue = function _continue(f, t, x, sink) {
      return run$1(sink, this.scheduler, withLocalTime$1(t, f(x)));
    };

    RecoverWithSink.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return RecoverWithSink;
  }();

  var Multicast =
  /*#__PURE__*/
  function () {
    function Multicast(source) {
      classCallCheck$2(this, Multicast);
      this.source = new MulticastSource(source);
    }

    Multicast.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(sink, scheduler$$1);
    };

    return Multicast;
  }();

  var MulticastSource =
  /*#__PURE__*/
  function () {
    function MulticastSource(source) {
      classCallCheck$2(this, MulticastSource);
      this.source = source;
      this.sinks = [];
      this.disposable = disposeNone();
    }

    MulticastSource.prototype.run = function run(sink, scheduler$$1) {
      var n = this.add(sink);

      if (n === 1) {
        this.disposable = this.source.run(this, scheduler$$1);
      }

      return disposeOnce(new MulticastDisposable(this, sink));
    };

    MulticastSource.prototype.dispose = function dispose$$1() {
      var disposable$$1 = this.disposable;
      this.disposable = disposeNone();
      return disposable$$1.dispose();
    };

    MulticastSource.prototype.add = function add(sink) {
      this.sinks = append(sink, this.sinks);
      return this.sinks.length;
    };

    MulticastSource.prototype.remove = function remove$$1(sink) {
      var i = findIndex(sink, this.sinks); // istanbul ignore next

      if (i >= 0) {
        this.sinks = remove(i, this.sinks);
      }

      return this.sinks.length;
    };

    MulticastSource.prototype.event = function event(time, value) {
      var s = this.sinks;

      if (s.length === 1) {
        return s[0].event(time, value);
      }

      for (var i = 0; i < s.length; ++i) {
        tryEvent(time, value, s[i]);
      }
    };

    MulticastSource.prototype.end = function end(time) {
      var s = this.sinks;

      for (var i = 0; i < s.length; ++i) {
        tryEnd(time, s[i]);
      }
    };

    MulticastSource.prototype.error = function error(time, err) {
      var s = this.sinks;

      for (var i = 0; i < s.length; ++i) {
        s[i].error(time, err);
      }
    };

    return MulticastSource;
  }();

  var MulticastDisposable =
  /*#__PURE__*/
  function () {
    function MulticastDisposable(source, sink) {
      classCallCheck$2(this, MulticastDisposable);
      this.source = source;
      this.sink = sink;
    }

    MulticastDisposable.prototype.dispose = function dispose$$1() {
      if (this.source.remove(this.sink) === 0) {
        this.source.dispose();
      }
    };

    return MulticastDisposable;
  }();
  // Observing

  var runEffects$$1 =
  /*#__PURE__*/
  curry2(runEffects$1);
  // Transforming

  var map$1 =
  /*#__PURE__*/
  curry2(map$2);
  var tap$$1 =
  /*#__PURE__*/
  curry2(tap$1);
  // Filtering

  var filter$$1 =
  /*#__PURE__*/
  curry2(filter$1);
  var debounce$$1 =
  /*#__PURE__*/
  curry2(debounce$1); // -----------------------------------------------------------------------

  var currentTime$1 = function currentTime(scheduler) {
    return scheduler.currentTime();
  }; // Schedule a task to run as soon as possible, but

  /** @license MIT License (c) copyright 2015-2016 original author or authors */

  /** @author Brian Cavalier */
  // domEvent :: (EventTarget t, Event e) => String -> t -> boolean=false -> Stream e

  var domEvent = function domEvent(event, node, capture) {
    if (capture === void 0) capture = false;
    return new DomEvent(event, node, capture);
  };

  var input = function input(node, capture) {
    if (capture === void 0) capture = false;
    return domEvent('input', node, capture);
  };

  var DomEvent = function DomEvent(event, node, capture) {
    this.event = event;
    this.node = node;
    this.capture = capture;
  };

  DomEvent.prototype.run = function run(sink, scheduler$$1) {
    var this$1 = this;

    var send = function send(e) {
      return tryEvent$1(currentTime$1(scheduler$$1), e, sink);
    };

    var dispose = function dispose() {
      return this$1.node.removeEventListener(this$1.event, send, this$1.capture);
    };

    this.node.addEventListener(this.event, send, this.capture);
    return {
      dispose: dispose
    };
  };

  function tryEvent$1(t, x, sink) {
    try {
      sink.event(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  function fatalError$1(e) {
    setTimeout(rethrow$1, 0, e);
  }

  function rethrow$1(e) {
    throw e;
  }

  var classCallCheck$3 = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var inherits$1 = function inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + _typeof(superClass));
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn$1 = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (_typeof(call) === "object" || typeof call === "function") ? call : self;
  };
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var propagateTask$1$1 = function propagateTask(run, value, sink) {
    return new PropagateTask$1(run, value, sink);
  };

  var propagateEventTask$1$1 = function propagateEventTask(value, sink) {
    return propagateTask$1$1(runEvent$1, value, sink);
  };

  var propagateEndTask$1 = function propagateEndTask(sink) {
    return propagateTask$1$1(runEnd$1, undefined, sink);
  };

  var propagateErrorTask$1$1 = function propagateErrorTask(value, sink) {
    return propagateTask$1$1(runError$1, value, sink);
  };

  var PropagateTask$1 =
  /*#__PURE__*/
  function () {
    function PropagateTask(run, value, sink) {
      classCallCheck$3(this, PropagateTask);
      this._run = run;
      this.value = value;
      this.sink = sink;
      this.active = true;
    }

    PropagateTask.prototype.dispose = function dispose$$1() {
      this.active = false;
    };

    PropagateTask.prototype.run = function run(t) {
      if (!this.active) {
        return;
      }

      var run = this._run;
      run(t, this.value, this.sink);
    };

    PropagateTask.prototype.error = function error(t, e) {
      // TODO: Remove this check and just do this.sink.error(t, e)?
      if (!this.active) {
        return fatalError$1(e);
      }

      this.sink.error(t, e);
    };

    return PropagateTask;
  }();

  var runEvent$1 = function runEvent(t, x, sink) {
    return sink.event(t, x);
  };

  var runEnd$1 = function runEnd(t, _, sink) {
    return sink.end(t);
  };

  var runError$1 = function runError(t, e, sink) {
    return sink.error(t, e);
  };
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var empty$1 = function empty() {
    return EMPTY$1;
  };

  var isCanonicalEmpty$1 = function isCanonicalEmpty(stream) {
    return stream === EMPTY$1;
  };

  var Empty$1 =
  /*#__PURE__*/
  function () {
    function Empty() {
      classCallCheck$3(this, Empty);
    }

    Empty.prototype.run = function run(sink, scheduler$$1) {
      return asap(propagateEndTask$1(sink), scheduler$$1);
    };

    return Empty;
  }();

  var EMPTY$1 =
  /*#__PURE__*/
  new Empty$1();

  var Never$1 =
  /*#__PURE__*/
  function () {
    function Never() {
      classCallCheck$3(this, Never);
    }

    Never.prototype.run = function run() {
      return disposeNone();
    };

    return Never;
  }();

  var NEVER$1 =
  /*#__PURE__*/
  new Never$1();

  var At$1 =
  /*#__PURE__*/
  function () {
    function At(t, x) {
      classCallCheck$3(this, At);
      this.time = t;
      this.value = x;
    }

    At.prototype.run = function run(sink, scheduler$$1) {
      return delay(this.time, propagateTask$1$1(runAt$1, this.value, sink), scheduler$$1);
    };

    return At;
  }();

  function runAt$1(t, x, sink) {
    sink.event(t, x);
    sink.end(t);
  }

  var Periodic$1 =
  /*#__PURE__*/
  function () {
    function Periodic(period) {
      classCallCheck$3(this, Periodic);
      this.period = period;
    }

    Periodic.prototype.run = function run(sink, scheduler$$1) {
      return periodic(this.period, propagateEventTask$1$1(undefined, sink), scheduler$$1);
    };

    return Periodic;
  }();
  /** @license MIT License (c) copyright 2010-2017 original author or authors */

  /** @author Brian Cavalier */


  var Pipe$1 =
  /*#__PURE__*/
  function () {
    function Pipe(sink) {
      classCallCheck$3(this, Pipe);
      this.sink = sink;
    }

    Pipe.prototype.event = function event(t, x) {
      return this.sink.event(t, x);
    };

    Pipe.prototype.end = function end(t) {
      return this.sink.end(t);
    };

    Pipe.prototype.error = function error(t, e) {
      return this.sink.error(t, e);
    };

    return Pipe;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var Filter$1 =
  /*#__PURE__*/
  function () {
    function Filter(p, source) {
      classCallCheck$3(this, Filter);
      this.p = p;
      this.source = source;
    }

    Filter.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new FilterSink$1(this.p, sink), scheduler$$1);
    };
    /**
     * Create a filtered source, fusing adjacent filter.filter if possible
     * @param {function(x:*):boolean} p filtering predicate
     * @param {{run:function}} source source to filter
     * @returns {Filter} filtered source
     */


    Filter.create = function create(p, source) {
      if (isCanonicalEmpty$1(source)) {
        return source;
      }

      if (source instanceof Filter) {
        return new Filter(and$1(source.p, p), source.source);
      }

      return new Filter(p, source);
    };

    return Filter;
  }();

  var FilterSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(FilterSink, _Pipe);

    function FilterSink(p, sink) {
      classCallCheck$3(this, FilterSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.p = p;
      return _this;
    }

    FilterSink.prototype.event = function event(t, x) {
      var p = this.p;
      p(x) && this.sink.event(t, x);
    };

    return FilterSink;
  }(Pipe$1);

  var and$1 = function and(p, q) {
    return function (x) {
      return p(x) && q(x);
    };
  };
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var FilterMap$1 =
  /*#__PURE__*/
  function () {
    function FilterMap(p, f, source) {
      classCallCheck$3(this, FilterMap);
      this.p = p;
      this.f = f;
      this.source = source;
    }

    FilterMap.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new FilterMapSink$1(this.p, this.f, sink), scheduler$$1);
    };

    return FilterMap;
  }();

  var FilterMapSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(FilterMapSink, _Pipe);

    function FilterMapSink(p, f, sink) {
      classCallCheck$3(this, FilterMapSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.p = p;
      _this.f = f;
      return _this;
    }

    FilterMapSink.prototype.event = function event(t, x) {
      var f = this.f;
      var p = this.p;
      p(x) && this.sink.event(t, f(x));
    };

    return FilterMapSink;
  }(Pipe$1);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var Map$2 =
  /*#__PURE__*/
  function () {
    function Map(f, source) {
      classCallCheck$3(this, Map);
      this.f = f;
      this.source = source;
    }

    Map.prototype.run = function run(sink, scheduler$$1) {
      // eslint-disable-line no-extend-native
      return this.source.run(new MapSink$1(this.f, sink), scheduler$$1);
    };
    /**
     * Create a mapped source, fusing adjacent map.map, filter.map,
     * and filter.map.map if possible
     * @param {function(*):*} f mapping function
     * @param {{run:function}} source source to map
     * @returns {Map|FilterMap} mapped source, possibly fused
     */


    Map.create = function create(f, source) {
      if (isCanonicalEmpty$1(source)) {
        return empty$1();
      }

      if (source instanceof Map) {
        return new Map(compose(f, source.f), source.source);
      }

      if (source instanceof Filter$1) {
        return new FilterMap$1(source.p, f, source.source);
      }

      return new Map(f, source);
    };

    return Map;
  }();

  var MapSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(MapSink, _Pipe);

    function MapSink(f, sink) {
      classCallCheck$3(this, MapSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      return _this;
    }

    MapSink.prototype.event = function event(t, x) {
      var f = this.f;
      this.sink.event(t, f(x));
    };

    return MapSink;
  }(Pipe$1);
  /** @license MIT License (c) copyright 2010-2017 original author or authors */


  var SettableDisposable$1 =
  /*#__PURE__*/
  function () {
    function SettableDisposable() {
      classCallCheck$3(this, SettableDisposable);
      this.disposable = undefined;
      this.disposed = false;
    }

    SettableDisposable.prototype.setDisposable = function setDisposable(disposable$$1) {
      if (this.disposable !== void 0) {
        throw new Error('setDisposable called more than once');
      }

      this.disposable = disposable$$1;

      if (this.disposed) {
        disposable$$1.dispose();
      }
    };

    SettableDisposable.prototype.dispose = function dispose$$1() {
      if (this.disposed) {
        return;
      }

      this.disposed = true;

      if (this.disposable !== void 0) {
        this.disposable.dispose();
      }
    };

    return SettableDisposable;
  }();

  var Slice$1 =
  /*#__PURE__*/
  function () {
    function Slice(bounds, source) {
      classCallCheck$3(this, Slice);
      this.source = source;
      this.bounds = bounds;
    }

    Slice.prototype.run = function run(sink, scheduler$$1) {
      var disposable$$1 = new SettableDisposable$1();
      var sliceSink = new SliceSink$1(this.bounds.min, this.bounds.max - this.bounds.min, sink, disposable$$1);
      disposable$$1.setDisposable(this.source.run(sliceSink, scheduler$$1));
      return disposable$$1;
    };

    return Slice;
  }();

  var SliceSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(SliceSink, _Pipe);

    function SliceSink(skip, take, sink, disposable$$1) {
      classCallCheck$3(this, SliceSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.skip = skip;
      _this.take = take;
      _this.disposable = disposable$$1;
      return _this;
    }

    SliceSink.prototype.event = function event(t, x) {
      /* eslint complexity: [1, 4] */
      if (this.skip > 0) {
        this.skip -= 1;
        return;
      }

      if (this.take === 0) {
        return;
      }

      this.take -= 1;
      this.sink.event(t, x);

      if (this.take === 0) {
        this.disposable.dispose();
        this.sink.end(t);
      }
    };

    return SliceSink;
  }(Pipe$1);

  var TakeWhile$1 =
  /*#__PURE__*/
  function () {
    function TakeWhile(p, source) {
      classCallCheck$3(this, TakeWhile);
      this.p = p;
      this.source = source;
    }

    TakeWhile.prototype.run = function run(sink, scheduler$$1) {
      var disposable$$1 = new SettableDisposable$1();
      var takeWhileSink = new TakeWhileSink$1(this.p, sink, disposable$$1);
      disposable$$1.setDisposable(this.source.run(takeWhileSink, scheduler$$1));
      return disposable$$1;
    };

    return TakeWhile;
  }();

  var TakeWhileSink$1 =
  /*#__PURE__*/
  function (_Pipe2) {
    inherits$1(TakeWhileSink, _Pipe2);

    function TakeWhileSink(p, sink, disposable$$1) {
      classCallCheck$3(this, TakeWhileSink);

      var _this2 = possibleConstructorReturn$1(this, _Pipe2.call(this, sink));

      _this2.p = p;
      _this2.active = true;
      _this2.disposable = disposable$$1;
      return _this2;
    }

    TakeWhileSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      var p = this.p;
      this.active = p(x);

      if (this.active) {
        this.sink.event(t, x);
      } else {
        this.disposable.dispose();
        this.sink.end(t);
      }
    };

    return TakeWhileSink;
  }(Pipe$1);

  var SkipWhile$1 =
  /*#__PURE__*/
  function () {
    function SkipWhile(p, source) {
      classCallCheck$3(this, SkipWhile);
      this.p = p;
      this.source = source;
    }

    SkipWhile.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new SkipWhileSink$1(this.p, sink), scheduler$$1);
    };

    return SkipWhile;
  }();

  var SkipWhileSink$1 =
  /*#__PURE__*/
  function (_Pipe3) {
    inherits$1(SkipWhileSink, _Pipe3);

    function SkipWhileSink(p, sink) {
      classCallCheck$3(this, SkipWhileSink);

      var _this3 = possibleConstructorReturn$1(this, _Pipe3.call(this, sink));

      _this3.p = p;
      _this3.skipping = true;
      return _this3;
    }

    SkipWhileSink.prototype.event = function event(t, x) {
      if (this.skipping) {
        var p = this.p;
        this.skipping = p(x);

        if (this.skipping) {
          return;
        }
      }

      this.sink.event(t, x);
    };

    return SkipWhileSink;
  }(Pipe$1);

  var SkipAfter$1 =
  /*#__PURE__*/
  function () {
    function SkipAfter(p, source) {
      classCallCheck$3(this, SkipAfter);
      this.p = p;
      this.source = source;
    }

    SkipAfter.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new SkipAfterSink$1(this.p, sink), scheduler$$1);
    };

    return SkipAfter;
  }();

  var SkipAfterSink$1 =
  /*#__PURE__*/
  function (_Pipe4) {
    inherits$1(SkipAfterSink, _Pipe4);

    function SkipAfterSink(p, sink) {
      classCallCheck$3(this, SkipAfterSink);

      var _this4 = possibleConstructorReturn$1(this, _Pipe4.call(this, sink));

      _this4.p = p;
      _this4.skipping = false;
      return _this4;
    }

    SkipAfterSink.prototype.event = function event(t, x) {
      if (this.skipping) {
        return;
      }

      var p = this.p;
      this.skipping = p(x);
      this.sink.event(t, x);

      if (this.skipping) {
        this.sink.end(t);
      }
    };

    return SkipAfterSink;
  }(Pipe$1);

  var ZipItems$1 =
  /*#__PURE__*/
  function () {
    function ZipItems(f, items, source) {
      classCallCheck$3(this, ZipItems);
      this.f = f;
      this.items = items;
      this.source = source;
    }

    ZipItems.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new ZipItemsSink$1(this.f, this.items, sink), scheduler$$1);
    };

    return ZipItems;
  }();

  var ZipItemsSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(ZipItemsSink, _Pipe);

    function ZipItemsSink(f, items, sink) {
      classCallCheck$3(this, ZipItemsSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.items = items;
      _this.index = 0;
      return _this;
    }

    ZipItemsSink.prototype.event = function event(t, b) {
      var f = this.f;
      this.sink.event(t, f(this.items[this.index], b));
      this.index += 1;
    };

    return ZipItemsSink;
  }(Pipe$1);

  var RunEffectsSink$1 =
  /*#__PURE__*/
  function () {
    function RunEffectsSink(end, error, disposable$$1) {
      classCallCheck$3(this, RunEffectsSink);
      this._end = end;
      this._error = error;
      this._disposable = disposable$$1;
      this.active = true;
    }

    RunEffectsSink.prototype.event = function event(t, x) {};

    RunEffectsSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }

      this._dispose(this._error, this._end, undefined);
    };

    RunEffectsSink.prototype.error = function error(t, e) {
      this._dispose(this._error, this._error, e);
    };

    RunEffectsSink.prototype._dispose = function _dispose(error, end, x) {
      this.active = false;
      tryDispose$1$1(error, end, x, this._disposable);
    };

    return RunEffectsSink;
  }();

  function tryDispose$1$1(error, end, x, disposable$$1) {
    try {
      disposable$$1.dispose();
    } catch (e) {
      error(e);
      return;
    }

    end(x);
  }
  /** @license MIT License (c) copyright 2010-2017 original author or authors */
  // Run a Stream, sending all its events to the
  // provided Sink.


  var run$1$1 = function run(sink, scheduler$$1, stream) {
    return stream.run(sink, scheduler$$1);
  };

  var RelativeSink$1 =
  /*#__PURE__*/
  function () {
    function RelativeSink(offset, sink) {
      classCallCheck$3(this, RelativeSink);
      this.sink = sink;
      this.offset = offset;
    }

    RelativeSink.prototype.event = function event(t, x) {
      this.sink.event(t + this.offset, x);
    };

    RelativeSink.prototype.error = function error(t, e) {
      this.sink.error(t + this.offset, e);
    };

    RelativeSink.prototype.end = function end(t) {
      this.sink.end(t + this.offset);
    };

    return RelativeSink;
  }(); // Create a stream with its own local clock
  // This transforms time from the provided scheduler's clock to a stream-local
  // clock (which starts at 0), and then *back* to the scheduler's clock before
  // propagating events to sink.  In other words, upstream sources will see local times,
  // and downstream sinks will see non-local (original) times.


  var withLocalTime$1$1 = function withLocalTime(origin, stream) {
    return new WithLocalTime$1(origin, stream);
  };

  var WithLocalTime$1 =
  /*#__PURE__*/
  function () {
    function WithLocalTime(origin, source) {
      classCallCheck$3(this, WithLocalTime);
      this.origin = origin;
      this.source = source;
    }

    WithLocalTime.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(relativeSink$1(this.origin, sink), schedulerRelativeTo(this.origin, scheduler$$1));
    };

    return WithLocalTime;
  }(); // Accumulate offsets instead of nesting RelativeSinks, which can happen
  // with higher-order stream and combinators like continueWith when they're
  // applied recursively.


  var relativeSink$1 = function relativeSink(origin, sink) {
    return sink instanceof RelativeSink$1 ? new RelativeSink$1(origin + sink.offset, sink.sink) : new RelativeSink$1(origin, sink);
  };

  var Loop$1 =
  /*#__PURE__*/
  function () {
    function Loop(stepper, seed, source) {
      classCallCheck$3(this, Loop);
      this.step = stepper;
      this.seed = seed;
      this.source = source;
    }

    Loop.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new LoopSink$1(this.step, this.seed, sink), scheduler$$1);
    };

    return Loop;
  }();

  var LoopSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(LoopSink, _Pipe);

    function LoopSink(stepper, seed, sink) {
      classCallCheck$3(this, LoopSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.step = stepper;
      _this.seed = seed;
      return _this;
    }

    LoopSink.prototype.event = function event(t, x) {
      var result = this.step(this.seed, x);
      this.seed = result.seed;
      this.sink.event(t, result.value);
    };

    return LoopSink;
  }(Pipe$1);

  var Scan$1 =
  /*#__PURE__*/
  function () {
    function Scan(f, z, source) {
      classCallCheck$3(this, Scan);
      this.source = source;
      this.f = f;
      this.value = z;
    }

    Scan.prototype.run = function run(sink, scheduler$$1) {
      var d1 = asap(propagateEventTask$1$1(this.value, sink), scheduler$$1);
      var d2 = this.source.run(new ScanSink$1(this.f, this.value, sink), scheduler$$1);
      return disposeBoth(d1, d2);
    };

    return Scan;
  }();

  var ScanSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(ScanSink, _Pipe);

    function ScanSink(f, z, sink) {
      classCallCheck$3(this, ScanSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.value = z;
      return _this;
    }

    ScanSink.prototype.event = function event(t, x) {
      var f = this.f;
      this.value = f(this.value, x);
      this.sink.event(t, this.value);
    };

    return ScanSink;
  }(Pipe$1);

  var ContinueWith$1 =
  /*#__PURE__*/
  function () {
    function ContinueWith(f, source) {
      classCallCheck$3(this, ContinueWith);
      this.f = f;
      this.source = source;
    }

    ContinueWith.prototype.run = function run(sink, scheduler$$1) {
      return new ContinueWithSink$1(this.f, this.source, sink, scheduler$$1);
    };

    return ContinueWith;
  }();

  var ContinueWithSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(ContinueWithSink, _Pipe);

    function ContinueWithSink(f, source, sink, scheduler$$1) {
      classCallCheck$3(this, ContinueWithSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.scheduler = scheduler$$1;
      _this.active = true;
      _this.disposable = disposeOnce(source.run(_this, scheduler$$1));
      return _this;
    }

    ContinueWithSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      this.sink.event(t, x);
    };

    ContinueWithSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }

      tryDispose(t, this.disposable, this.sink);

      this._startNext(t, this.sink);
    };

    ContinueWithSink.prototype._startNext = function _startNext(t, sink) {
      try {
        this.disposable = this._continue(this.f, t, sink);
      } catch (e) {
        sink.error(t, e);
      }
    };

    ContinueWithSink.prototype._continue = function _continue(f, t, sink) {
      return run$1$1(sink, this.scheduler, withLocalTime$1$1(t, f()));
    };

    ContinueWithSink.prototype.dispose = function dispose$$1() {
      this.active = false;
      return this.disposable.dispose();
    };

    return ContinueWithSink;
  }(Pipe$1);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */

  /**
   * Transform each value in the stream by applying f to each
   * @param {function(*):*} f mapping function
   * @param {Stream} stream stream to map
   * @returns {Stream} stream containing items transformed by f
   */


  var map$2$1 = function map$$1(f, stream) {
    return Map$2.create(f, stream);
  };

  var Tap$1 =
  /*#__PURE__*/
  function () {
    function Tap(f, source) {
      classCallCheck$3(this, Tap);
      this.source = source;
      this.f = f;
    }

    Tap.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new TapSink$1(this.f, sink), scheduler$$1);
    };

    return Tap;
  }();

  var TapSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(TapSink, _Pipe);

    function TapSink(f, sink) {
      classCallCheck$3(this, TapSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      return _this;
    }

    TapSink.prototype.event = function event(t, x) {
      var f = this.f;
      f(x);
      this.sink.event(t, x);
    };

    return TapSink;
  }(Pipe$1);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var IndexSink$1 =
  /*#__PURE__*/
  function (_Sink) {
    inherits$1(IndexSink, _Sink);

    function IndexSink(i, sink) {
      classCallCheck$3(this, IndexSink);

      var _this = possibleConstructorReturn$1(this, _Sink.call(this, sink));

      _this.index = i;
      _this.active = true;
      _this.value = undefined;
      return _this;
    }

    IndexSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      this.value = x;
      this.sink.event(t, this);
    };

    IndexSink.prototype.end = function end(t) {
      if (!this.active) {
        return;
      }

      this.active = false;
      this.sink.event(t, this);
    };

    return IndexSink;
  }(Pipe$1);
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  function invoke$1(f, args) {
    /* eslint complexity: [2,7] */
    switch (args.length) {
      case 0:
        return f();

      case 1:
        return f(args[0]);

      case 2:
        return f(args[0], args[1]);

      case 3:
        return f(args[0], args[1], args[2]);

      case 4:
        return f(args[0], args[1], args[2], args[3]);

      case 5:
        return f(args[0], args[1], args[2], args[3], args[4]);

      default:
        return f.apply(void 0, args);
    }
  }

  var Combine$1 =
  /*#__PURE__*/
  function () {
    function Combine(f, sources) {
      classCallCheck$3(this, Combine);
      this.f = f;
      this.sources = sources;
    }

    Combine.prototype.run = function run(sink, scheduler$$1) {
      var l = this.sources.length;
      var disposables = new Array(l);
      var sinks = new Array(l);
      var mergeSink = new CombineSink$1(disposables, sinks, sink, this.f);

      for (var indexSink, i = 0; i < l; ++i) {
        indexSink = sinks[i] = new IndexSink$1(i, mergeSink);
        disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
      }

      return disposeAll(disposables);
    };

    return Combine;
  }();

  var CombineSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(CombineSink, _Pipe);

    function CombineSink(disposables, sinks, sink, f) {
      classCallCheck$3(this, CombineSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.disposables = disposables;
      _this.sinks = sinks;
      _this.f = f;
      var l = sinks.length;
      _this.awaiting = l;
      _this.values = new Array(l);
      _this.hasValue = new Array(l).fill(false);
      _this.activeCount = sinks.length;
      return _this;
    }

    CombineSink.prototype.event = function event(t, indexedValue) {
      if (!indexedValue.active) {
        this._dispose(t, indexedValue.index);

        return;
      }

      var i = indexedValue.index;

      var awaiting = this._updateReady(i);

      this.values[i] = indexedValue.value;

      if (awaiting === 0) {
        this.sink.event(t, invoke$1(this.f, this.values));
      }
    };

    CombineSink.prototype._updateReady = function _updateReady(index) {
      if (this.awaiting > 0) {
        if (!this.hasValue[index]) {
          this.hasValue[index] = true;
          this.awaiting -= 1;
        }
      }

      return this.awaiting;
    };

    CombineSink.prototype._dispose = function _dispose(t, index) {
      tryDispose(t, this.disposables[index], this.sink);

      if (--this.activeCount === 0) {
        this.sink.end(t);
      }
    };

    return CombineSink;
  }(Pipe$1);
  /** @license MIT License (c) copyright 2010 original author or authors */

  /**
   * Doubly linked list
   * @constructor
   */


  var LinkedList$1 =
  /*#__PURE__*/
  function () {
    function LinkedList() {
      classCallCheck$3(this, LinkedList);
      this.head = null;
      this.length = 0;
    }
    /**
     * Add a node to the end of the list
     * @param {{prev:Object|null, next:Object|null, dispose:function}} x node to add
     */


    LinkedList.prototype.add = function add(x) {
      if (this.head !== null) {
        this.head.prev = x;
        x.next = this.head;
      }

      this.head = x;
      ++this.length;
    };
    /**
     * Remove the provided node from the list
     * @param {{prev:Object|null, next:Object|null, dispose:function}} x node to remove
     */


    LinkedList.prototype.remove = function remove$$1(x) {
      // eslint-disable-line  complexity
      --this.length;

      if (x === this.head) {
        this.head = this.head.next;
      }

      if (x.next !== null) {
        x.next.prev = x.prev;
        x.next = null;
      }

      if (x.prev !== null) {
        x.prev.next = x.next;
        x.prev = null;
      }
    };
    /**
     * @returns {boolean} true iff there are no nodes in the list
     */


    LinkedList.prototype.isEmpty = function isEmpty() {
      return this.length === 0;
    };
    /**
     * Dispose all nodes
     * @returns {void}
     */


    LinkedList.prototype.dispose = function dispose$$1() {
      if (this.isEmpty()) {
        return;
      }

      var head = this.head;
      this.head = null;
      this.length = 0;

      while (head !== null) {
        head.dispose();
        head = head.next;
      }
    };

    return LinkedList;
  }();

  var MergeConcurrently$1 =
  /*#__PURE__*/
  function () {
    function MergeConcurrently(f, concurrency, source) {
      classCallCheck$3(this, MergeConcurrently);
      this.f = f;
      this.concurrency = concurrency;
      this.source = source;
    }

    MergeConcurrently.prototype.run = function run(sink, scheduler$$1) {
      return new Outer$1(this.f, this.concurrency, this.source, sink, scheduler$$1);
    };

    return MergeConcurrently;
  }();

  var Outer$1 =
  /*#__PURE__*/
  function () {
    function Outer(f, concurrency, source, sink, scheduler$$1) {
      classCallCheck$3(this, Outer);
      this.f = f;
      this.concurrency = concurrency;
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.pending = [];
      this.current = new LinkedList$1();
      this.disposable = disposeOnce(source.run(this, scheduler$$1));
      this.active = true;
    }

    Outer.prototype.event = function event(t, x) {
      this._addInner(t, x);
    };

    Outer.prototype._addInner = function _addInner(t, x) {
      if (this.current.length < this.concurrency) {
        this._startInner(t, x);
      } else {
        this.pending.push(x);
      }
    };

    Outer.prototype._startInner = function _startInner(t, x) {
      try {
        this._initInner(t, x);
      } catch (e) {
        this.error(t, e);
      }
    };

    Outer.prototype._initInner = function _initInner(t, x) {
      var innerSink = new Inner$1(t, this, this.sink);
      innerSink.disposable = mapAndRun$1(this.f, t, x, innerSink, this.scheduler);
      this.current.add(innerSink);
    };

    Outer.prototype.end = function end(t) {
      this.active = false;
      tryDispose(t, this.disposable, this.sink);

      this._checkEnd(t);
    };

    Outer.prototype.error = function error(t, e) {
      this.active = false;
      this.sink.error(t, e);
    };

    Outer.prototype.dispose = function dispose$$1() {
      this.active = false;
      this.pending.length = 0;
      this.disposable.dispose();
      this.current.dispose();
    };

    Outer.prototype._endInner = function _endInner(t, inner) {
      this.current.remove(inner);
      tryDispose(t, inner, this);

      if (this.pending.length === 0) {
        this._checkEnd(t);
      } else {
        this._startInner(t, this.pending.shift());
      }
    };

    Outer.prototype._checkEnd = function _checkEnd(t) {
      if (!this.active && this.current.isEmpty()) {
        this.sink.end(t);
      }
    };

    return Outer;
  }();

  var mapAndRun$1 = function mapAndRun(f, t, x, sink, scheduler$$1) {
    return f(x).run(sink, schedulerRelativeTo(t, scheduler$$1));
  };

  var Inner$1 =
  /*#__PURE__*/
  function () {
    function Inner(time, outer, sink) {
      classCallCheck$3(this, Inner);
      this.prev = this.next = null;
      this.time = time;
      this.outer = outer;
      this.sink = sink;
      this.disposable = void 0;
    }

    Inner.prototype.event = function event(t, x) {
      this.sink.event(t + this.time, x);
    };

    Inner.prototype.end = function end(t) {
      this.outer._endInner(t + this.time, this);
    };

    Inner.prototype.error = function error(t, e) {
      this.outer.error(t + this.time, e);
    };

    Inner.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return Inner;
  }();

  var Merge$1 =
  /*#__PURE__*/
  function () {
    function Merge(sources) {
      classCallCheck$3(this, Merge);
      this.sources = sources;
    }

    Merge.prototype.run = function run(sink, scheduler$$1) {
      var l = this.sources.length;
      var disposables = new Array(l);
      var sinks = new Array(l);
      var mergeSink = new MergeSink$1(disposables, sinks, sink);

      for (var indexSink, i = 0; i < l; ++i) {
        indexSink = sinks[i] = new IndexSink$1(i, mergeSink);
        disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
      }

      return disposeAll(disposables);
    };

    return Merge;
  }();

  var MergeSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(MergeSink, _Pipe);

    function MergeSink(disposables, sinks, sink) {
      classCallCheck$3(this, MergeSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.disposables = disposables;
      _this.activeCount = sinks.length;
      return _this;
    }

    MergeSink.prototype.event = function event(t, indexValue) {
      if (!indexValue.active) {
        this._dispose(t, indexValue.index);

        return;
      }

      this.sink.event(t, indexValue.value);
    };

    MergeSink.prototype._dispose = function _dispose(t, index) {
      tryDispose(t, this.disposables[index], this.sink);

      if (--this.activeCount === 0) {
        this.sink.end(t);
      }
    };

    return MergeSink;
  }(Pipe$1);

  var Snapshot$1 =
  /*#__PURE__*/
  function () {
    function Snapshot(f, values, sampler) {
      classCallCheck$3(this, Snapshot);
      this.f = f;
      this.values = values;
      this.sampler = sampler;
    }

    Snapshot.prototype.run = function run(sink, scheduler$$1) {
      var sampleSink = new SnapshotSink$1(this.f, sink);
      var valuesDisposable = this.values.run(sampleSink.latest, scheduler$$1);
      var samplerDisposable = this.sampler.run(sampleSink, scheduler$$1);
      return disposeBoth(samplerDisposable, valuesDisposable);
    };

    return Snapshot;
  }();

  var SnapshotSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(SnapshotSink, _Pipe);

    function SnapshotSink(f, sink) {
      classCallCheck$3(this, SnapshotSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.latest = new LatestValueSink$1(_this);
      return _this;
    }

    SnapshotSink.prototype.event = function event(t, x) {
      if (this.latest.hasValue) {
        var f = this.f;
        this.sink.event(t, f(this.latest.value, x));
      }
    };

    return SnapshotSink;
  }(Pipe$1);

  var LatestValueSink$1 =
  /*#__PURE__*/
  function (_Pipe2) {
    inherits$1(LatestValueSink, _Pipe2);

    function LatestValueSink(sink) {
      classCallCheck$3(this, LatestValueSink);

      var _this2 = possibleConstructorReturn$1(this, _Pipe2.call(this, sink));

      _this2.hasValue = false;
      return _this2;
    }

    LatestValueSink.prototype.event = function event(t, x) {
      this.value = x;
      this.hasValue = true;
    };

    LatestValueSink.prototype.end = function end() {};

    return LatestValueSink;
  }(Pipe$1); // Copied and modified from https://github.com/invertase/denque
  // MIT License
  // These constants were extracted directly from denque's shift()
  // It's not clear exactly why the authors chose these particular
  // values, but given denque's stated goals, it seems likely that
  // they were chosen for speed/memory reasons.
  // Max value of _head at which Queue is willing to shink
  // its internal array


  var HEAD_MAX_SHRINK$1 = 2; // Min value of _tail at which Queue is willing to shink
  // its internal array

  var TAIL_MIN_SHRINK$1 = 10000;

  var Queue$1 =
  /*#__PURE__*/
  function () {
    function Queue() {
      classCallCheck$3(this, Queue);
      this._head = 0;
      this._tail = 0;
      this._capacityMask = 0x3;
      this._list = new Array(4);
    }

    Queue.prototype.push = function push(x) {
      var tail$$1 = this._tail;
      this._list[tail$$1] = x;
      this._tail = tail$$1 + 1 & this._capacityMask;

      if (this._tail === this._head) {
        this._growArray();
      }

      if (this._head < this._tail) {
        return this._tail - this._head;
      } else {
        return this._capacityMask + 1 - (this._head - this._tail);
      }
    };

    Queue.prototype.shift = function shift() {
      var head = this._head;

      if (head === this._tail) {
        return undefined;
      }

      var x = this._list[head];
      this._list[head] = undefined;
      this._head = head + 1 & this._capacityMask;

      if (head < HEAD_MAX_SHRINK$1 && this._tail > TAIL_MIN_SHRINK$1 && this._tail <= this._list.length >>> 2) {
        this._shrinkArray();
      }

      return x;
    };

    Queue.prototype.isEmpty = function isEmpty() {
      return this._head === this._tail;
    };

    Queue.prototype.length = function length() {
      if (this._head === this._tail) {
        return 0;
      } else if (this._head < this._tail) {
        return this._tail - this._head;
      } else {
        return this._capacityMask + 1 - (this._head - this._tail);
      }
    };

    Queue.prototype._growArray = function _growArray() {
      if (this._head) {
        // copy existing data, head to end, then beginning to tail.
        this._list = this._copyArray();
        this._head = 0;
      } // head is at 0 and array is now full, safe to extend


      this._tail = this._list.length;
      this._list.length *= 2;
      this._capacityMask = this._capacityMask << 1 | 1;
    };

    Queue.prototype._shrinkArray = function _shrinkArray() {
      this._list.length >>>= 1;
      this._capacityMask >>>= 1;
    };

    Queue.prototype._copyArray = function _copyArray() {
      var newArray = [];
      var list = this._list;
      var len = list.length;
      var i = void 0;

      for (i = this._head; i < len; i++) {
        newArray.push(list[i]);
      }

      for (i = 0; i < this._tail; i++) {
        newArray.push(list[i]);
      }

      return newArray;
    };

    return Queue;
  }();

  var Zip$1 =
  /*#__PURE__*/
  function () {
    function Zip(f, sources) {
      classCallCheck$3(this, Zip);
      this.f = f;
      this.sources = sources;
    }

    Zip.prototype.run = function run(sink, scheduler$$1) {
      var l = this.sources.length;
      var disposables = new Array(l);
      var sinks = new Array(l);
      var buffers = new Array(l);
      var zipSink = new ZipSink$1(this.f, buffers, sinks, sink);

      for (var indexSink, i = 0; i < l; ++i) {
        buffers[i] = new Queue$1();
        indexSink = sinks[i] = new IndexSink$1(i, zipSink);
        disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
      }

      return disposeAll(disposables);
    };

    return Zip;
  }();

  var ZipSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(ZipSink, _Pipe);

    function ZipSink(f, buffers, sinks, sink) {
      classCallCheck$3(this, ZipSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.f = f;
      _this.sinks = sinks;
      _this.buffers = buffers;
      return _this;
    }

    ZipSink.prototype.event = function event(t, indexedValue) {
      /* eslint complexity: [1, 5] */
      if (!indexedValue.active) {
        this._dispose(t, indexedValue.index);

        return;
      }

      var buffers = this.buffers;
      var buffer = buffers[indexedValue.index];
      buffer.push(indexedValue.value);

      if (buffer.length() === 1) {
        if (!ready$1(this.buffers)) {
          return;
        }

        emitZipped$1(this.f, t, buffers, this.sink);

        if (ended$1(this.buffers, this.sinks)) {
          this.sink.end(t);
        }
      }
    };

    ZipSink.prototype._dispose = function _dispose(t, index) {
      var buffer = this.buffers[index];

      if (buffer.isEmpty()) {
        this.sink.end(t);
      }
    };

    return ZipSink;
  }(Pipe$1);

  var emitZipped$1 = function emitZipped(f, t, buffers, sink) {
    return sink.event(t, invoke$1(f, map(head$1, buffers)));
  };

  var head$1 = function head(buffer) {
    return buffer.shift();
  };

  function ended$1(buffers, sinks) {
    for (var i = 0, l = buffers.length; i < l; ++i) {
      if (buffers[i].isEmpty() && !sinks[i].active) {
        return true;
      }
    }

    return false;
  }

  function ready$1(buffers) {
    for (var i = 0, l = buffers.length; i < l; ++i) {
      if (buffers[i].isEmpty()) {
        return false;
      }
    }

    return true;
  }

  var Switch$1 =
  /*#__PURE__*/
  function () {
    function Switch(source) {
      classCallCheck$3(this, Switch);
      this.source = source;
    }

    Switch.prototype.run = function run(sink, scheduler$$1) {
      var switchSink = new SwitchSink$1(sink, scheduler$$1);
      return disposeBoth(switchSink, this.source.run(switchSink, scheduler$$1));
    };

    return Switch;
  }();

  var SwitchSink$1 =
  /*#__PURE__*/
  function () {
    function SwitchSink(sink, scheduler$$1) {
      classCallCheck$3(this, SwitchSink);
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.current = null;
      this.ended = false;
    }

    SwitchSink.prototype.event = function event(t, stream) {
      this._disposeCurrent(t);

      this.current = new Segment$1(stream, t, Infinity, this, this.sink, this.scheduler);
    };

    SwitchSink.prototype.end = function end(t) {
      this.ended = true;

      this._checkEnd(t);
    };

    SwitchSink.prototype.error = function error(t, e) {
      this.ended = true;
      this.sink.error(t, e);
    };

    SwitchSink.prototype.dispose = function dispose$$1() {
      return this._disposeCurrent(currentTime(this.scheduler));
    };

    SwitchSink.prototype._disposeCurrent = function _disposeCurrent(t) {
      if (this.current !== null) {
        return this.current._dispose(t);
      }
    };

    SwitchSink.prototype._disposeInner = function _disposeInner(t, inner) {
      inner._dispose(t);

      if (inner === this.current) {
        this.current = null;
      }
    };

    SwitchSink.prototype._checkEnd = function _checkEnd(t) {
      if (this.ended && this.current === null) {
        this.sink.end(t);
      }
    };

    SwitchSink.prototype._endInner = function _endInner(t, inner) {
      this._disposeInner(t, inner);

      this._checkEnd(t);
    };

    SwitchSink.prototype._errorInner = function _errorInner(t, e, inner) {
      this._disposeInner(t, inner);

      this.sink.error(t, e);
    };

    return SwitchSink;
  }();

  var Segment$1 =
  /*#__PURE__*/
  function () {
    function Segment(source, min, max, outer, sink, scheduler$$1) {
      classCallCheck$3(this, Segment);
      this.min = min;
      this.max = max;
      this.outer = outer;
      this.sink = sink;
      this.disposable = source.run(this, schedulerRelativeTo(min, scheduler$$1));
    }

    Segment.prototype.event = function event(t, x) {
      var time = Math.max(0, t + this.min);

      if (time < this.max) {
        this.sink.event(time, x);
      }
    };

    Segment.prototype.end = function end(t) {
      this.outer._endInner(t + this.min, this);
    };

    Segment.prototype.error = function error(t, e) {
      this.outer._errorInner(t + this.min, e, this);
    };

    Segment.prototype._dispose = function _dispose(t) {
      tryDispose(t + this.min, this.disposable, this.sink);
    };

    return Segment;
  }();

  var SkipRepeats$1 =
  /*#__PURE__*/
  function () {
    function SkipRepeats(equals, source) {
      classCallCheck$3(this, SkipRepeats);
      this.equals = equals;
      this.source = source;
    }

    SkipRepeats.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new SkipRepeatsSink$1(this.equals, sink), scheduler$$1);
    };

    return SkipRepeats;
  }();

  var SkipRepeatsSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(SkipRepeatsSink, _Pipe);

    function SkipRepeatsSink(equals, sink) {
      classCallCheck$3(this, SkipRepeatsSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.equals = equals;
      _this.value = void 0;
      _this.init = true;
      return _this;
    }

    SkipRepeatsSink.prototype.event = function event(t, x) {
      if (this.init) {
        this.init = false;
        this.value = x;
        this.sink.event(t, x);
      } else if (!this.equals(this.value, x)) {
        this.value = x;
        this.sink.event(t, x);
      }
    };

    return SkipRepeatsSink;
  }(Pipe$1);

  var Until$1 =
  /*#__PURE__*/
  function () {
    function Until(maxSignal, source) {
      classCallCheck$3(this, Until);
      this.maxSignal = maxSignal;
      this.source = source;
    }

    Until.prototype.run = function run(sink, scheduler$$1) {
      var min = new Bound$1(-Infinity, sink);
      var max = new UpperBound$1(this.maxSignal, sink, scheduler$$1);
      var disposable$$1 = this.source.run(new TimeWindowSink$1(min, max, sink), scheduler$$1);
      return disposeAll([min, max, disposable$$1]);
    };

    return Until;
  }();

  var Since$1 =
  /*#__PURE__*/
  function () {
    function Since(minSignal, source) {
      classCallCheck$3(this, Since);
      this.minSignal = minSignal;
      this.source = source;
    }

    Since.prototype.run = function run(sink, scheduler$$1) {
      var min = new LowerBound$1(this.minSignal, sink, scheduler$$1);
      var max = new Bound$1(Infinity, sink);
      var disposable$$1 = this.source.run(new TimeWindowSink$1(min, max, sink), scheduler$$1);
      return disposeAll([min, max, disposable$$1]);
    };

    return Since;
  }();

  var Bound$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(Bound, _Pipe);

    function Bound(value, sink) {
      classCallCheck$3(this, Bound);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.value = value;
      return _this;
    }

    Bound.prototype.event = function event() {};

    Bound.prototype.end = function end() {};

    Bound.prototype.dispose = function dispose$$1() {};

    return Bound;
  }(Pipe$1);

  var TimeWindowSink$1 =
  /*#__PURE__*/
  function (_Pipe2) {
    inherits$1(TimeWindowSink, _Pipe2);

    function TimeWindowSink(min, max, sink) {
      classCallCheck$3(this, TimeWindowSink);

      var _this2 = possibleConstructorReturn$1(this, _Pipe2.call(this, sink));

      _this2.min = min;
      _this2.max = max;
      return _this2;
    }

    TimeWindowSink.prototype.event = function event(t, x) {
      if (t >= this.min.value && t < this.max.value) {
        this.sink.event(t, x);
      }
    };

    return TimeWindowSink;
  }(Pipe$1);

  var LowerBound$1 =
  /*#__PURE__*/
  function (_Pipe3) {
    inherits$1(LowerBound, _Pipe3);

    function LowerBound(signal, sink, scheduler$$1) {
      classCallCheck$3(this, LowerBound);

      var _this3 = possibleConstructorReturn$1(this, _Pipe3.call(this, sink));

      _this3.value = Infinity;
      _this3.disposable = signal.run(_this3, scheduler$$1);
      return _this3;
    }

    LowerBound.prototype.event = function event(t
    /*, x */
    ) {
      if (t < this.value) {
        this.value = t;
      }
    };

    LowerBound.prototype.end = function end() {};

    LowerBound.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return LowerBound;
  }(Pipe$1);

  var UpperBound$1 =
  /*#__PURE__*/
  function (_Pipe4) {
    inherits$1(UpperBound, _Pipe4);

    function UpperBound(signal, sink, scheduler$$1) {
      classCallCheck$3(this, UpperBound);

      var _this4 = possibleConstructorReturn$1(this, _Pipe4.call(this, sink));

      _this4.value = Infinity;
      _this4.disposable = signal.run(_this4, scheduler$$1);
      return _this4;
    }

    UpperBound.prototype.event = function event(t, x) {
      if (t < this.value) {
        this.value = t;
        this.sink.end(t);
      }
    };

    UpperBound.prototype.end = function end() {};

    UpperBound.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return UpperBound;
  }(Pipe$1);

  var Delay$1 =
  /*#__PURE__*/
  function () {
    function Delay(dt, source) {
      classCallCheck$3(this, Delay);
      this.dt = dt;
      this.source = source;
    }

    Delay.prototype.run = function run(sink, scheduler$$1) {
      var delaySink = new DelaySink$1(this.dt, sink, scheduler$$1);
      return disposeBoth(delaySink, this.source.run(delaySink, scheduler$$1));
    };

    return Delay;
  }();

  var DelaySink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(DelaySink, _Pipe);

    function DelaySink(dt, sink, scheduler$$1) {
      classCallCheck$3(this, DelaySink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.dt = dt;
      _this.scheduler = scheduler$$1;
      return _this;
    }

    DelaySink.prototype.dispose = function dispose$$1() {
      var _this2 = this;

      cancelAllTasks(function (_ref) {
        var task = _ref.task;
        return task.sink === _this2.sink;
      }, this.scheduler);
    };

    DelaySink.prototype.event = function event(t, x) {
      delay(this.dt, propagateEventTask$1$1(x, this.sink), this.scheduler);
    };

    DelaySink.prototype.end = function end(t) {
      delay(this.dt, propagateEndTask$1(this.sink), this.scheduler);
    };

    return DelaySink;
  }(Pipe$1);

  var Throttle$1 =
  /*#__PURE__*/
  function () {
    function Throttle(period, source) {
      classCallCheck$3(this, Throttle);
      this.period = period;
      this.source = source;
    }

    Throttle.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new ThrottleSink$1(this.period, sink), scheduler$$1);
    };

    return Throttle;
  }();

  var ThrottleSink$1 =
  /*#__PURE__*/
  function (_Pipe) {
    inherits$1(ThrottleSink, _Pipe);

    function ThrottleSink(period, sink) {
      classCallCheck$3(this, ThrottleSink);

      var _this = possibleConstructorReturn$1(this, _Pipe.call(this, sink));

      _this.time = 0;
      _this.period = period;
      return _this;
    }

    ThrottleSink.prototype.event = function event(t, x) {
      if (t >= this.time) {
        this.time = t + this.period;
        this.sink.event(t, x);
      }
    };

    return ThrottleSink;
  }(Pipe$1);

  var Debounce$1 =
  /*#__PURE__*/
  function () {
    function Debounce(dt, source) {
      classCallCheck$3(this, Debounce);
      this.dt = dt;
      this.source = source;
    }

    Debounce.prototype.run = function run(sink, scheduler$$1) {
      return new DebounceSink$1(this.dt, this.source, sink, scheduler$$1);
    };

    return Debounce;
  }();

  var DebounceSink$1 =
  /*#__PURE__*/
  function () {
    function DebounceSink(dt, source, sink, scheduler$$1) {
      classCallCheck$3(this, DebounceSink);
      this.dt = dt;
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.value = void 0;
      this.timer = null;
      this.disposable = source.run(this, scheduler$$1);
    }

    DebounceSink.prototype.event = function event(t, x) {
      this._clearTimer();

      this.value = x;
      this.timer = delay(this.dt, new DebounceTask$1(this, x), this.scheduler);
    };

    DebounceSink.prototype._event = function _event(t, x) {
      this._clearTimer();

      this.sink.event(t, x);
    };

    DebounceSink.prototype.end = function end(t) {
      if (this._clearTimer()) {
        this.sink.event(t, this.value);
        this.value = undefined;
      }

      this.sink.end(t);
    };

    DebounceSink.prototype.error = function error(t, x) {
      this._clearTimer();

      this.sink.error(t, x);
    };

    DebounceSink.prototype.dispose = function dispose$$1() {
      this._clearTimer();

      this.disposable.dispose();
    };

    DebounceSink.prototype._clearTimer = function _clearTimer() {
      if (this.timer === null) {
        return false;
      }

      this.timer.dispose();
      this.timer = null;
      return true;
    };

    return DebounceSink;
  }();

  var DebounceTask$1 =
  /*#__PURE__*/
  function () {
    function DebounceTask(debounce, value) {
      classCallCheck$3(this, DebounceTask);
      this.debounce = debounce;
      this.value = value;
    }

    DebounceTask.prototype.run = function run(t) {
      this.debounce._event(t, this.value);
    };

    DebounceTask.prototype.error = function error(t, e) {
      this.debounce.error(t, e);
    };

    DebounceTask.prototype.dispose = function dispose$$1() {};

    return DebounceTask;
  }();

  var Await$1 =
  /*#__PURE__*/
  function () {
    function Await(source) {
      classCallCheck$3(this, Await);
      this.source = source;
    }

    Await.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(new AwaitSink$1(sink, scheduler$$1), scheduler$$1);
    };

    return Await;
  }();

  var AwaitSink$1 =
  /*#__PURE__*/
  function () {
    function AwaitSink(sink, scheduler$$1) {
      var _this = this;

      classCallCheck$3(this, AwaitSink);
      this.sink = sink;
      this.scheduler = scheduler$$1;
      this.queue = Promise.resolve(); // Pre-create closures, to avoid creating them per event

      this._eventBound = function (x) {
        return _this.sink.event(currentTime(_this.scheduler), x);
      };

      this._endBound = function () {
        return _this.sink.end(currentTime(_this.scheduler));
      };

      this._errorBound = function (e) {
        return _this.sink.error(currentTime(_this.scheduler), e);
      };
    }

    AwaitSink.prototype.event = function event(t, promise) {
      var _this2 = this;

      this.queue = this.queue.then(function () {
        return _this2._event(promise);
      }).catch(this._errorBound);
    };

    AwaitSink.prototype.end = function end(t) {
      this.queue = this.queue.then(this._endBound).catch(this._errorBound);
    };

    AwaitSink.prototype.error = function error(t, e) {
      var _this3 = this; // Don't resolve error values, propagate directly


      this.queue = this.queue.then(function () {
        return _this3._errorBound(e);
      }).catch(fatalError$1);
    };

    AwaitSink.prototype._event = function _event(promise) {
      return promise.then(this._eventBound);
    };

    return AwaitSink;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  var SafeSink$1 =
  /*#__PURE__*/
  function () {
    function SafeSink(sink) {
      classCallCheck$3(this, SafeSink);
      this.sink = sink;
      this.active = true;
    }

    SafeSink.prototype.event = function event(t, x) {
      if (!this.active) {
        return;
      }

      this.sink.event(t, x);
    };

    SafeSink.prototype.end = function end(t, x) {
      if (!this.active) {
        return;
      }

      this.disable();
      this.sink.end(t, x);
    };

    SafeSink.prototype.error = function error(t, e) {
      this.disable();
      this.sink.error(t, e);
    };

    SafeSink.prototype.disable = function disable() {
      this.active = false;
      return this.sink;
    };

    return SafeSink;
  }();
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  /** @author Brian Cavalier */

  /** @author John Hann */


  function tryEvent$2(t, x, sink) {
    try {
      sink.event(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  function tryEnd$1(t, sink) {
    try {
      sink.end(t);
    } catch (e) {
      sink.error(t, e);
    }
  }

  var ErrorStream$1 =
  /*#__PURE__*/
  function () {
    function ErrorStream(e) {
      classCallCheck$3(this, ErrorStream);
      this.value = e;
    }

    ErrorStream.prototype.run = function run(sink, scheduler$$1) {
      return asap(propagateErrorTask$1$1(this.value, sink), scheduler$$1);
    };

    return ErrorStream;
  }();

  var RecoverWith$1 =
  /*#__PURE__*/
  function () {
    function RecoverWith(f, source) {
      classCallCheck$3(this, RecoverWith);
      this.f = f;
      this.source = source;
    }

    RecoverWith.prototype.run = function run(sink, scheduler$$1) {
      return new RecoverWithSink$1(this.f, this.source, sink, scheduler$$1);
    };

    return RecoverWith;
  }();

  var RecoverWithSink$1 =
  /*#__PURE__*/
  function () {
    function RecoverWithSink(f, source, sink, scheduler$$1) {
      classCallCheck$3(this, RecoverWithSink);
      this.f = f;
      this.sink = new SafeSink$1(sink);
      this.scheduler = scheduler$$1;
      this.disposable = source.run(this, scheduler$$1);
    }

    RecoverWithSink.prototype.event = function event(t, x) {
      tryEvent$2(t, x, this.sink);
    };

    RecoverWithSink.prototype.end = function end(t) {
      tryEnd$1(t, this.sink);
    };

    RecoverWithSink.prototype.error = function error(t, e) {
      var nextSink = this.sink.disable();
      tryDispose(t, this.disposable, this.sink);

      this._startNext(t, e, nextSink);
    };

    RecoverWithSink.prototype._startNext = function _startNext(t, x, sink) {
      try {
        this.disposable = this._continue(this.f, t, x, sink);
      } catch (e) {
        sink.error(t, e);
      }
    };

    RecoverWithSink.prototype._continue = function _continue(f, t, x, sink) {
      return run$1$1(sink, this.scheduler, withLocalTime$1$1(t, f(x)));
    };

    RecoverWithSink.prototype.dispose = function dispose$$1() {
      return this.disposable.dispose();
    };

    return RecoverWithSink;
  }();

  var Multicast$1 =
  /*#__PURE__*/
  function () {
    function Multicast(source) {
      classCallCheck$3(this, Multicast);
      this.source = new MulticastSource$1(source);
    }

    Multicast.prototype.run = function run(sink, scheduler$$1) {
      return this.source.run(sink, scheduler$$1);
    };

    return Multicast;
  }();

  var MulticastSource$1 =
  /*#__PURE__*/
  function () {
    function MulticastSource(source) {
      classCallCheck$3(this, MulticastSource);
      this.source = source;
      this.sinks = [];
      this.disposable = disposeNone();
    }

    MulticastSource.prototype.run = function run(sink, scheduler$$1) {
      var n = this.add(sink);

      if (n === 1) {
        this.disposable = this.source.run(this, scheduler$$1);
      }

      return disposeOnce(new MulticastDisposable$1(this, sink));
    };

    MulticastSource.prototype.dispose = function dispose$$1() {
      var disposable$$1 = this.disposable;
      this.disposable = disposeNone();
      return disposable$$1.dispose();
    };

    MulticastSource.prototype.add = function add(sink) {
      this.sinks = append(sink, this.sinks);
      return this.sinks.length;
    };

    MulticastSource.prototype.remove = function remove$$1(sink) {
      var i = findIndex(sink, this.sinks); // istanbul ignore next

      if (i >= 0) {
        this.sinks = remove(i, this.sinks);
      }

      return this.sinks.length;
    };

    MulticastSource.prototype.event = function event(time, value) {
      var s = this.sinks;

      if (s.length === 1) {
        return s[0].event(time, value);
      }

      for (var i = 0; i < s.length; ++i) {
        tryEvent$2(time, value, s[i]);
      }
    };

    MulticastSource.prototype.end = function end(time) {
      var s = this.sinks;

      for (var i = 0; i < s.length; ++i) {
        tryEnd$1(time, s[i]);
      }
    };

    MulticastSource.prototype.error = function error(time, err) {
      var s = this.sinks;

      for (var i = 0; i < s.length; ++i) {
        s[i].error(time, err);
      }
    };

    return MulticastSource;
  }();

  var MulticastDisposable$1 =
  /*#__PURE__*/
  function () {
    function MulticastDisposable(source, sink) {
      classCallCheck$3(this, MulticastDisposable);
      this.source = source;
      this.sink = sink;
    }

    MulticastDisposable.prototype.dispose = function dispose$$1() {
      if (this.source.remove(this.sink) === 0) {
        this.source.dispose();
      }
    };

    return MulticastDisposable;
  }();
  // Transforming

  var map$1$1 =
  /*#__PURE__*/
  curry2(map$2$1);

  function curry2$1(f) {
    function curried(a, b) {
      switch (arguments.length) {
        case 0:
          return curried;

        case 1:
          return function (b) {
            return f(a, b);
          };

        default:
          return f(a, b);
      }
    }

    return curried;
  } // curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)


  function curry3$1(f) {
    function curried(a, b, c) {
      // eslint-disable-line complexity
      switch (arguments.length) {
        case 0:
          return curried;

        case 1:
          return curry2$1(function (b, c) {
            return f(a, b, c);
          });

        case 2:
          return function (c) {
            return f(a, b, c);
          };

        default:
          return f(a, b, c);
      }
    }

    return curried;
  }

  var Right = function Right(value) {
    return {
      right: true,
      value: value
    };
  };

  var Left = function Left(value) {
    return {
      right: false,
      value: value
    };
  };

  var classify = function classify(p, a) {
    return p(a) ? Right(a) : Left(a);
  };

  var bimapEither = function bimapEither(f, g, e) {
    return e.right ? Right(g(e.value)) : Left(f(e.value));
  };
  var partition = curry2$1(function (p, sa) {
    return map$1$1(function (a) {
      return classify(p, a);
    }, sa);
  });

  var unpartition = function unpartition(saa) {
    return map$1$1(function (aa) {
      return aa.value;
    }, saa);
  };

  var _mapEither = function _mapEither(f, g, s) {
    return map$1$1(function (eab) {
      return bimapEither(f, g, eab);
    }, s);
  };

  var mapEither = curry3$1(function (f, g, s) {
    return _mapEither(f, g, s);
  });

  /*
   * Copyright 2012-2016 the original author or authors
   * @license MIT, see LICENSE.txt for details
   *
   * @author Scott Andrews
   */

  var empty$2 = {};
  /**
   * Mix the properties from the source object into the destination object.
   * When the same property occurs in more then one object, the right most
   * value wins.
   *
   * @param {Object} dest the object to copy properties to
   * @param {Object} sources the objects to copy properties from.  May be 1 to N arguments, but not an Array.
   * @return {Object} the destination object
   */

  function mixin(dest
  /*, sources... */
  ) {
    var i, l, source, name;

    if (!dest) {
      dest = {};
    }

    for (i = 1, l = arguments.length; i < l; i += 1) {
      source = arguments[i];

      for (name in source) {
        if (!(name in dest) || dest[name] !== source[name] && (!(name in empty$2) || empty$2[name] !== source[name])) {
          dest[name] = source[name];
        }
      }
    }

    return dest; // Object
  }

  var mixin_1 = mixin;

  /*
   * Copyright 2012-2016 the original author or authors
   * @license MIT, see LICENSE.txt for details
   *
   * @author Scott Andrews
   */

  var encodedSpaceRE, urlEncodedSpaceRE;
  encodedSpaceRE = /%20/g;
  urlEncodedSpaceRE = /\+/g;

  function urlEncode(str) {
    str = encodeURIComponent(str); // spec says space should be encoded as '+'

    return str.replace(encodedSpaceRE, '+');
  }

  function urlDecode(str) {
    // spec says space should be encoded as '+'
    str = str.replace(urlEncodedSpaceRE, ' ');
    return decodeURIComponent(str);
  }

  function append$1(str, name, value) {
    if (Array.isArray(value)) {
      value.forEach(function (value) {
        str = append$1(str, name, value);
      });
    } else {
      if (str.length > 0) {
        str += '&';
      }

      str += urlEncode(name);

      if (value !== undefined && value !== null) {
        str += '=' + urlEncode(value);
      }
    }

    return str;
  }

  var xWwwFormUrlencoded = {
    read: function read(str) {
      var obj = {};
      str.split('&').forEach(function (entry) {
        var pair, name, value;
        pair = entry.split('=');
        name = urlDecode(pair[0]);

        if (pair.length === 2) {
          value = urlDecode(pair[1]);
        } else {
          value = null;
        }

        if (name in obj) {
          if (!Array.isArray(obj[name])) {
            // convert to an array, perserving currnent value
            obj[name] = [obj[name]];
          }

          obj[name].push(value);
        } else {
          obj[name] = value;
        }
      });
      return obj;
    },
    write: function write(obj) {
      var str = '';
      Object.keys(obj).forEach(function (name) {
        str = append$1(str, name, obj[name]);
      });
      return str;
    }
  };

  var mixin$1, xWWWFormURLEncoder, origin, urlRE, absoluteUrlRE, fullyQualifiedUrlRE;
  mixin$1 = mixin_1;
  xWWWFormURLEncoder = xWwwFormUrlencoded;
  urlRE = /([a-z][a-z0-9\+\-\.]*:)\/\/([^@]+@)?(([^:\/]+)(:([0-9]+))?)?(\/[^?#]*)?(\?[^#]*)?(#\S*)?/i;
  absoluteUrlRE = /^([a-z][a-z0-9\-\+\.]*:\/\/|\/)/i;
  fullyQualifiedUrlRE = /([a-z][a-z0-9\+\-\.]*:)\/\/([^@]+@)?(([^:\/]+)(:([0-9]+))?)?\//i;
  /**
   * Apply params to the template to create a URL.
   *
   * Parameters that are not applied directly to the template, are appended
   * to the URL as query string parameters.
   *
   * @param {string} template the URI template
   * @param {Object} params parameters to apply to the template
   * @return {string} the resulting URL
   */

  function buildUrl(template, params) {
    // internal builder to convert template with params.
    var url, name, queryStringParams, queryString, re;
    url = template;
    queryStringParams = {};

    if (params) {
      for (name in params) {
        /*jshint forin:false */
        re = new RegExp('\\{' + name + '\\}');

        if (re.test(url)) {
          url = url.replace(re, encodeURIComponent(params[name]), 'g');
        } else {
          queryStringParams[name] = params[name];
        }
      }

      queryString = xWWWFormURLEncoder.write(queryStringParams);

      if (queryString) {
        url += url.indexOf('?') === -1 ? '?' : '&';
        url += queryString;
      }
    }

    return url;
  }

  function startsWith(str, test) {
    return str.indexOf(test) === 0;
  }
  /**
   * Create a new URL Builder
   *
   * @param {string|UrlBuilder} template the base template to build from, may be another UrlBuilder
   * @param {Object} [params] base parameters
   * @constructor
   */


  function UrlBuilder(template, params) {
    if (!(this instanceof UrlBuilder)) {
      // invoke as a constructor
      return new UrlBuilder(template, params);
    }

    if (template instanceof UrlBuilder) {
      this._template = template.template;
      this._params = mixin$1({}, this._params, params);
    } else {
      this._template = (template || '').toString();
      this._params = params || {};
    }
  }

  UrlBuilder.prototype = {
    /**
     * Create a new UrlBuilder instance that extends the current builder.
     * The current builder is unmodified.
     *
     * @param {string} [template] URL template to append to the current template
     * @param {Object} [params] params to combine with current params.  New params override existing params
     * @return {UrlBuilder} the new builder
     */
    append: function append(template, params) {
      // TODO consider query strings and fragments
      return new UrlBuilder(this._template + template, mixin$1({}, this._params, params));
    },

    /**
     * Create a new UrlBuilder with a fully qualified URL based on the
     * window's location or base href and the current templates relative URL.
     *
     * Path variables are preserved.
     *
     * *Browser only*
     *
     * @return {UrlBuilder} the fully qualified URL template
     */
    fullyQualify: function fullyQualify() {
      if (typeof location === 'undefined') {
        return this;
      }

      if (this.isFullyQualified()) {
        return this;
      }

      var template = this._template;

      if (startsWith(template, '//')) {
        template = origin.protocol + template;
      } else if (startsWith(template, '/')) {
        template = origin.origin + template;
      } else if (!this.isAbsolute()) {
        template = origin.origin + origin.pathname.substring(0, origin.pathname.lastIndexOf('/') + 1);
      }

      if (template.indexOf('/', 8) === -1) {
        // default the pathname to '/'
        template = template + '/';
      }

      return new UrlBuilder(template, this._params);
    },

    /**
     * True if the URL is absolute
     *
     * @return {boolean}
     */
    isAbsolute: function isAbsolute() {
      return absoluteUrlRE.test(this.build());
    },

    /**
     * True if the URL is fully qualified
     *
     * @return {boolean}
     */
    isFullyQualified: function isFullyQualified() {
      return fullyQualifiedUrlRE.test(this.build());
    },

    /**
     * True if the URL is cross origin. The protocol, host and port must not be
     * the same in order to be cross origin,
     *
     * @return {boolean}
     */
    isCrossOrigin: function isCrossOrigin() {
      if (!origin) {
        return true;
      }

      var url = this.parts();
      return url.protocol !== origin.protocol || url.hostname !== origin.hostname || url.port !== origin.port;
    },

    /**
     * Split a URL into its consituent parts following the naming convention of
     * 'window.location'. One difference is that the port will contain the
     * protocol default if not specified.
     *
     * @see https://developer.mozilla.org/en-US/docs/DOM/window.location
     *
     * @returns {Object} a 'window.location'-like object
     */
    parts: function parts() {
      /*jshint maxcomplexity:20 */
      var url, parts;
      url = this.fullyQualify().build().match(urlRE);
      parts = {
        href: url[0],
        protocol: url[1],
        host: url[3] || '',
        hostname: url[4] || '',
        port: url[6],
        pathname: url[7] || '',
        search: url[8] || '',
        hash: url[9] || ''
      };
      parts.origin = parts.protocol + '//' + parts.host;
      parts.port = parts.port || (parts.protocol === 'https:' ? '443' : parts.protocol === 'http:' ? '80' : '');
      return parts;
    },

    /**
     * Expand the template replacing path variables with parameters
     *
     * @param {Object} [params] params to combine with current params.  New params override existing params
     * @return {string} the expanded URL
     */
    build: function build(params) {
      return buildUrl(this._template, mixin$1({}, this._params, params));
    },

    /**
     * @see build
     */
    toString: function toString() {
      return this.build();
    }
  };
  origin = typeof location !== 'undefined' ? new UrlBuilder(location.href).parts() : void 0;
  var UrlBuilder_1 = UrlBuilder;

  /*
   * Copyright 2012-2016 the original author or authors
   * @license MIT, see LICENSE.txt for details
   *
   * @author Scott Andrews
   */
  /**
   * Normalize HTTP header names using the pseudo camel case.
   *
   * For example:
   *   content-type         -> Content-Type
   *   accepts              -> Accepts
   *   x-custom-header-name -> X-Custom-Header-Name
   *
   * @param {string} name the raw header name
   * @return {string} the normalized header name
   */

  function normalizeHeaderName(name) {
    return name.toLowerCase().split('-').map(function (chunk) {
      return chunk.charAt(0).toUpperCase() + chunk.slice(1);
    }).join('-');
  }

  var normalizeHeaderName_1 = normalizeHeaderName;

  /*jshint latedef: nofunc */



  function property(promise, name) {
    return promise.then(function (value) {
      return value && value[name];
    }, function (value) {
      return Promise.reject(value && value[name]);
    });
  }
  /**
   * Obtain the response entity
   *
   * @returns {Promise} for the response entity
   */


  function entity() {
    /*jshint validthis:true */
    return property(this, 'entity');
  }
  /**
   * Obtain the response status
   *
   * @returns {Promise} for the response status
   */


  function status() {
    /*jshint validthis:true */
    return property(property(this, 'status'), 'code');
  }
  /**
   * Obtain the response headers map
   *
   * @returns {Promise} for the response headers map
   */


  function headers() {
    /*jshint validthis:true */
    return property(this, 'headers');
  }
  /**
   * Obtain a specific response header
   *
   * @param {String} headerName the header to retrieve
   * @returns {Promise} for the response header's value
   */


  function header(headerName) {
    /*jshint validthis:true */
    headerName = normalizeHeaderName_1(headerName);
    return property(this.headers(), headerName);
  }
  /**
   * Follow a related resource
   *
   * The relationship to follow may be define as a plain string, an object
   * with the rel and params, or an array containing one or more entries
   * with the previous forms.
   *
   * Examples:
   *   response.follow('next')
   *
   *   response.follow({ rel: 'next', params: { pageSize: 100 } })
   *
   *   response.follow([
   *       { rel: 'items', params: { projection: 'noImages' } },
   *       'search',
   *       { rel: 'findByGalleryIsNull', params: { projection: 'noImages' } },
   *       'items'
   *   ])
   *
   * @param {String|Object|Array} rels one, or more, relationships to follow
   * @returns ResponsePromise<Response> related resource
   */


  function follow(rels) {
    /*jshint validthis:true */
    rels = [].concat(rels);
    return make(rels.reduce(function (response, rel) {
      return response.then(function (response) {
        if (typeof rel === 'string') {
          rel = {
            rel: rel
          };
        }

        if (typeof response.entity.clientFor !== 'function') {
          throw new Error('Hypermedia response expected');
        }

        var client = response.entity.clientFor(rel.rel);
        return client({
          params: rel.params
        });
      });
    }, this));
  }
  /**
   * Wrap a Promise as an ResponsePromise
   *
   * @param {Promise<Response>} promise the promise for an HTTP Response
   * @returns {ResponsePromise<Response>} wrapped promise for Response with additional helper methods
   */


  function make(promise) {
    promise.status = status;
    promise.headers = headers;
    promise.header = header;
    promise.entity = entity;
    promise.follow = follow;
    return promise;
  }

  function responsePromise(obj, callback, errback) {
    return make(Promise.resolve(obj).then(callback, errback));
  }

  responsePromise.make = make;

  responsePromise.reject = function (val) {
    return make(Promise.reject(val));
  };

  responsePromise.promise = function (func) {
    return make(new Promise(func));
  };

  var responsePromise_1 = responsePromise;

  /*
   * Copyright 2014-2016 the original author or authors
   * @license MIT, see LICENSE.txt for details
   *
   * @author Scott Andrews
   */
  /**
   * Add common helper methods to a client impl
   *
   * @param {function} impl the client implementation
   * @param {Client} [target] target of this client, used when wrapping other clients
   * @returns {Client} the client impl with additional methods
   */

  var client = function client(impl, target) {
    if (target) {
      /**
       * @returns {Client} the target client
       */
      impl.skip = function skip() {
        return target;
      };
    }
    /**
     * Allow a client to easily be wrapped by an interceptor
     *
     * @param {Interceptor} interceptor the interceptor to wrap this client with
     * @param [config] configuration for the interceptor
     * @returns {Client} the newly wrapped client
     */


    impl.wrap = function wrap(interceptor, config) {
      return interceptor(impl, config);
    };
    /**
     * @deprecated
     */


    impl.chain = function chain() {
      if (typeof console !== 'undefined') {
        console.log('rest.js: client.chain() is deprecated, use client.wrap() instead');
      }

      return impl.wrap.apply(this, arguments);
    };

    return impl;
  };

  var UrlBuilder$1, responsePromise$1, client$1;
  UrlBuilder$1 = UrlBuilder_1;
  responsePromise$1 = responsePromise_1;
  client$1 = client; // consider abstracting this into a util module

  function clearProperty(scope, propertyName) {
    try {
      delete scope[propertyName];
    } catch (e) {
      // IE doesn't like to delete properties on the window object
      if (propertyName in scope) {
        scope[propertyName] = void 0;
      }
    }
  }

  function cleanupScriptNode(response) {
    try {
      if (response.raw && response.raw.parentNode) {
        response.raw.parentNode.removeChild(response.raw);
      }
    } catch (e) {// ignore
    }
  }

  function registerCallback(prefix, resolve, response, name) {
    if (!name) {
      do {
        name = prefix + Math.floor(new Date().getTime() * Math.random());
      } while (name in window);
    }

    window[name] = function jsonpCallback(data) {
      response.entity = data;
      clearProperty(window, name);
      cleanupScriptNode(response);

      if (!response.request.canceled) {
        resolve(response);
      }
    };

    return name;
  }
  /**
   * Executes the request as JSONP.
   *
   * @param {string} request.path the URL to load
   * @param {Object} [request.params] parameters to bind to the path
   * @param {string} [request.callback.param='callback'] the parameter name for
   *   which the callback function name is the value
   * @param {string} [request.callback.prefix='jsonp'] prefix for the callback
   *   function, as the callback is attached to the window object, a unique,
   *   unobtrusive prefix is desired
   * @param {string} [request.callback.name=<generated>] pins the name of the
   *   callback function, useful for cases where the server doesn't allow
   *   custom callback names. Generally not recommended.
   *
   * @returns {Promise<Response>}
   */


  var jsonp = client$1(function jsonp(request) {
    return responsePromise$1.promise(function (resolve, reject) {
      var callbackName, callbackParams, script, firstScript, response;
      request = typeof request === 'string' ? {
        path: request
      } : request || {};
      response = {
        request: request
      };

      if (request.canceled) {
        response.error = 'precanceled';
        reject(response);
        return;
      }

      request.callback = request.callback || {};
      callbackName = registerCallback(request.callback.prefix || 'jsonp', resolve, response, request.callback.name);
      callbackParams = {};
      callbackParams[request.callback.param || 'callback'] = callbackName;
      request.canceled = false;

      request.cancel = function cancel() {
        request.canceled = true;
        cleanupScriptNode(response);
        reject(response);
      };

      script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = response.url = new UrlBuilder$1(request.path, callbackParams).build();

      function handlePossibleError() {
        if (typeof window[callbackName] === 'function') {
          response.error = 'loaderror';
          clearProperty(window, callbackName);
          cleanupScriptNode(response);
          reject(response);
        }
      }

      script.onerror = function () {
        handlePossibleError();
      };

      script.onload = script.onreadystatechange = function (e) {
        // script tag load callbacks are completely non-standard
        // handle case where onreadystatechange is fired for an error instead of onerror
        if (e && (e.type === 'load' || e.type === 'error') || script.readyState === 'loaded') {
          handlePossibleError();
        }
      };

      response.raw = script;
      firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    });
  });

  var _ref, _ref2, _input, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _searchText;
  var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=';
  var search = document.getElementById('search');
  var resultList = document.getElementById('results');
  var template = document.getElementById('template').innerHTML; // Fetch results with rest.js
  // Returns a promise for the wikipedia json response

  var getResults = function getResults(text) {
    return jsonp(url + text).entity();
  }; // Get input value when it changes
  // Multicast the stream as it's later being merged by an observer
  // @most/core's API is curried, and works great with the pipeline operator |>
  // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Pipeline_operator
  // for more info about the pipeline operator


  var searchText = (_ref = (_ref2 = (_input = input(search), map$1(function (e) {
    return e.target.value.trim();
  })(_input)), skipRepeats(_ref2)), debounce$$1(500)(_ref)); // Get results from wikipedia API and render
  // Only search if the user stopped typing for 500ms
  // and is different than the last time we saw the text
  // Ignore empty results, extract and return the actual
  // list of results from the wikipedia payload

  var results = (_ref3 = (_ref4 = (_ref5 = (_ref6 = (_ref7 = (_ref8 = (_searchText = searchText, filter$$1(function (text) {
    return text.length > 1;
  })(_searchText)), map$1(getResults)(_ref8)), map$1(fromPromise)(_ref7)), switchLatest(_ref6)), partition(function (results) {
    return results.length > 1;
  })(_ref5)), mapEither(function (_) {
    return [];
  }, function (results) {
    return results[1];
  })(_ref4)), unpartition(_ref3));

  var render = function render(resultContent) {
    resultList.innerHTML = resultContent.reduce(function (html, item) {
      return html + template.replace(/\{name\}/g, item);
    }, '');
  }; // Render the results


  runEffects$$1(tap$$1(render, results), newDefaultScheduler());

}());
//# sourceMappingURL=app.js.map
