# AI Video Generation Setup Guide

## Overview

This guide will help you set up real AI video generation in your Animato app. We've integrated multiple AI video generation providers to ensure you get the best quality videos.

## Supported AI Video Generation Providers

### 1. **Luma Dream Machine** ⭐ (Recommended)
- **Quality**: Excellent
- **Features**: Text-to-video, Image-to-video
- **Pricing**: Freemium with paid plans
- **Signup**: [https://lumalabs.ai/dream-machine](https://lumalabs.ai/dream-machine)
- **Strengths**: Very good motion, realistic results, fast generation

### 2. **RunwayML**
- **Quality**: Industry Standard
- **Features**: Gen-3 and Gen-4 models, Image-to-video, Text-to-video
- **Pricing**: Credit-based system
- **Signup**: [https://runwayml.com/](https://runwayml.com/)
- **Strengths**: Professional quality, reliable API

### 3. **AI/ML API** ⭐ (Recommended for unified access)
- **Quality**: Multiple models available
- **Features**: Access to Luma, Runway, Kling through one API
- **Pricing**: Pay-per-use
- **Signup**: [https://aimlapi.com/](https://aimlapi.com/)
- **Strengths**: Single API for multiple providers, good documentation

### 4. **Kling AI**
- **Quality**: High
- **Features**: Text-to-video, Image-to-video, various styles
- **Pricing**: Credit-based
- **Signup**: [https://klingai.com/](https://klingai.com/)
- **Strengths**: Diverse styles, good character consistency

## Setup Instructions

### Step 1: Choose Your Provider(s)

We recommend starting with **AI/ML API** as it gives you access to multiple providers through one account:

1. Go to [https://aimlapi.com/](https://aimlapi.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. This single API gives you access to:
   - Luma Dream Machine
   - RunwayML models
   - Kling AI models
   - Google Veo models

### Step 2: Configure Environment Variables

Create a `.env` file in your Animato directory with your API keys:

```bash
# Primary AI Video API (recommended)
EXPO_PUBLIC_AIML_API_KEY=your_aiml_api_key_here

# Alternative: Direct provider APIs (optional)
EXPO_PUBLIC_LUMA_API_KEY=your_luma_api_key_here
EXPO_PUBLIC_RUNWAY_API_KEY=your_runway_api_key_here
EXPO_PUBLIC_KLING_API_KEY=your_kling_api_key_here

# Existing Supabase config
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 3: Install Required Dependencies

Run the following command to install any additional dependencies:

```bash
npm install
```

### Step 4: Test the Integration

1. Start your app:
```bash
npm start
```

2. Create a new story with characters
3. The app will automatically attempt to use real AI video generation
4. Check the console logs to see which provider is being used

## How It Works

### Automatic Provider Selection

The app automatically selects the best available provider based on:

1. **API Key Availability**: Checks which providers have valid API keys
2. **Feature Requirements**: Selects providers that support your specific needs (text-to-video vs image-to-video)
3. **Fallback Chain**: If one provider fails, it tries the next available one

### Video Generation Process

1. **Primary Attempt**: Real AI video generation using your character images and script
2. **Enhanced Fallback**: If AI generation fails, uses enhanced mock videos with character integration
3. **Basic Fallback**: Traditional placeholder videos as last resort

## API Cost Estimates

### AI/ML API (Recommended)
- **Video Generation**: ~$0.10-0.50 per video (depending on length and quality)
- **Free Tier**: Usually includes some free credits
- **Best Value**: Unified billing across multiple providers

### Direct Provider Costs
- **Luma Dream Machine**: ~$0.12 per generation
- **RunwayML**: ~$1.00-2.00 per 4-second video
- **Kling AI**: ~$0.20-0.80 per video

## Configuration Options

You can customize video generation in `realAIVideoService.ts`:

```typescript
// Duration (seconds)
duration: Math.min(10, Math.max(5, scriptText.length / 20))

// Aspect ratio
aspectRatio: '9:16' // Vertical for social media
// Options: '16:9', '9:16', '1:1'

// Style
style: 'cinematic'
// Options: 'cinematic', 'dramatic', 'artistic', 'realistic'
```

## Troubleshooting

### Common Issues

1. **"No AI video providers available"**
   - Check your API keys in the .env file
   - Verify your account has credits/quota
   - Check the console for specific error messages

2. **Videos taking too long to generate**
   - AI video generation can take 1-5 minutes
   - Check the console for progress updates
   - Consider using shorter scripts for faster generation

3. **API quota exceeded**
   - Most providers have rate limits
   - Consider upgrading your plan or using multiple providers

### Debug Mode

Add this to see which providers are available:

```typescript
import { getProviderStatus } from './utils/realAIVideoService';

// Check provider status
const status = await getProviderStatus();
console.log('Available providers:', status);
```

## Best Practices

### For Best Video Quality

1. **Use Character Images**: Provide clear, high-quality character photos
2. **Write Detailed Prompts**: The script should be descriptive and engaging  
3. **Optimal Length**: Keep individual segments under 10 seconds for best results
4. **Theme Consistency**: Use consistent themes throughout your story

### Cost Optimization

1. **Start with AI/ML API**: Single account, multiple providers
2. **Use Fallbacks**: Enhanced mock videos still provide good UX when AI fails
3. **Batch Generation**: Generate multiple videos when you have quota
4. **Monitor Usage**: Track your API usage to avoid unexpected costs

## Example Usage

Here's how the new system works in practice:

```typescript
// The app automatically uses real AI when available
const videoResult = await generateAIVideo(
  "A brave knight walks through a magical forest",
  characters,
  characterPhotos,
  "fantasy"
);

// Result includes:
// - videoUrl: Direct link to generated video
// - provider: Which AI service was used
// - thumbnailUrl: Preview image
// - duration: Video length in seconds
```

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify your API keys are correct and have sufficient quota
3. Test with simpler prompts first
4. Contact the respective provider's support if needed

## Future Enhancements

We're planning to add:

- More AI video providers (HeyGen, D-ID, Synthesia)
- Advanced character consistency features
- Custom video styles and effects
- Batch video generation
- Video quality optimization

---

**Ready to create amazing AI-generated videos for your stories!** 🎬✨ 