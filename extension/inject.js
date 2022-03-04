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