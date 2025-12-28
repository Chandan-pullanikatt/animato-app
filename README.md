🏆 Animato — AI-Powered Storytelling Platform

Bolt Hackathon 2024 Winner | Multi-AI Video & Story Generation

Animato transforms written stories into professional, AI-generated animated videos.
It combines state-of-the-art AI services for story creation, character design, voice synthesis, and video generation into a single, production-ready platform for web and mobile.

🌐 Live Demo: https://fastidious-ganache-28a5fc.netlify.app/

🚀 What Animato Does

Converts text stories into animated videos

Generates characters, voices, and scenes automatically

Supports conversational AI video agents

Built as a scalable SaaS platform for creators and startups

This repository supports both the website and mobile-ready architecture.

🏆 Hackathon Achievements (Bolt Hackathon 2024)

Animato qualified for multiple challenge tracks, demonstrating depth across AI, infrastructure, and monetization.

Voice AI Challenge — ElevenLabs
Professional voice synthesis, cloning, and narration

Conversational AI Video Challenge — Tavus
Real-time AI video agents with character personas

Startup Challenge — Supabase
Secure authentication, RLS, and scalable PostgreSQL

Deploy Challenge — Netlify
Production deployment with CDN & SSL

Custom Domain Challenge — Entri + IONOS
Domain search, registration, and DNS automation

🏅 Total Hackathon Value: $22,500

✨ Core Features
🧠 AI Story Creation

OpenAI GPT with Gemini fallback

Interactive AI chat for story development

Theme-based templates

🎭 Character Intelligence

Automatic character extraction from stories

AI-generated character portraits

Personality & voice mapping

🎬 Video Generation

Multi-provider support (Runway ML, Replicate, HuggingFace)

Scene segmentation and cinematic styles

Automatic video compilation

🎙️ Audio & Voice

ElevenLabs professional voice synthesis

Character-specific narration

Browser TTS fallback

🎥 Conversational AI Video

Tavus real-time AI video agents

Interactive character conversations

Video persona management

🏗️ Technical Architecture
Frontend (Web & Mobile-Ready)

React 18 + TypeScript

Tailwind CSS

Framer Motion animations

Zustand state management

React Hook Form

Backend & Database

Supabase (PostgreSQL + RLS)

Secure authentication

Real-time subscriptions

Migration-based schema

AI & Media Services

OpenAI / Gemini — Story generation

ElevenLabs — Voice synthesis

Tavus — Conversational video

Replicate / HuggingFace — Image & video models

Infrastructure

Netlify deployment (CDN + SSL)

Environment-based configuration

Production-grade security practices

📱 Web & Mobile Support

Responsive UI for all screen sizes

Mobile-friendly workflows

Architecture suitable for React Native / Expo integration

Shared backend and API services

⚡ Quick Setup
1️⃣ Clone & Install
git clone <repository-url>
cd animato-website
npm install

2️⃣ Environment Configuration

Create a .env file:

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# AI Providers (at least one required)
VITE_OPENAI_API_KEY=your_openai_key
VITE_GEMINI_API_KEY=your_gemini_key

# Optional Services
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_TAVUS_API_KEY=your_tavus_key


.env files are intentionally ignored for security.

3️⃣ Database Setup

Create a Supabase project

Run the migration:

supabase/migrations/20250621044403_icy_paper.sql

4️⃣ Run Locally
npm run dev

5️⃣ Build for Production
npm run build

🎯 User Flow

Landing & Demo

Secure Authentication

Story Creation (AI-assisted)

Character Extraction

Voice & Video Generation

Conversational AI Interaction

Save, Manage, and Share Content

🔐 Security & Best Practices

Row Level Security (RLS)

Environment-based secrets

Input validation & error handling

CDN-optimized assets

Progressive fallback systems

🎨 Why Animato Stands Out
Technical Innovation

Multi-AI provider fallback strategy

Real-time AI video conversations

Intelligent character-voice mapping

Business Readiness

SaaS-ready architecture

Subscription & monetization support

Scalable for high-traffic usage

User Experience

Zero-setup demo mode

Clean, intuitive UI

Accessibility-aware design

Professional animations

🔗 Links

🌐 Live Demo: https://fastidious-ganache-28a5fc.netlify.app/

📧 Contact: Available on request

📝 License

Built for Bolt Hackathon 2024.
All third-party services used under their respective licenses.