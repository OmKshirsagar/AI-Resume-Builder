# Gemini Resume Builder 🚀

A high-performance, AI-powered resume builder designed for the 2026 talent landscape. Built with **Next.js 15**, **Tailwind CSS 4**, and **Google Gemini 3 Flash**, this application helps you build ATS-optimized, single-column resumes that pass the "10-second recruiter scan."

## ✨ Key Features

- **Split-Pane UI:** Real-time WYSIWYG preview side-by-side with a powerful editor.
- **AI PDF Extraction:** Upload your existing PDF resume, and Gemini will semantically parse it into structured data automatically.
- **Dynamic Scaling Engine:** A pixel-perfect A4 preview that fluidly scales to fit your screen size while maintaining document integrity.
- **ATS-Optimized Templates:** Focus on single-column layouts designed for modern Talent Intelligence Systems.
- **Recruiter-Centric Feedback (Coming Soon):** Get real-time critiques from an AI acting as a "Senior Technical Recruiter."
- **Persistent State:** Your progress is automatically saved to local storage and persists across sessions.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **AI Engine:** [Google Gemini 3 Flash](https://ai.google.dev/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Tooling:** [Biome](https://biomejs.dev/) (Linting & Formatting)
- **Layout:** [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- A Google AI Studio API Key ([Get one here](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/resume-builder.git
   cd resume-builder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY="your_api_key_here"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📈 Project Status

- [x] **Phase 1: Foundation** - Persistent split-pane layout & A4 scaling engine.
- [x] **Phase 2: AI Import** - PDF parsing and AI data extraction pipeline.
- [ ] **Phase 3: AI Enhancement** - Section refinement and job tailoring.
- [ ] **Phase 4: Export** - High-quality PDF generation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
