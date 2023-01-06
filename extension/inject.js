(() => {
  const defineProperty = Object.defineProperty;
  const log = console.log.bind(console);

  const override = (object, key, fn = function () { }) => {
    try {
      defineProperty(object, key, {
        value: fn,
        writable: false,
        configurable: false
      })
    } catch (error) {
      // Fail silently
      log('Failed to override', key, 'on', object);
    }
  };

  const overrideMethods = (object, fn) => {
    for (const method in object) {
      if (typeof object[method] === 'function') {
        override(object, method, fn || object[method].bind(object));
      }
    }
  };

  const perfNow = window.performance.now()
  override(window['performance'], 'now', () => perfNow);

  overrideMethods(window['console'], () => { });
  overrideMethods(window['Math']);
  overrideMethods(window['performance']);
  overrideMethods(window['CanvasRenderingContext2D']);
  overrideMethods(window);
  overrideMethods(Object);
  overrideMethods(document);
})();