# 🎓 AI Student Coach & Teacher Assistant

An intelligent, interactive learning and teaching platform powered by **Google Gemini AI**. Students can upload study materials (PDF, Word docs, images, web links) to learn complex topics through personalized, age-appropriate explanations, live examples, interactive quizzes, and board exam preparation. Teachers can automatically generate complete model question papers and answer keys based on uploaded chapters.

---

## 🌟 Key Features

### 🎓 For Students
* **Smart Material Ingestion**: Upload textbook chapters as PDF, Word (`.docx`), images (diagrams, photos of book pages), or web links.
* **Age & Class-Adaptive Explanations**: Concepts are explained in simple language matched to the student's age, grade (Class 1–12), and curriculum board (CBSE, ICSE, State Board, IB, Cambridge).
* **Learn vs. Q&A Mode**: Switch between comprehensive chapter walkthroughs and targeted doubt resolution.
* **Live Examples & Real-Life Analogies**: If a student does not understand, quick-action chips allow one-click requests for simpler explanations using relatable real-life analogies.
* **Interactive Quick Quiz**: Generates chapter-based MCQs, True/False, and short-answer questions with instant feedback, scoring, and mistake corrections.
* **Board Exam Preparation**: High-yield topics, common tricky exam questions, answer presentation tips, and sample marking schemes.
* **Multilingual Explanation with English Terms**: Explanations can be toggled into 12+ languages (English, Hindi, Hinglish, Spanish, Tamil, Telugu, Kannada, Bengali, etc.), while preserving technical vocabulary, formulas, and scientific terms in English for board exam readiness.
* **Voice & Written Interactions**: Integrated browser speech recognition (mic input) and text-to-speech (TTS) read-aloud support.

### 👨‍🏫 For Teachers
* **Model Exam Paper Generator**: Upload chapter material and generate full exam papers tailored by:
  * Grade and Subject (single, multiple, or all subjects).
  * Exam Type (Unit Test, Midterm, Final, Board Model Paper).
  * Total Marks (25, 50, 80, 100) and Duration.
  * Question Sections (MCQs, Short Answer, Long Answer, Case Study / Numericals).
  * Optional Solutions & Step-by-Step Marking Scheme.
* **Export & Print**: Easy one-click copy to clipboard and formatted print / PDF export.

### ⚙️ Privacy & Zero-Friction Setup
* **No Login Required**: Simply pick a role (Student or Teacher) and customize your profile.
* **Settings Panel**: Store your Google Gemini API key securely in local browser storage (`localStorage`).
* **Client-Side Document Parsing**: Uses PDF.js and Mammoth.js to parse documents directly in the browser.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite
* **Styling**: Modern CSS Design System (Glassmorphism, Dark Mode, Animations)
* **AI Integration**: `@google/generative-ai` (Gemini 2.5 Flash)
* **State Management**: Zustand with `persist` middleware
* **Document Parsing**: `pdfjs-dist` (PDF), `mammoth` (DOCX), HTML5 File API
* **Icons & Notifications**: `lucide-react`, `react-hot-toast`
* **Markdown & Rendering**: `react-markdown`, `remark-gfm`
* **Voice**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Free tier available)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ravis530-sys/student-coach.git
   cd student-coach
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`.

5. **Enter your Gemini API key**:
   Enter your key in the welcome wizard or open **Settings** (⚙️) anytime to update it.

---

## 📂 Project Structure

```
student-coach/
├── public/                     # Static assets & icons
├── src/
│   ├── components/
│   │   ├── Chat/               # Interactive AI tutor chat & voice input
│   │   ├── ExamGenerator/      # Teacher model paper generation & export
│   │   ├── Layout/             # Sidebar, Topbar & Navigation
│   │   ├── Onboarding/         # Role selection wizard (Student/Teacher)
│   │   ├── Quiz/               # Interactive quizzes with mistake analysis
│   │   ├── Settings/           # API key, language & voice settings
│   │   └── Upload/             # Drag-and-drop file & URL parser
│   ├── pages/
│   │   └── HomePage.jsx        # Dashboard & mode selection
│   ├── services/
│   │   ├── fileParser.js       # Client-side PDF, Word, and Image parser
│   │   ├── geminiService.js    # Gemini API client & prompt engineering
│   │   └── speechService.js    # Web Speech API (STT & TTS)
│   ├── store/
│   │   └── appStore.js         # Global Zustand state with persistence
│   ├── styles/
│   │   └── index.css           # Design tokens, themes & layout styles
│   ├── App.jsx                 # App routing & container
│   └── main.jsx                # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
