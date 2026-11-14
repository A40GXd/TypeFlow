# TypeFlow

TypeFlow is a clean, monochrome online text editor for writing and formatting documents in your browser. It works without an account and saves your documents locally in your browser.

**Try the live app:** [typeflowpro.vercel.app](https://typeflowpro.vercel.app)

## Features

- Rich-text formatting, including headings, lists, alignment, and text styling
- Multiple documents, with an outline for navigating headings
- Undo and redo history
- Find and replace
- Word, character, line, and document statistics
- Configurable auto-correct and capitalization
- Export to plain text or PDF, and print
- Responsive layout with an optional virtual keyboard for touch devices
- Automatic local saving in browser storage

## Run locally

### Requirements

- [Node.js](https://nodejs.org/) and npm

### Install and start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:3000`).

### Other commands

```bash
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build
npm run lint     # Run TypeScript checks
```

## Configuration

Copy `.env.example` to `.env` if you need to configure the optional Gemini API integration or the hosted app URL. `GEMINI_API_KEY` is used for Gemini API calls; the example file contains placeholder values. Keep real credentials private and do not commit them.

## Data and privacy

Documents and auto-correct rules are stored in the browser's local storage on the device where you use TypeFlow. Clearing site data or using another browser/device may remove or not include those documents. Export documents to keep a separate copy.

## Tech stack

TypeFlow is built with React, TypeScript, Vite, and Tailwind CSS.
