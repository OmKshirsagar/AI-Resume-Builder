# Architecture: Gemini Resume Builder

## System Overview
A high-performance, agentic web application for resume optimization. The system is divided into a **React-based Editor/Previewer** and a **Mastra-powered Multi-Agent Backend**.

## Key Components

### 1. Frontend: The WYSIWYG Engine
- **State Management**: Zustand 5 with local storage persistence. Manages two primary states: `original` (Master Data) and `draft` (AI-optimized data).
- **Editor**: Modular architecture using React Hook Form's `FormProvider`. Synchronizes with Zustand using a debounced (400ms) strategy to maintain preview fluidity.
- **Preview**: Real-time A4 rendering engine using CSS transforms and Container Queries for pixel-perfect document proportions across screen sizes.
- **Renderer**: Dynamic component that switches between layouts (Classic, Sidebar) based on AI blueprints.

### 2. Backend: Agentic Workflows (Mastra)
- **Framework**: Mastra. Handles deterministic state transitions and complex agent chaining.
- **Workflow (Fabricator)**:
    1. **Auditor**: Ranks bullet point impact and identifies high-priority themes.
    2. **Strategist/Budgeter**: Allocates a "bullet budget" based on career length to ensure 1-page fit.
    3. **Fabricator**: Semantically merges content into dense, XYZ-formatted "Super Bullets."
    4. **Stylist**: Chooses the visual layout (Single-Column vs. Sidebar) and spacing settings.

### 3. Data Flow
- **Input**: PDF Upload -> Gemini Extraction -> Zustand Store.
- **Modification**: Manual Editing -> Debounced Sync -> Zustand Store -> Preview.
- **Optimization**: Mastra Workflow -> Draft State -> User Review -> Apply/Discard.
- **Output**: Zustand Store -> @react-pdf/renderer -> PDF Blob -> Client Download.

## Design Patterns
- **Provider Pattern**: Centralized form and state providers.
- **Agentic Chain**: Step-by-step document reconstruction instead of simple text completion.
- **Semantic Merging**: Using LLM reasoning to condense information without loss of context.
- **Immutable Store**: Zustand with standard spread updates for compatibility with form libraries.
