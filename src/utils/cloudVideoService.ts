/**
 * Cloud Video Generation Service
 * Integrates with multiple cloud video APIs for real video generation
 */

import { VideoSegment, SubtitleSegment, VideoCompositionOptions, CompositionResult } from './videoCompositionService';
import Constants from 'expo-constants';

export interface CloudVideoProvider {
  name: string;
  apiKey?: string;
  baseUrl: string;
  isAvailable: boolean;
}

export interface VideoGenerationRequest {
  segments: VideoSegment[];
  voiceoverUrl: string;
  characterImages: string[];
  subtitles: SubtitleSegment[];
  options: VideoCompositionOptions;
  theme: string;
}

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string): string | undefined => {
  // Try Expo Constants first
  const expoConfig = Constants.expoConfig?.extra;
  if (expoConfig && expoConfig[key]) {
    return expoConfig[key];
  }
  
  // Try process.env as fallback
  return process.env[key];
};

/**
 * Available cloud video providers
 */
const VIDEO_PROVIDERS: Record<string, CloudVideoProvider> = {
  shotstack: {
    name: 'Shotstack',
    apiKey: getEnvVar('SHOTSTACK_API_KEY'),
    baseUrl: getEnvVar('SHOTSTACK_BASE_URL') || 'https://api.shotstack.io/stage',
    isAvailable: false,
  },
  bannerbear: {
    name: 'Bannerbear',
    apiKey: getEnvVar('BANNERBEAR_API_KEY'),
    baseUrl: 'https://api.bannerbear.com/v2',
    isAvailable: false,
  },
  creatomate: {
    name: 'Creatomate',
    apiKey: getEnvVar('CREATOMATE_API_KEY'),
    baseUrl: 'https://api.creatomate.com/v1',
    isAvailable: false,
  },
};

/**
 * Initialize video providers and check availability
 */
export const initializeVideoProviders = async (): Promise<void> => {
  console.log('🔍 Checking for video provider API keys...');
  
  for (const [key, provider] of Object.entries(VIDEO_PROVIDERS)) {
    console.log(`${provider.name}: API Key = ${provider.apiKey ? 'Found' : 'Not found'}`);
    
    if (provider.apiKey && provider.apiKey !== 'your-api-key-here' && provider.apiKey !== 'undefined') {
      try {
        console.log(`Testing ${provider.name} connection...`);
        // Test API connectivity
        const isWorking = await testProviderConnection(provider);
        VIDEO_PROVIDERS[key].isAvailable = isWorking;
        console.log(`${provider.name} video provider: ${isWorking ? '✅ Available' : '❌ Unavailable'}`);
      } catch (error) {
        console.warn(`Failed to initialize ${provider.name}:`, error);
        VIDEO_PROVIDERS[key].isAvailable = false;
      }
    } else {
      console.log(`${provider.name}: ⚠️ No API key configured`);
    }
  }
  
  const availableCount = Object.values(VIDEO_PROVIDERS).filter(p => p.isAvailable).length;
  console.log(`📊 Total available providers: ${availableCount}`);
};

/**
 * Test provider connection
 */
const testProviderConnection = async (provider: CloudVideoProvider): Promise<boolean> => {
  try {
    // Simple health check for each provider
    switch (provider.name) {
      case 'Shotstack':
        return await testShotstackConnection(provider);
      case 'Bannerbear':
        return await testBannerbearConnection(provider);
      case 'Creatomate':
        return await testCreatomateConnection(provider);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Connection test failed for ${provider.name}:`, error);
    return false;
  }
};

/**
 * Generate video using available cloud providers
 */
export const generateVideoWithCloudAPI = async (
  request: VideoGenerationRequest
): Promise<CompositionResult> => {
  console.log('Starting cloud video generation...');
  
  // Try each available provider in order of preference
  const providers = ['shotstack', 'bannerbear', 'creatomate'];
  
  for (const providerKey of providers) {
    const provider = VIDEO_PROVIDERS[providerKey];
    
    if (!provider.isAvailable) {
      console.log(`Skipping ${provider.name} - not available`);
      continue;
    }
    
    try {
      console.log(`Attempting video generation with ${provider.name}...`);
      
      switch (providerKey) {
        case 'shotstack':
          return await generateWithShotstack(request, provider);
        case 'bannerbear':
          return await generateWithBannerbear(request, provider);
        case 'creatomate':
          return await generateWithCreatomate(request, provider);
      }
    } catch (error) {
      console.error(`${provider.name} video generation failed:`, error);
      // Continue to next provider
    }
  }
  
  throw new Error('All cloud video providers failed');
};

/**
 * Shotstack video generation
 */
const generateWithShotstack = async (
  request: VideoGenerationRequest,
  provider: CloudVideoProvider
): Promise<CompositionResult> => {
  console.log('Generating video with Shotstack...');
  
  // Create Shotstack timeline
  const timeline = {
    soundtrack: {
      src: request.voiceoverUrl,
      effect: 'fadeIn',
      volume: request.options.voiceOptions.volume || 1.0,
    },
    tracks: [
      // Image track
      {
        clips: request.characterImages.map((imageUrl, index) => ({
          asset: {
            type: 'image',
            src: imageUrl,
          },
          start: request.segments.slice(0, index).reduce((total, seg) => total + seg.duration, 0),
          length: request.segments[index]?.duration || 3,
          effect: 'zoomIn',
          scale: 1.0,
          position: 'center',
          transition: {
            in: 'fade',
            out: 'fade',
          },
        })),
      },
      // Subtitle track
      {
        clips: request.subtitles.map(subtitle => ({
          asset: {
            type: 'title',
            text: subtitle.text,
            style: 'subtitle',
            color: request.options.subtitleStyle.fontColor,
            size: 'medium',
            background: request.options.subtitleStyle.backgroundColor,
          },
          start: subtitle.startTime,
          length: subtitle.endTime - subtitle.startTime,
          position: request.options.subtitleStyle.position,
        })),
      },
    ],
  };
  
  const edit = {
    timeline,
    output: {
      format: 'mp4',
      resolution: 'hd',
      aspectRatio: '9:16', // Vertical video for social media
      fps: request.options.fps,
      scaleTo: 'preview',
    },
  };
  
  // Submit render request
  const response = await fetch(`${provider.baseUrl}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey!,
    },
    body: JSON.stringify(edit),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shotstack API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  const renderId = result.response.id;
  
  console.log(`Shotstack render started with ID: ${renderId}`);
  
  // Poll for completion
  const videoUrl = await pollShotstackRender(renderId, provider);
  
  return {
    videoUrl,
    thumbnailUrl: request.characterImages[0] || 'https://via.placeholder.com/1080x1920',
    duration: request.segments.reduce((total, seg) => total + seg.duration, 0),
    subtitles: request.subtitles,
  };
};

/**
 * Poll Shotstack render status
 */
const pollShotstackRender = async (
  renderId: string,
  provider: CloudVideoProvider
): Promise<string> => {
  const maxAttempts = 60; // 10 minutes max
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${provider.baseUrl}/render/${renderId}`, {
        headers: {
          'x-api-key': provider.apiKey!,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Shotstack status check failed: ${response.status}`);
      }
      
      const result = await response.json();
      const status = result.response.status;
      
      console.log(`Shotstack render status: ${status} (attempt ${attempts + 1})`);
      
      if (status === 'done') {
        return result.response.url;
      } else if (status === 'failed') {
        throw new Error(`Video rendering failed: ${result.response.error || 'Unknown error'}`);
      }
      
      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
      
    } catch (error) {
      console.error('Error polling Shotstack:', error);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Video rendering timeout');
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error('Video rendering timeout');
};

/**
 * Bannerbear video generation
 */
const generateWithBannerbear = async (
  request: VideoGenerationRequest,
  provider: CloudVideoProvider
): Promise<CompositionResult> => {
  console.log('Generating video with Bannerbear...');
  
  // Bannerbear uses templates, so this would require pre-created templates
  // For now, we'll create a simple video request
  const videoRequest = {
    template: 'your-bannerbear-template-id', // You need to create this in Bannerbear
    modifications: [
      {
        name: 'background_image',
        src: request.characterImages[0],
      },
      {
        name: 'subtitle_text',
        text: request.subtitles[0]?.text || 'Generated Video',
      },
    ],
  };
  
  const response = await fetch(`${provider.baseUrl}/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(videoRequest),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bannerbear API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  
  // Poll for completion (Bannerbear also requires polling)
  const videoUrl = await pollBannerbearRender(result.uid, provider);
  
  return {
    videoUrl,
    thumbnailUrl: request.characterImages[0] || 'https://via.placeholder.com/1080x1920',
    duration: request.segments.reduce((total, seg) => total + seg.duration, 0),
    subtitles: request.subtitles,
  };
};

/**
 * Creatomate video generation
 */
const generateWithCreatomate = async (
  request: VideoGenerationRequest,
  provider: CloudVideoProvider
): Promise<CompositionResult> => {
  console.log('Generating video with Creatomate...');
  
  // Creatomate composition
  const composition = {
    output_format: 'mp4',
    width: request.options.resolution.width,
    height: request.options.resolution.height,
    frame_rate: request.options.fps,
    elements: [
      // Background images
      ...request.characterImages.map((imageUrl, index) => ({
        type: 'image',
        source: imageUrl,
        x: '50%',
        y: '50%',
        width: '100%',
        height: '100%',
        time: request.segments.slice(0, index).reduce((total, seg) => total + seg.duration, 0),
        duration: request.segments[index]?.duration || 3,
      })),
      // Audio
      {
        type: 'audio',
        source: request.voiceoverUrl,
        time: 0,
        volume: request.options.voiceOptions.volume || 1.0,
      },
      // Subtitles
      ...request.subtitles.map(subtitle => ({
        type: 'text',
        text: subtitle.text,
        x: '50%',
        y: '85%',
        width: '90%',
        height: 'auto',
        time: subtitle.startTime,
        duration: subtitle.endTime - subtitle.startTime,
        font_size: request.options.subtitleStyle.fontSize,
        color: request.options.subtitleStyle.fontColor,
        background_color: request.options.subtitleStyle.backgroundColor,
        text_align: 'center',
      })),
    ],
  };
  
  const response = await fetch(`${provider.baseUrl}/renders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(composition),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Creatomate API error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  
  // Poll for completion
  const videoUrl = await pollCreatomateRender(result.id, provider);
  
  return {
    videoUrl,
    thumbnailUrl: request.characterImages[0] || 'https://via.placeholder.com/1080x1920',
    duration: request.segments.reduce((total, seg) => total + seg.duration, 0),
    subtitles: request.subtitles,
  };
};

/**
 * Test connection functions
 */
const testShotstackConnection = async (provider: CloudVideoProvider): Promise<boolean> => {
  try {
    const response = await fetch(`${provider.baseUrl}/probe`, {
      headers: { 'x-api-key': provider.apiKey! },
    });
    return response.ok;
  } catch {
    return false;
  }
};

const testBannerbearConnection = async (provider: CloudVideoProvider): Promise<boolean> => {
  try {
    const response = await fetch(`${provider.baseUrl}/account`, {
      headers: { 'Authorization': `Bearer ${provider.apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

const testCreatomateConnection = async (provider: CloudVideoProvider): Promise<boolean> => {
  try {
    const response = await fetch(`${provider.baseUrl}/templates`, {
      headers: { 'Authorization': `Bearer ${provider.apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Polling functions for other providers
 */
const pollBannerbearRender = async (
  uid: string,
  provider: CloudVideoProvider
): Promise<string> => {
  const maxAttempts = 60;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${provider.baseUrl}/videos/${uid}`, {
        headers: { 'Authorization': `Bearer ${provider.apiKey}` },
      });
      
      if (!response.ok) {
        throw new Error(`Bannerbear status check failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'completed') {
        return result.video_url;
      } else if (result.status === 'failed') {
        throw new Error('Video rendering failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
      
    } catch (error) {
      console.error('Error polling Bannerbear:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error('Video rendering timeout');
};

const pollCreatomateRender = async (
  renderId: string,
  provider: CloudVideoProvider
): Promise<string> => {
  const maxAttempts = 60;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${provider.baseUrl}/renders/${renderId}`, {
        headers: { 'Authorization': `Bearer ${provider.apiKey}` },
      });
      
      if (!response.ok) {
        throw new Error(`Creatomate status check failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'succeeded') {
        return result.url;
      } else if (result.status === 'failed') {
        throw new Error('Video rendering failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
      
    } catch (error) {
      console.error('Error polling Creatomate:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  throw new Error('Video rendering timeout');
};

/**
 * Get available providers
 */
export const getAvailableProviders = (): CloudVideoProvider[] => {
  return Object.values(VIDEO_PROVIDERS).filter(provider => provider.isAvailable);
};

/**
 * Check if any cloud providers are available
 */
export const hasAvailableProviders = (): boolean => {
  return Object.values(VIDEO_PROVIDERS).some(provider => provider.isAvailable);
}; 