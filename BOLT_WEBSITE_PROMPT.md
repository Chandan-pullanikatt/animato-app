# Animato Website - Complete Bolt Prompt

Create a modern, responsive web application called "Animato" - an AI-powered storytelling platform that generates animated videos from user stories. Build this using React, TypeScript, and Tailwind CSS with a beautiful, modern UI.

## Core Features to Implement

### 1. **Landing Page & Authentication**
- Modern landing page with hero section showcasing AI video generation
- User authentication (sign up/login) with email/password
- Responsive design optimized for desktop and mobile
- Dark/light theme toggle
- Professional gradient backgrounds and animations

### 2. **Story Creation Workflow**
```
Story Input → Character Generation → Video Generation → Editing → Export
```

### 3. **Story Input System**
- Rich text editor for story input
- Theme selection (Fantasy, Sci-Fi, Romance, Adventure, Mystery, Comedy, Drama, Horror)
- Story length options (Short: 1-2 min, Medium: 3-5 min, Long: 6-10 min)
- Auto-save functionality
- Story templates and prompts for inspiration

### 4. **AI Character Generation**
- Generate 3-5 unique characters per story automatically
- Character customization:
  - Name, age, personality traits
  - Physical appearance (hair, eyes, clothing style)
  - Role in story (protagonist, antagonist, supporting)
- Character consistency across the story
- Diverse character generation (different ethnicities, genders, ages)

### 5. **AI Photo Generation for Characters**
- Generate realistic character photos using AI
- Multiple photo variations per character (3-5 options)
- High-quality portrait generation
- Consistent character appearance
- Photo selection and approval workflow

### 6. **Real AI Video Generation**
Integrate multiple AI video generation providers:

**Primary Providers:**
- **Luma Dream Machine** (text-to-video, image-to-video)
- **RunwayML** (Gen-3/Gen-4 models)
- **AI/ML API** (unified access to multiple providers)
- **Kling AI** (high-quality video generation)

**Features:**
- Automatic provider selection based on availability
- Character-based video generation using character photos
- Multiple video style options (cinematic, dramatic, artistic, realistic)
- Video duration: 5-10 seconds per segment
- Aspect ratios: 16:9, 9:16, 1:1
- Smart fallback system if AI generation fails

### 7. **Video Editing Interface**
- Segment-by-segment video editing
- 3 AI-generated video options per segment
- Video selection and replacement
- Character switching within segments
- Subtitle overlay with timing controls
- Background music integration
- Transition effects between segments

### 8. **Advanced Video Features**
- **Auto-restart functionality**: Videos loop seamlessly
- **Character consistency**: Same characters across segments
- **Subtitle synchronization**: Perfect timing with narration
- **Voice generation**: AI-generated narration for stories
- **Multiple export formats**: MP4, WebM, GIF
- **Quality options**: 720p, 1080p, 4K

### 9. **User Dashboard**
- Story library with thumbnails and metadata
- Project management (drafts, completed, published)
- Usage analytics (videos created, characters generated)
- Account settings and preferences
- Billing and subscription management

### 10. **API Integration Architecture**

```typescript
// Environment variables needed
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

// AI Video Generation APIs
VITE_LUMA_API_KEY=your_luma_key
VITE_RUNWAY_API_KEY=your_runway_key
VITE_AIML_API_KEY=your_aiml_key
VITE_KLING_API_KEY=your_kling_key

// Character & Photo Generation
VITE_REPLICATE_API_TOKEN=your_replicate_token
VITE_HUGGINGFACE_API_KEY=your_huggingface_key

// Text-to-Speech
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Technical Implementation Details

### **Frontend Stack**
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Zustand for state management
- React Query for API calls

### **Key Components to Build**

1. **StoryCreator Component**
```typescript
interface StoryCreatorProps {
  onStoryComplete: (story: Story) => void;
}

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  characters: Character[];
  segments: StorySegment[];
}
```

2. **CharacterGenerator Component**
```typescript
interface Character {
  id: string;
  name: string;
  description: string;
  personality: string[];
  appearance: {
    age: string;
    gender: string;
    ethnicity: string;
    hairColor: string;
    eyeColor: string;
    style: string;
  };
  photos: CharacterPhoto[];
}
```

3. **VideoGenerator Component**
```typescript
interface VideoGenerationOptions {
  provider: 'luma' | 'runway' | 'aiml' | 'kling';
  style: 'cinematic' | 'dramatic' | 'artistic' | 'realistic';
  duration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
}
```

4. **VideoEditor Component**
- Segment timeline view
- Video preview player
- Character switching controls
- Subtitle editor
- Export options

### **AI Integration Services**

1. **Real AI Video Service**
```typescript
class AIVideoService {
  async generateVideo(prompt: string, characterImage?: string): Promise<VideoResult>
  async checkProviderStatus(): Promise<ProviderStatus>
  async pollGenerationStatus(taskId: string): Promise<GenerationStatus>
}
```

2. **Character Generation Service**
```typescript
class CharacterService {
  async generateCharacters(story: string, theme: string): Promise<Character[]>
  async generateCharacterPhotos(character: Character): Promise<CharacterPhoto[]>
  async enhanceCharacterConsistency(characters: Character[]): Promise<Character[]>
}
```

3. **Video Composition Service**
```typescript
class VideoCompositionService {
  async createVideoFromScript(script: string, characters: Character[]): Promise<CompositionResult>
  async generateSubtitles(audioUrl: string): Promise<SubtitleSegment[]>
  async combineVideoSegments(segments: VideoSegment[]): Promise<string>
}
```

### **Database Schema (Supabase)**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Characters table
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),
  name TEXT NOT NULL,
  description TEXT,
  personality JSONB,
  appearance JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Character Photos table
CREATE TABLE character_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  photo_url TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id),
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  provider TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## UI/UX Design Requirements

### **Design System**
- Modern, clean interface with rounded corners
- Gradient backgrounds and subtle animations
- Consistent color palette:
  - Primary: Blue (#3B82F6)
  - Secondary: Purple (#8B5CF6)
  - Accent: Green (#10B981)
  - Dark mode: #1F2937 background
- Typography: Inter font family
- Spacing: 8px grid system

### **Key Pages Layout**

1. **Landing Page**
   - Hero section with animated video preview
   - Feature showcase with icons and descriptions
   - Pricing tiers
   - Call-to-action buttons

2. **Dashboard**
   - Sidebar navigation
   - Story grid with thumbnails
   - Quick create button
   - Usage statistics

3. **Story Creator**
   - Step-by-step wizard interface
   - Progress indicator
   - Real-time preview
   - Save/continue later options

4. **Video Editor**
   - Timeline view at bottom
   - Large video preview
   - Character panel on right
   - Tools panel on left

### **Responsive Breakpoints**
- Mobile: 320px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

## Advanced Features

### **Error Handling & Fallbacks**
- Graceful degradation when AI APIs fail
- Enhanced mock video system as fallback
- User-friendly error messages
- Retry mechanisms for failed generations

### **Performance Optimizations**
- Lazy loading for video content
- Image optimization and caching
- Progressive video loading
- Background processing for AI generation

### **User Experience Enhancements**
- Real-time generation progress indicators
- Notification system for completed videos
- Keyboard shortcuts for power users
- Drag-and-drop file uploads
- Auto-save every 30 seconds

### **Analytics & Monitoring**
- User engagement tracking
- Video generation success rates
- API usage monitoring
- Performance metrics

## Deployment & Configuration

### **Environment Setup**
```bash
# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Add all API keys

# Development
npm run dev

# Build for production
npm run build
```

### **Required Dependencies**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "framer-motion": "^10.16.0",
    "react-router-dom": "^6.8.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^4.32.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.263.0"
  }
}
```

## Success Criteria

The website should:
1. ✅ Generate AI characters from story input
2. ✅ Create realistic character photos
3. ✅ Generate actual AI videos (not mocks)
4. ✅ Provide segment-by-segment editing
5. ✅ Handle multiple AI providers with fallbacks
6. ✅ Export high-quality videos
7. ✅ Work seamlessly across devices
8. ✅ Handle errors gracefully
9. ✅ Provide excellent user experience
10. ✅ Scale to handle multiple users

## Additional Instructions

- Use modern React patterns (hooks, functional components)
- Implement proper TypeScript types throughout
- Add loading states and error boundaries
- Include comprehensive error handling
- Make it mobile-first responsive
- Add smooth animations and transitions
- Implement proper SEO optimization
- Include accessibility features (ARIA labels, keyboard navigation)
- Add comprehensive testing setup
- Document all API integrations

**Build this as a production-ready web application that rivals the best AI video generation platforms like RunwayML, Luma, and Synthesia, but focused specifically on storytelling and character-driven narratives.** 