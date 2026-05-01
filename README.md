# IRCTC Autofill Pro 🚂

A powerful browser extension designed to automate the passenger details, preferences, and payment selection process on the IRCTC NGET website. Built for speed and reliability, especially during high-demand booking windows like Tatkal.

## 🚀 Features

- **Multi-Passenger Management**: Save and autofill details for multiple passengers instantly.
- **Smart Row Injection**: Automatically clicks "+ Add Passenger" and waits for rows to appear before filling.
- **Other Preferences**: One-click automation for "Consider for Auto-Upgrade" and "Book only if confirm berth is allotted."
- **Payment Mode Auto-Select**: Choose between Credit/Debit Cards or BHIM/UPI automatically.
- **Quota Support**: Supports Quota selection (General, Tatkal, etc.).
- **Deduplication Engine**: Prevents data from shifting between rows by uniquely identifying each input field.
- **Modern UI**: Clean, glassmorphic popup design for easy profile management.

## 🛠️ Technical Overview

The extension is specifically optimized for IRCTC's **Angular and PrimeNG** architecture.

- **Component Targeting**: Uses a combination of `formcontrolname` attributes and row-aware text searches to reliably click PrimeNG checkboxes and radio buttons.
- **Event Simulation**: Uses native event dispatching (`input`, `change`, `blur`) to ensure IRCTC's internal state management captures the autofilled data.
- **Robustness**: Implements a multi-retry strategy (0.5s, 1.5s, 3.0s) to handle lazy-loaded elements at the bottom of the page.

## 📦 Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select the project folder.

## 📖 How to Use

1. Click the extension icon to open the popup.
2. Enter your passenger details and select your preferences.
3. Click **Save Profile**.
4. On the IRCTC Passenger Details page, click **Autofill Profile**.
5. Watch the magic happen!

## 📄 License

MIT License. Use responsibly.
