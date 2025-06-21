# 🎬 Video Generation Setup Guide

## Overview

Animato now supports **real video generation** using cloud-based APIs! This guide will help you set up video generation providers to create actual videos instead of mock content.

## 🚀 Quick Start (Free Options)

### Option 1: Shotstack (Recommended)
- **Free Tier**: 20 renders/month
- **Setup Time**: 5 minutes
- **Quality**: Professional HD videos

### Option 2: Creatomate
- **Free Tier**: 10 renders/month  
- **Setup Time**: 10 minutes
- **Quality**: High-quality videos with templates

### Option 3: Bannerbear
- **Free Tier**: 30 API calls/month
- **Setup Time**: 15 minutes
- **Quality**: Template-based videos

## 📋 Setup Instructions

### 1. Shotstack Setup (Recommended)

1. **Sign up for Shotstack**:
   - Go to [shotstack.io](https://shotstack.io)
   - Create a free account
   - Verify your email

2. **Get your API key**:
   - Login to your dashboard
   - Go to "API Keys" section
   - Copy your **Stage API Key** (for testing)

3. **Configure in your app**:
   ```bash
   # Create .env file in your project root
   echo "SHOTSTACK_API_KEY=your_api_key_here" >> .env
   ```

4. **Test the integration**:
   - Run your app: `npx expo start`
   - Generate a video - you should see "Shotstack" in the logs

### 2. Creatomate Setup

1. **Sign up for Creatomate**:
   - Go to [creatomate.com](https://creatomate.com)
   - Create a free account

2. **Get your API key**:
   - Go to your dashboard
   - Navigate to "API Keys"
   - Copy your API key

3. **Configure in your app**:
   ```bash
   echo "CREATOMATE_API_KEY=your_api_key_here" >> .env
   ```

### 3. Bannerbear Setup

1. **Sign up for Bannerbear**:
   - Go to [bannerbear.com](https://bannerbear.com)
   - Create a free account

2. **Create a video template**:
   - Go to "Templates" → "Create Template"
   - Choose "Video" template
   - Add text and image elements
   - Save and note the template ID

3. **Get your API key**:
   - Go to "API Keys" in your dashboard
   - Copy your API key

4. **Configure in your app**:
   ```bash
   echo "BANNERBEAR_API_KEY=your_api_key_here" >> .env
   ```

## 🔧 Environment Configuration

Create a `.env` file in your project root:

```env
# Video Generation APIs
SHOTSTACK_API_KEY=your_shotstack_key_here
CREATOMATE_API_KEY=your_creatomate_key_here
BANNERBEAR_API_KEY=your_bannerbear_key_here

# Optional: Switch to production URLs when ready
# SHOTSTACK_BASE_URL=https://api.shotstack.io/v1
```

## 📱 Testing Your Setup

1. **Start the app**:
   ```bash
   npx expo start
   ```

2. **Check initialization logs**:
   Look for these messages in your console:
   ```
   🚀 Initializing Animato app services...
   📹 Initializing video providers...
   ✅ Video providers initialized: X available
   Available providers: Shotstack, Creatomate
   ```

3. **Generate a test video**:
   - Navigate to any theme
   - Create a script and characters
   - Click "Generate Video"
   - Watch the logs for API calls

## 🎯 Expected Results

### With API Keys Configured:
- ✅ Real video generation (2-5 minutes)
- ✅ Professional quality output
- ✅ Custom subtitles and voiceover
- ✅ HD resolution (1080x1920)

### Without API Keys (Fallback):
- ⚠️ Mock video URLs (instant)
- ⚠️ Sample videos for testing
- ⚠️ All features work, but no custom content

## 🔍 Troubleshooting

### "No cloud video providers available"
- Check your `.env` file exists
- Verify API keys are correct
- Restart the app after adding keys

### "Video rendering failed"
- Check your API key permissions
- Verify you haven't exceeded free tier limits
- Check network connectivity

### "Video rendering timeout"
- This is normal for complex videos (up to 10 minutes)
- Check the provider's dashboard for render status
- Try with simpler content first

## 💰 Cost Breakdown

### Free Tiers:
- **Shotstack**: 20 videos/month (HD quality)
- **Creatomate**: 10 videos/month (custom templates)
- **Bannerbear**: 30 API calls/month (template-based)

### Paid Plans (Optional):
- **Shotstack**: $29/month for 200 renders
- **Creatomate**: $19/month for 100 renders
- **Bannerbear**: $49/month for 1000 API calls

## 🚀 Advanced Configuration

### Production Setup:
```env
# Use production URLs for live apps
SHOTSTACK_BASE_URL=https://api.shotstack.io/v1
CREATOMATE_BASE_URL=https://api.creatomate.com/v1
```

### Custom Video Settings:
The app automatically configures:
- **Resolution**: 1080x1920 (vertical)
- **Frame Rate**: 30 FPS
- **Format**: MP4
- **Aspect Ratio**: 9:16 (social media optimized)

## 📞 Support

### Need Help?
1. Check the console logs for detailed error messages
2. Verify your API keys in the provider dashboards
3. Test with simple content first
4. Check provider documentation for specific requirements

### Provider Support:
- **Shotstack**: [docs.shotstack.io](https://docs.shotstack.io)
- **Creatomate**: [creatomate.com/docs](https://creatomate.com/docs)
- **Bannerbear**: [developers.bannerbear.com](https://developers.bannerbear.com)

## 🎉 Success!

Once configured, your Animato app will generate **real, professional videos** with:
- ✅ Custom character images
- ✅ AI-generated voiceover
- ✅ Synchronized subtitles
- ✅ Professional transitions
- ✅ HD quality output

Your users can now create and share actual videos instead of mock content! 🚀 