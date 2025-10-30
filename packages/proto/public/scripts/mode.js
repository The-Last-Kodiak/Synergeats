
const switchLabel = document.querySelector('#mode-switch');

if (switchLabel) {
  switchLabel.onchange = (ev) => {
    ev.stopPropagation(); 
    const checked = !!ev.target?.checked;

    switchLabel.dispatchEvent(
      new CustomEvent('darkmode:toggle', {
        bubbles: true,
        detail: { checked },
      })
    );
  };
}

document.body.addEventListener('darkmode:toggle', (ev) => {
  const isLight = ev.detail?.checked === true;

  document.body.classList.toggle('light-mode', isLight);
});

const isLightNow = document.body.classList.contains('light-mode');
const input = document.querySelector('#mode-checkbox');
if (input) input.checked = isLightNow;
