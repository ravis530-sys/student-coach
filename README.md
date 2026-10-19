# 🎓 AI Student Coach & Teacher Assistant

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An intelligent, full-featured educational platform powered by **Google Gemini AI (`gemini-3.8-flash`)**. Designed for students (Class 1–12 & board exam candidates) and teachers, this application provides personalized tutoring, real-life analogies, interactive quizzes, automated model exam paper generation, multi-file document ingestion, and voice interactions — running entirely client-side with zero backend dependencies.

---

## 📋 Table of Contents

- [🌟 Features Overview](#-features-overview)
  - [🎓 For Students](#-for-students)
  - [👨‍🏫 For Teachers](#-for-teachers)
  - [📂 Multi-File Document Ingestion](#-multi-file-document-ingestion)
  - [🌐 Multilingual & Voice Support](#-multilingual--voice-support)
  - [🔒 Privacy & Zero-Friction Setup](#-privacy--zero-friction-setup)
- [🏗️ How This App Is Built (Architecture)](#️-how-this-app-is-built-architecture)
  - [Frontend & UI Framework](#frontend--ui-framework)
  - [Client-Side Document Parsing](#client-side-document-parsing)
  - [State Management & Context Aggregation](#state-management--context-aggregation)
  - [Gemini AI Engine & Prompt Architecture](#gemini-ai-engine--prompt-architecture)
  - [Speech & Audio Service](#speech--audio-service)
- [📂 Project Structure](#-project-structure)
- [🚀 How to Build & Run Locally](#-how-to-build--run-locally)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
  - [Available Scripts](#available-scripts)
- [📖 How to Use the App (User Guide)](#-how-to-use-the-app-user-guide)
  - [1. Initial Setup & Onboarding](#1-initial-setup--onboarding)
  - [2. Setting up your Gemini API Key](#2-setting-up-your-gemini-api-key)
  - [3. Uploading Study Materials](#3-uploading-study-materials)
  - [4. Learning with the AI Tutor](#4-learning-with-the-ai-tutor)
  - [5. Testing Knowledge in Quiz Mode](#5-testing-knowledge-in-quiz-mode)
  - [6. Generating Model Exam Papers (Teacher Mode)](#6-generating-model-exam-papers-teacher-mode)
  - [7. Using Voice Input & Audio Read-Aloud](#7-using-voice-input--audio-read-aloud)
- [🔧 Troubleshooting & FAQ](#-troubleshooting--faq)
- [📄 License](#-license)

---

## 🌟 Features Overview

### 🎓 For Students
* **Age & Grade-Adaptive Explanations**: Concepts are explained in simple language tailored to the student's grade (Class 1–12), age, and curriculum board (CBSE, ICSE, State Board, IB, Cambridge).
* **Learn Mode**: Comprehensive, step-by-step chapter walkthroughs with relatable analogies and fun real-life examples.
* **Q&A Mode**: Rapid doubt clarification grounded in uploaded study material.
* **Board Exam Prep Mode**: High-yield topics, common tricky exam questions, answer presentation tips, and sample marking schemes.
* **Interactive Quick Quiz**: Auto-generates chapter-based MCQs, True/False, and short-answer questions with instant feedback, scoring, and mistake corrections.
* **One-Click Simplification Chips**: If an explanation is unclear, quick action chips allow immediate re-explanation using alternative analogies.

### 👨‍🏫 For Teachers
* **Model Exam Paper Generator**: Generate structured question papers tailored by:
  * Subject(s) and target class.
  * Exam Type (Unit Test, Midterm, Final, Board Model Paper).
  * Total Marks (25, 50, 80, 100) and Duration (1 to 3 hours).
  * Sections: MCQs (1 mark), Short Answer (3 marks), Long Answer / Case Studies (5 marks).
  * Includes complete step-by-step **Answer Key** and marking scheme.
* **Export & Print**: Instant one-click copy to clipboard and formatted print / PDF export.

### 📂 Multi-File Document Ingestion
* **Upload Multiple Formats**: Select or drop multiple files simultaneously:
  * **PDFs (`.pdf`)**: Client-side parsing using PDF.js.
  * **Word Documents (`.docx`, `.doc`)**: Extracted via Mammoth.js.
  * **Images (`.png`, `.jpg`, `.jpeg`, `.webp`)**: Base64 encoded for multimodal support.
  * **Text Files (`.txt`, `.md`)**: Extracted using the HTML5 File API.
  * **Web URLs**: Direct fetch and HTML tag stripping.
* **Incremental Add & Management**:
  * Add files at any time without resetting previously uploaded documents.
  * View page counts, word counts, and expandable in-line text previews.
  * Delete individual files or clear all with one click.
  * Automatic multi-document aggregation with section dividers for the AI context.

### 🌐 Multilingual & Voice Support
* **12+ Supported Languages**: English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Urdu, and Odia.
* **STEM Term Retention**: Keeps technical formulas, mathematical symbols, and scientific terms in English while explaining context in the chosen native language for board exam readiness.
* **Voice Speech-to-Text (STT)**: Speak doubts directly into the browser microphone via Web Speech API.
* **Voice Text-to-Speech (TTS)**: Read aloud AI explanations with natural speech synthesis.

### 🔒 Privacy & Zero-Friction Setup
* **Zero Backend / Serverless**: 100% client-side application. No external database, tracking, or user accounts.
* **Secure Storage**: Gemini API keys and user preferences are stored securely in the user's browser `localStorage`.
* **Zero Document Upload to Third-Party Servers**: Document parsing happens inside your browser's Web Worker before being sent directly to Google Gemini API over HTTPS.

---

## 🏗️ How This App Is Built (Architecture)

```
┌────────────────────────────────────────────────────────┐
│                      Browser UI                        │
│   (React 19 + Vanilla CSS Design System + Glassmorphism)│
└───────────────┬────────────────────────┬───────────────┘
                │                        │
         User Actions             Document Ingestion
                │                        │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│  Zustand Global Store  │      │  fileParser.js Engine  │
│  - User Profile        │◄─────┤  - pdfjs-dist (PDF)    │
│  - Multi-File Context  │      │  - mammoth (DOCX)      │
│  - Chat History        │      │  - FileReader (Images) │
│  - Persistent Storage  │      │  - URL Scraper         │
└───────────────┬────────┘      └────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│              geminiService.js Integration              │
│  - Google Generative AI SDK (@google/generative-ai)    │
│  - Model: gemini-3.8-flash                             │
│  - System Prompt Generation (Adaptive Roles)          │
│  - Multi-Turn History Validation & Sanitization        │
│  - Aggregated Context Ingestion (up to 60k chars)      │
└───────────────┬────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│           Google Gemini API (Cloud Endpoint)           │
└────────────────────────────────────────────────────────┘
```

### Frontend & UI Framework
* **React 19**: Uses modern functional components, hooks (`useMemo`, `useCallback`, `useRef`), and concurrent rendering features.
* **Vite 8**: Ultra-fast dev server with Hot Module Replacement (HMR) and optimized Rollup production builds.
* **Styling**: Handcrafted Vanilla CSS design system with CSS variables, dark-mode color palette, glassmorphism cards, micro-animations, and responsive layouts (no heavy CSS frameworks).
* **Icons**: `lucide-react` for clean, modern iconography.
* **Notifications**: `react-hot-toast` for toast notifications.

### Client-Side Document Parsing
* [fileParser.js](file:///d:/git_develop/student-coach/src/services/fileParser.js):
  * **PDF.js (`pdfjs-dist`)**: Runs in the browser with web worker integration to extract text page-by-page. Includes a polyfill for `Math.sumPrecise` to ensure cross-browser stability.
  * **Mammoth.js (`mammoth`)**: Extracts clean raw text from Word `.docx` documents without server processing.
  * **HTML5 FileReader**: Converts image diagrams to base64 data for visual reasoning.
  * **URL Scraper**: Fetches web articles and removes HTML tags for clean document context.

### State Management & Context Aggregation
* [appStore.js](file:///d:/git_develop/student-coach/src/store/appStore.js):
  * Powered by **Zustand** with `persist` middleware.
  * **Multi-File Aggregator (`aggregateFiles`)**: When multiple files or URLs are uploaded, this helper combines them into structured document blocks:
    ```
    === [DOCUMENT 1: Physics_Ch1.pdf] ===
    ...text...
    === [END OF DOCUMENT: Physics_Ch1.pdf] ===

    === [DOCUMENT 2: Physics_Ch2.docx] ===
    ...text...
    === [END OF DOCUMENT: Physics_Ch2.docx] ===
    ```
  * Automatically exposes both `uploadedFiles` (array of individual documents) and `uploadedContent` (aggregated context).

### Gemini AI Engine & Prompt Architecture
* [geminiService.js](file:///d:/git_develop/student-coach/src/services/geminiService.js):
  * Utilizes Google's official `@google/generative-ai` SDK configured to **`gemini-3.8-flash`**.
  * **Dynamic System Prompt (`buildSystemPrompt`)**: Adapts instructions based on whether the user is a student or teacher, grade level, age, education board, and selected mode.
  * **History Sanitization (`formatHistory`)**: Ensures conversation history complies with Gemini's multi-turn requirements (strictly alternating `user` and `model` turns, always starting with `user` and omitting UI welcome bubbles).
  * **High-Capacity Context Window**: Passes up to 60,000 characters of aggregated document text directly within `systemInstruction` to guarantee grounding across every message turn.

### Speech & Audio Service
* [speechService.js](file:///d:/git_develop/student-coach/src/services/speechService.js):
  * Wraps browser-native `webkitSpeechRecognition` / `SpeechRecognition` for speech-to-text.
  * Uses `window.speechSynthesis` (SpeechSynthesisUtterance) for audio playback in native languages.

---

## 📂 Project Structure

```
student-coach/
├── index.html                      # HTML5 template & font imports
├── package.json                    # Project metadata & dependencies
├── vite.config.js                  # Vite bundler configuration
├── public/                         # Static assets
└── src/
    ├── App.jsx                     # Top-level view routing & layout frame
    ├── main.jsx                    # Application entry point
    ├── components/
    │   ├── Chat/
    │   │   └── TutorChat.jsx       # Student tutor chat, suggestions & voice
    │   ├── ExamGenerator/
    │   │   └── ExamGenerator.jsx   # Teacher exam generator, options & print
    │   ├── Layout/
    │   │   ├── Sidebar.jsx         # Navigation sidebar & mode switcher
    │   │   └── Topbar.jsx          # Header, quick language toggle & profile
    │   ├── Onboarding/
    │   │   └── OnboardingWizard.jsx# First-time role & profile setup wizard
    │   ├── Quiz/
    │   │   └── QuizMode.jsx        # Interactive quiz interface & score summary
    │   ├── Settings/
    │   │   └── SettingsModal.jsx   # API key, voice, language, profile reset
    │   └── Upload/
    │       └── UploadZone.jsx      # Multi-file drag & drop, previews, URL adder
    ├── pages/
    │   └── HomePage.jsx            # Dashboard, action cards, upload overview
    ├── services/
    │   ├── fileParser.js           # PDF, DOCX, Image, and URL client-side parser
    │   ├── geminiService.js        # Gemini 3.8 Flash SDK, chat & prompts
    │   └── speechService.js        # Web Speech API STT and TTS handlers
    ├── store/
    │   └── appStore.js             # Zustand store with persistence & aggregation
    └── styles/
        └── index.css               # Core design tokens, dark theme & animations
```

---

## 🚀 How to Build & Run Locally

### Prerequisites
1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/)).
2. **NPM**: v9.0.0 or higher (comes bundled with Node.js).
3. **Gemini API Key**: Free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ravis530-sys/student-coach.git
   cd student-coach
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit [http://localhost:5173](http://localhost:5173).

5. **Enter your Gemini API key**:
   Enter your key during the welcome onboarding wizard or click **Settings (⚙️)** in the top right at any time.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite dev server at `http://localhost:5173` with HMR |
| `npm run build` | Compiles optimized production bundle in `dist/` |
| `npm run preview`| Locally serves production bundle for testing |
| `npm run lint` | Runs `oxlint` for fast code linting |

---

## 📖 How to Use the App (User Guide)

### 1. Initial Setup & Onboarding
1. When you first launch the app, choose your role:
   - **Student**: Enter your name, age, class/grade (Class 1 to 12), and education board (CBSE, ICSE, State Board, etc.).
   - **Teacher**: Enter your name and subjects you teach (Mathematics, Science, English, etc.).
2. You can update or switch these settings at any time in **Settings (⚙️)**.

### 2. Setting up your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a free API key.
2. In the app, open **Settings (⚙️)** or enter it in the onboarding prompt.
3. Your key is stored strictly on your device's `localStorage` and is never sent to any third-party servers.

### 3. Uploading Study Materials
1. On the **Home** page or **Upload Material** tab, drag and drop one or more files into the dropzone.
2. Supported types: **PDF**, **DOCX**, **Images (PNG, JPG)**, **TXT**, or **Web URLs**.
3. You can:
   - Click **Add more files** to add additional chapters.
   - Click the **Eye icon (👁️)** on any card to preview extracted text.
   - Click the **X** icon to delete a single file, or **Clear All** to start fresh.

### 4. Learning with the AI Tutor
1. Select one of the student modes:
   - **📚 Learn Mode**: Ask the AI to explain a concept. Use the quick-action chips (e.g. *"Give me real-life examples"*, *"Explain simply"*) to get clearer analogies.
   - **❓ Q&A Mode**: Ask specific doubts about your uploaded chapter.
   - **🎯 Exam Prep**: Request high-yield definitions, typical question patterns, and marking schemes.
2. The AI uses your grade level and curriculum to adjust the complexity of its answers automatically.

### 5. Testing Knowledge in Quiz Mode
1. Click **🧠 Quick Quiz** in the sidebar.
2. The AI analyzes your uploaded materials and generates an 8-question quiz (MCQs, True/False, Short Answer).
3. Answer each question to receive instant corrections, explanations, and a final score summary.

### 6. Generating Model Exam Papers (Teacher Mode)
1. Switch to the **Teacher** role or click **📝 Exam Generator**.
2. Configure exam parameters:
   - Select subject(s) and grade level.
   - Choose total marks (25, 50, 80, 100) and difficulty.
   - Customize question counts: MCQs, Short Answer, Long Answer.
3. Click **Generate Model Paper**.
4. Review the structured output (Instructions, Section A, B, C, and Answer Key).
5. Click **Copy to Clipboard** or **Print Paper** for physical handouts.

### 7. Using Voice Input & Audio Read-Aloud
- **Microphone**: Click the 🎤 mic button next to the chat bar and speak your question (supported in Chrome and Edge).
- **Audio Read-Aloud**: Click the 🔊 speaker icon next to any AI response to hear it spoken aloud.
- **Language Selection**: Use the language dropdown in the top bar to switch explanations to Hindi, Hinglish, Tamil, Telugu, and more.

---

## 🔧 Troubleshooting & FAQ

#### Q: I get `[GoogleGenerativeAI Error]: First content should be with role 'user', got model`
**A:** This issue is resolved in the codebase. The chat history builder sanitizes messages to ensure client-side welcome greetings are omitted from the LLM turn history and alternating roles (`user` ↔ `model`) are strictly maintained.

#### Q: I get `This model models/gemini-2.0-flash is no longer available`
**A:** The project is configured to use **`gemini-3.8-flash`**, which is the active model supported by the Google Gemini API.

#### Q: Why isn't voice input working?
**A:** Speech Recognition relies on the Web Speech API, which requires browser microphone permissions and is best supported in **Google Chrome** and **Microsoft Edge**.

#### Q: Are my uploaded documents or API keys shared?
**A:** No. All parsing (PDF, DOCX, text) happens directly inside your browser. No files or keys are transmitted to any middleman server; requests communicate directly between your browser and Google's official Gemini endpoint.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
