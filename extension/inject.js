(() => {
  const original = {
    defineProperty: Object.defineProperty,
    setTimeout: window.setTimeout.bind(window),
    log: console.log.bind(console),
    HTMLCanvasElement: {
      toBlob: HTMLCanvasElement.prototype.toBlob,
      toDataURL: HTMLCanvasElement.prototype.toDataURL,
    },
  };

  const freeze = (object) => {
    for (const key in object) {
      if (typeof object[key] === 'object') {
        freeze(object[key]);
      }
    }
    Object.freeze(object);
  }

  const override = (object, key, value = function () { }) => {
    try {
      original.defineProperty(object, key, {
        value,
        writable: false,
        configurable: false
      })
    } catch (error) {
      // Fail silently
      original.log('Failed to override', key, 'on', object);
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

  const overrideCanvas = (previous) => {
    var shift = {
      'r': Math.floor(Math.random() * 10) - 5,
      'g': Math.floor(Math.random() * 10) - 5,
      'b': Math.floor(Math.random() * 10) - 5,
      'a': Math.floor(Math.random() * 10) - 5
    };
    var width = this.width, height = this.height, context = this.getContext("2d");
    var imageData = context.getImageData(0, 0, width, height);
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        var n = ((i * (width * 4)) + (j * 4));
        imageData.data[n + 0] = imageData.data[n + 0] + shift.r;
        imageData.data[n + 1] = imageData.data[n + 1] + shift.g;
        imageData.data[n + 2] = imageData.data[n + 2] + shift.b;
        imageData.data[n + 3] = imageData.data[n + 3] + shift.a;
      }
    }
    window.top.postMessage("canvas-fingerprint-defender-alert", '*');
    context.putImageData(imageData, 0, 0);
    return previous.apply(this, arguments);
  }

  override(HTMLCanvasElement.prototype, 'toBlob', () => overrideCanvas(original.HTMLCanvasElement.toBlob))
  override(HTMLCanvasElement.prototype, 'toDataURL', () => overrideCanvas(original.HTMLCanvasElement.toDataURL))

  override(window, 'navigator', new Proxy(navigator, {
    has: (target, key) => (key === 'webdriver' ? false : key in target),
    get: (target, key) =>
      key === 'webdriver' ?
        false :
        typeof target[key] === 'function' ? target[key].bind(target) : target[key]
  }));

  override(window, 'setTimeout', (fn, delay, ...args) => {
    const stringified = fn.toString().replace('debugger', 'window');
    const newFn = new Function('', stringified);
    return original.setTimeout(newFn, delay, ...args);
  });

  overrideMethods(window['console'], () => { });
  overrideMethods(window['Math']);
  overrideMethods(window['performance']);
  overrideMethods(window['CanvasRenderingContext2D']);
  overrideMethods(window);
  overrideMethods(Object);
  overrideMethods(document);
})();