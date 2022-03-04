
const __uk = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

window[__uk] = Object.freeze({
  log: window.console.log,
});

const override = (object, key, fn = function () { }) => Object.defineProperty(object, key, {
  value: fn,
  writable: false,
  configurable: false
});

override(document, 'createElement', document.createElement.bind(document));
override(window, 'setTimeout');
override(window, 'clearTimeout');
override(window, 'setInterval');
override(window, 'clearInterval');
override(window, 'alert');

for (const method in console) {
  override(window['console'], method);
}

const perfNow = window.performance.now()
override(window['performance'], 'now', () => perfNow);

window[__uk].log('Allow debug now')