# Gemini Resume Builder 🚀

A high-performance, AI-powered resume builder designed for the 2026 talent landscape. Built with **Next.js 15**, **Tailwind CSS 4**, and **Mastra**, this application uses an advanced multi-agent workflow to transform multi-page resumes into high-impact, ATS-optimized 1-page documents.

## ✨ Key Features

- **Agentic Fabrication (Mastra):** A 4-step reliable AI pipeline (**Audit → Architect → Fabricate → Stylist**) powered by **Gemma 3 27B** that semantically reconstructs your resume rather than just deleting text.
- **Visual Orchestration:** The AI dynamically chooses between **Single-Column** and **Sidebar** layouts based on your career density to maximize page real estate.
- **Smart Inline Formatting:** Automatic transformation of list-heavy sections (Skills, Languages, Awards) into space-saving horizontal lines.
- **AI PDF Extraction:** Seamlessly parse your existing PDF resume into structured JSON data using Google Gemini.
- **Dynamic Scaling Engine:** A pixel-perfect A4 preview that fluidly scales to fit any screen while maintaining strictly valid document proportions.
- **Unified & Robust Editor:** A modular form interface built with **React Hook Form** and **Zod**, featuring debounced synchronization and smart conflict resolution to ensure data integrity.
- **High-Fidelity PDF Export:** Generate ATS-friendly PDFs that perfectly mirror your AI-optimized on-screen layout using `@react-pdf/renderer`.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- **Agentic Framework:** [Mastra](https://mastra.ai/) (Reliable Multi-Step Workflows)
- **AI Engines:** [Gemma 3 27B](https://ai.google.dev/gemma) (Fabrication) & [Gemini 3 Flash](https://ai.google.dev/) (Extraction & Strategy)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **PDF Generation:** [@react-pdf/renderer](https://react-pdf.org/)
- **Tooling:** [Biome](https://biomejs.dev/) (Fast Linting & Formatting)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- A Google AI Studio API Key ([Get one here](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OmKshirsagar/AI-Resume-Builder.git
   cd AI-Resume-Builder
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
- [x] **Phase 3: AI Enhancement** - Section refinement and job tailoring.
- [x] **Phase 4: Content Condensation** - Agentic multi-step fabrication (Mastra).
- [x] **Phase 5: Visual Orchestration** - AI-driven layout selection and smart lists.
- [x] **Phase 6: Editor & Export** - Unified form editor and high-fidelity PDF export.
- [x] **Phase 7: Persistence & Deployment** - Vercel production readiness and build verification.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
