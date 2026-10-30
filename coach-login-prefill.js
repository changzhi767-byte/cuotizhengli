/* Public mock preview only: editable defaults, never submit or accept agreements. */
(() => {
  const initialized = new WeakSet();
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  let scheduled = false;
  function fill() {
    scheduled = false;
    const inputs = document.querySelectorAll('.login-shell__input input, input.login-shell__input');
    if (inputs.length !== 2) return;
    inputs.forEach((input, index) => {
      if (initialized.has(input)) return;
      initialized.add(input);
      if (input.value) return;
      setValue.call(input, index === 0 ? '13800000001' : 'test1234');
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(fill);
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
