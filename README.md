# Cricket Menu Bar Widget

A beautiful, live cricket score widget built with React, Tailwind CSS, and the Gemini API. This project is configured so you can easily run it as a native macOS menu bar app using Electron.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd <your-repo-folder>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API Key:**
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

## Running as a Mac Menu Bar App

We have included a lightweight Electron wrapper so you can run this directly in your macOS menu bar!

1. **Start the Menu Bar App:**
   ```bash
   npm run start:mac
   ```
   *This will launch the app and place a cricket icon in your Mac menu bar. Click it to view live scores!*

2. **Build a Standalone `.app` (Optional):**
   If you want to package this into a standalone `.app` file that you can move to your `Applications` folder:
   ```bash
   npm run build:mac
   ```
   *The built application will be located in the `dist-electron` folder.*

## Running in the Browser (Web Mode)

If you just want to run it as a standard web application:

```bash
npm run dev
```
Then open `http://localhost:3000` in your browser.

## Features
- **Live Scores:** Fetches real-time cricket scores using the Gemini API.
- **Pin Matches:** Click the pin icon to focus the widget on a specific match.
- **Auto-Refresh:** Scores update automatically every 5 minutes.
- **macOS Aesthetic:** Glassmorphic UI designed to look native on macOS.
