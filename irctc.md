# 🚆 IRCTC Smart Autofill Chrome Extension

## 🎯 Project Overview
This project is a **Chrome Extension** that automatically fills passenger details and common selections on the IRCTC booking page to reduce typing time and improve booking speed.

> ⚠️ Note:
> - This extension does NOT automate CAPTCHA or OTP.
> - It does NOT bypass any security.
> - It only assists the user in filling data faster.

---

## 🧠 Problem Statement
Booking tickets on IRCTC (especially during Tatkal) is time-sensitive. Users often lose valuable seconds due to:
- Repeated typing of passenger details
- Manual dropdown selections
- Re-entering the same information every time

### 💡 Solution
A Chrome extension that auto-fills saved passenger data instantly when the booking page loads.

---

## ⚙️ Features

### ✅ Core Features
- Auto-fill passenger details:
  - Name
  - Age
  - Gender
  - Berth Preference
- Auto-select options:
  - Travel class
  - Quota
- Multi-passenger support
- One-click autofill trigger (or auto-run)

---

### 🔥 Advanced Features
- Save passenger profiles using browser storage
- Popup UI for entering passenger data
- Smart delay handling (wait for page to load)
- Enable/Disable toggle

---

## 🏗️ Tech Stack

### 🧩 Core Technologies
- JavaScript (Vanilla JS)
- HTML + CSS
- Chrome Extension APIs

### 📦 APIs Used
- `chrome.storage.local` → store passenger data
- `content_scripts` → inject script into webpage
- `manifest.json` → extension configuration

---

## 📁 Project Structure
IRCTC-Autofill/
│
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── style.css
└── icons/


---

## ⚙️ How It Works

### 🧭 Flow

1. User installs extension
2. User enters passenger details in popup
3. Data is stored in browser

---

4. User opens IRCTC booking page
5. Extension detects page load
6. Script is injected into the page

---

7. Script performs:
- Finds input fields
- Fills stored data
- Selects dropdowns

---

8. User completes:
- CAPTCHA
- OTP
- Clicks BOOK

---

## 🧠 Key Concepts

### 1. DOM Manipulation
- Accessing and modifying HTML elements
- Example: `document.querySelector()`

---

### 2. Content Scripts
- JavaScript that runs inside web pages
- Interacts with the IRCTC DOM

---

### 3. Chrome Storage
- Stores user data persistently
- Acts like a lightweight database

---

### 4. Event Handling
- Detect page load
- Trigger autofill

---

### 5. Asynchronous Handling
- Handle delayed loading of elements
- Use timeouts or observers

---

## ⚠️ Challenges

### 🔴 Dynamic UI
- IRCTC changes class names frequently  
**Solution:** Use stable selectors (placeholders, labels)

---

### 🔴 Delayed Loading
- Elements may not load instantly  
**Solution:** Use polling or MutationObserver

---

### 🔴 Multiple Passengers
- Dynamic form generation  
**Solution:** Loop through fields

---

## 🚫 Restrictions

- ❌ No CAPTCHA bypass
- ❌ No OTP automation
- ❌ No request spamming
- ❌ No hacking or unfair advantage

---

## 🎯 Outcome

- Functional Chrome extension
- Real-world automation tool
- Strong resume project

---

## 💼 Resume Description

**Built a Chrome Extension to automate passenger data entry on IRCTC, reducing manual input time by up to 80% using JavaScript and Chrome APIs.**

---

## 🚀 Future Enhancements

- Add passenger profile switching
- UI improvements in popup
- Smart detection of booking page
- Better error handling

---

## 📌 Conclusion

This project demonstrates:
- Practical browser automation
- Real-world problem solving
- Strong understanding of JavaScript and browser APIs