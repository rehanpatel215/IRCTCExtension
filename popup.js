document.addEventListener('DOMContentLoaded', () => {
  const passengersContainer = document.getElementById('passengersContainer');
  const addPassengerBtn = document.getElementById('addPassengerBtn');
  const saveBtn = document.getElementById('saveBtn');
  const autofillBtn = document.getElementById('autofillBtn');
  const enableToggle = document.getElementById('enableToggle');
  const statusMessage = document.getElementById('statusMessage');
  const profileSelector = document.getElementById('profileSelector');
  const profileNameInput = document.getElementById('profileName');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');
  const quotaSelector = document.getElementById('quotaSelector');
  const autoUpgrade = document.getElementById('autoUpgrade');
  const confirmBerth = document.getElementById('confirmBerth');
  const confirmBerthContainer = document.getElementById('confirmBerthContainer');
  
  const template = document.getElementById('passengerTemplate');
  
  let passengerCount = 0;
  let allProfiles = {};
  let currentProfileId = 'default';

  // Load saved data
  chrome.storage.local.get(['irctcProfiles', 'activeProfileId'], (result) => {
    allProfiles = result.irctcProfiles || { 'default': { name: 'Default Profile', passengers: [] } };
    currentProfileId = result.activeProfileId || 'default';
    
    updateProfileList();
    loadProfile(currentProfileId);
  });

  function updateProfileList() {
    profileSelector.innerHTML = '';
    Object.keys(allProfiles).forEach(id => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = allProfiles[id].name;
      profileSelector.appendChild(option);
    });
    profileSelector.value = currentProfileId;
  }

  function loadProfile(id) {
    const data = allProfiles[id];
    if (!data) return;

    profileNameInput.value = data.name || '';
    
    passengersContainer.innerHTML = '';
    passengerCount = 0;
    if (data.passengers && data.passengers.length > 0) {
      data.passengers.forEach(p => addPassengerRow(p));
    } else {
      addPassengerRow();
    }

    quotaSelector.value = data.quota || 'GN';
    autoUpgrade.checked = data.autoUpgrade || false;
    confirmBerth.checked = data.confirmBerth || false;
    
    const savedPaymentMode = data.paymentMode || '1';
    const paymentRadio = document.querySelector(`input[name="paymentMode"][value="${savedPaymentMode}"]`);
    if (paymentRadio) paymentRadio.checked = true;
    
    updateQuotaOptions();
  }

  function updateQuotaOptions() {
    const quota = quotaSelector.value;
    if (quota === 'TQ' || quota === 'PT') {
      confirmBerthContainer.classList.remove('hidden');
    } else {
      confirmBerthContainer.classList.add('hidden');
      confirmBerth.checked = false;
    }
  }

  quotaSelector.addEventListener('change', updateQuotaOptions);

  profileSelector.addEventListener('change', (e) => {
    currentProfileId = e.target.value;
    loadProfile(currentProfileId);
    chrome.storage.local.set({ activeProfileId: currentProfileId });
  });

  addPassengerBtn.addEventListener('click', () => {
    if (passengerCount >= 6) {
      showStatus('Max 6 passengers allowed');
      return;
    }
    addPassengerRow();
  });

  async function saveData() {
    const name = profileNameInput.value.trim() || 'Unnamed Profile';
    const passengers = [];
    const cards = document.querySelectorAll('.passenger-card');
    cards.forEach(card => {
      const pName = card.querySelector('.p-name').value.trim();
      if (pName) {
        passengers.push({
          name: pName,
          age: card.querySelector('.p-age').value,
          gender: card.querySelector('.p-gender').value,
          berth: card.querySelector('.p-berth').value
        });
      }
    });

    // If it's a new name, create a new profile ID
    const isNew = !Object.values(allProfiles).some(p => p.name === name);
    if (isNew && currentProfileId === 'default' && name !== 'Default Profile') {
      currentProfileId = 'profile_' + Date.now();
    }

    allProfiles[currentProfileId] = {
      name: name,
      passengers: passengers,
      quota: quotaSelector.value,
      autoUpgrade: autoUpgrade.checked,
      confirmBerth: confirmBerth.checked,
      paymentMode: document.querySelector('input[name="paymentMode"]:checked')?.value || '1'
    };

    return new Promise((resolve) => {
      chrome.storage.local.set({ 
        irctcProfiles: allProfiles, 
        activeProfileId: currentProfileId,
        irctcData: { enabled: enableToggle.checked, ...allProfiles[currentProfileId] } // Compatibility with content.js
      }, () => {
        updateProfileList();
        showStatus('Profile Saved!');
        resolve();
      });
    });
  }

  saveBtn.addEventListener('click', saveData);

  deleteProfileBtn.addEventListener('click', () => {
    if (currentProfileId === 'default') {
      showStatus('Cannot delete default profile');
      return;
    }
    delete allProfiles[currentProfileId];
    currentProfileId = 'default';
    chrome.storage.local.set({ irctcProfiles: allProfiles, activeProfileId: currentProfileId }, () => {
      updateProfileList();
      loadProfile(currentProfileId);
      showStatus('Profile Deleted');
    });
  });

  autofillBtn.addEventListener('click', async () => {
    if (!enableToggle.checked) {
      showStatus('Extension is disabled');
      return;
    }

    await saveData();
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('irctc.co.in')) {
        // Force inject content script just in case
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        } catch (e) { /* Already injected */ }

        chrome.tabs.sendMessage(tab.id, { action: 'triggerAutofill' }, (response) => {
          if (chrome.runtime.lastError) {
            showStatus('Please navigate to the booking page');
          } else {
            showStatus('Autofilling Profile...');
          }
        });
      } else {
        showStatus('Not on IRCTC page');
      }
    } catch (e) {
      showStatus('Error triggering autofill');
    }
  });

  function addPassengerRow(data = null) {
    passengerCount++;
    const clone = template.content.cloneNode(true);
    clone.querySelector('.passenger-number').textContent = passengerCount;
    
    if (data) {
      clone.querySelector('.p-name').value = data.name || '';
      clone.querySelector('.p-age').value = data.age || '';
      clone.querySelector('.p-gender').value = data.gender || '';
      clone.querySelector('.p-berth').value = data.berth || '';
    }

    clone.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.target.closest('.passenger-card').remove();
      updatePassengerNumbers();
    });

    passengersContainer.appendChild(clone);
  }

  function updatePassengerNumbers() {
    const cards = document.querySelectorAll('.passenger-card');
    passengerCount = cards.length;
    cards.forEach((card, index) => {
      card.querySelector('.passenger-number').textContent = index + 1;
    });
  }

  function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.classList.add('show');
    setTimeout(() => statusMessage.classList.remove('show'), 2000);
  }
});
