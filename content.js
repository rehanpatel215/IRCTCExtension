(() => {
  if (window.irctcAutofillInjected) return;
  window.irctcAutofillInjected = true;

  console.log('IRCTC Autofill: Active');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'triggerAutofill') {
      startAutofill();
      sendResponse({ status: 'started' });
    }
    return true;
  });

  async function startAutofill() {
    chrome.storage.local.get(['irctcData'], async (result) => {
      const data = result.irctcData;
      if (!data || !data.enabled) return;

      // 1. Passenger Details (Wait for them to finish)
      if (data.passengers && data.passengers.length > 0) {
        await fillPassengerDetails(data.passengers);
      }

      // 2. Immediate fill for other sections
      fillQuota(data.quota);
      fillOtherPreferences(data);
      fillPaymentMode(data.paymentMode);

      // 3. Robust Retry (Handles lazy-loaded sections at the bottom)
      const retries = [500, 1500, 3000];
      retries.forEach(delay => {
        setTimeout(() => {
          fillOtherPreferences(data);
          fillPaymentMode(data.paymentMode);
        }, delay);
      });
    });
  }

  function fillQuota(quota) {
    if (!quota) return;
    const el = document.querySelector('[formcontrolname="quota"] input, #quota select, .quota select');
    if (el) setNativeValue(el, quota);
  }

  function fillOtherPreferences(data) {
    // Target Auto Upgrade
    let autoCB = document.querySelector('p-checkbox[formcontrolname="autoUpgrade"]');
    if (!autoCB) autoCB = findCompByText('p-checkbox', 'auto upgrade');
    if (autoCB) toggleCheckbox(autoCB, !!data.autoUpgrade);

    // Target Confirm Berth
    let confCB = document.querySelector('p-checkbox[formcontrolname="confirmberths"]');
    if (!confCB) confCB = findCompByText('p-checkbox', 'confirm berth');
    if (confCB) toggleCheckbox(confCB, !!data.confirmBerth);
  }

  function fillPaymentMode(mode) {
    if (!mode) return;
    // Use very specific text fragments from IRCTC labels
    const search = mode === '1' ? 'Pay through Credit' : 'Pay through BHIM';
    
    // 1. Try p-radioButton components first (Most reliable)
    const radios = document.querySelectorAll('p-radioButton');
    for (const r of radios) {
      if (r.textContent.toLowerCase().includes(search.toLowerCase())) {
        const box = r.querySelector('.ui-radiobutton-box, .ui-radiobutton-icon');
        const isVisible = !!(r.offsetWidth || r.offsetHeight);
        if (box && isVisible) {
          box.click();
          console.log(`IRCTC Autofill: Selected Payment Mode ${mode}`);
          return;
        }
      }
    }

    // 2. Fallback to standard labels and radio inputs
    const labels = document.querySelectorAll('label');
    for (const l of labels) {
      if (l.textContent.toLowerCase().includes(search.toLowerCase())) {
        const input = l.querySelector('input[type="radio"]') || 
                      document.getElementById(l.getAttribute('for')) ||
                      l.parentElement?.querySelector('input[type="radio"]');
        if (input) {
          input.click();
          return;
        }
      }
    }
  }

  function toggleCheckbox(comp, shouldCheck) {
    const input = comp.querySelector('input');
    const box = comp.querySelector('.ui-chkbox-box');
    if (input && box && input.checked !== shouldCheck) {
      box.click();
    }
  }

  function findCompByText(tag, text) {
    // 1. Search inside tag
    for (const c of document.querySelectorAll(tag)) {
      if (c.textContent.toLowerCase().includes(text.toLowerCase())) return c;
    }
    // 2. Search labels/spans and find nearest tag
    for (const l of document.querySelectorAll('label, span, div')) {
      if (l.childNodes.length > 0 && l.textContent.toLowerCase().includes(text.toLowerCase())) {
        const found = l.closest('.row, .col-md-12')?.querySelector(tag) || l.parentElement?.querySelector(tag);
        if (found) return found;
      }
    }
    return null;
  }

  function getInputElements(sel) {
    const seen = new Set();
    const result = [];
    document.querySelectorAll(sel).forEach(el => {
      const isVisible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      if (!isVisible) return;
      const target = (el.tagName === 'INPUT' || el.tagName === 'SELECT') ? el : el.querySelector('input, select, .ui-inputtext');
      if (target && !seen.has(target)) {
        result.push(target);
        seen.add(target);
      }
    });
    return result;
  }

  const SELECTORS = {
    name: '[formcontrolname="passengerName"], input[placeholder="Passenger Name"], input[placeholder="Name"]',
    age: '[formcontrolname="passengerAge"], input[placeholder="Age"]',
    gender: '[formcontrolname="passengerGender"], select[formcontrolname="passengerGender"], p-dropdown[formcontrolname="passengerGender"]',
    berth: '[formcontrolname="passengerBerthChoice"], select[formcontrolname="passengerBerthChoice"], p-dropdown[formcontrolname="passengerBerthChoice"]'
  };

  async function fillPassengerDetails(passengers) {
    for (let i = 0; i < passengers.length; i++) {
      let inputs = getInputElements(SELECTORS.name);
      if (i >= inputs.length) {
        const btn = Array.from(document.querySelectorAll('span, a, button'))
          .find(el => (el.textContent || '').toLowerCase().includes('add passenger') || el.textContent.includes('+ Add'));
        if (btn) {
          btn.click();
          for (let a = 0; a < 10; a++) {
            await new Promise(r => setTimeout(r, 200));
            inputs = getInputElements(SELECTORS.name);
            if (inputs.length > i) break;
          }
        }
      }
      if (inputs[i]) {
        const p = passengers[i];
        [
          { s: SELECTORS.name, v: p.name },
          { s: SELECTORS.age, v: p.age },
          { s: SELECTORS.gender, v: p.gender },
          { s: SELECTORS.berth, v: p.berth }
        ].forEach(f => {
          const els = getInputElements(f.s);
          if (els[i] && f.v) setNativeValue(els[i], f.v);
        });
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  function setNativeValue(el, val) {
    if (!el || !val) return;
    let s; let p = el;
    while (p) {
      const d = Object.getOwnPropertyDescriptor(p, 'value');
      if (d && d.set) { s = d.set; break; }
      p = Object.getPrototypeOf(p);
    }
    if (s) s.call(el, val); else el.value = val;
    ['input', 'change', 'blur'].forEach(ev => el.dispatchEvent(new Event(ev, { bubbles: true })));
  }
})();
