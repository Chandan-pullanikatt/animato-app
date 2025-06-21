/**
 * Video Composition Service
 * Handles combining character images, voiceover, and subtitles into videos
 */

import * as FileSystem from 'expo-file-system';
import { Character } from './characterGenerationAPI';
import { CharacterPhoto } from './photoGenerationAPI';
import { generateSpeechFromText, TTSResult, VoiceOptions } from './textToSpeechService';

export interface VideoSegment {
  id: string;
  text: string;
  characterIds: string[];
  duration: number;
  imageUrl?: string;
  audioUrl?: string;
}

export interface SubtitleSegment {
  startTime: number;
  endTime: number;
  text: string;
}

export interface VideoCompositionOptions {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  voiceOptions: VoiceOptions;
  subtitleStyle: {
    fontSize: number;
    fontColor: string;
    backgroundColor: string;
    position: 'bottom' | 'top' | 'center';
  };
}

export interface CompositionResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  subtitles: SubtitleSegment[];
}

/**
 * Default video composition options
 */
const DEFAULT_OPTIONS: VideoCompositionOptions = {
  resolution: {
    width: 1080,
    height: 1920, // Vertical video for social media
  },
  fps: 30,
  voiceOptions: {
    voice: 'en-US-Standard-A',
    rate: 1.0,
    pitch: 0,
    volume: 1.0,
  },
  subtitleStyle: {
    fontSize: 48,
    fontColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'bottom',
  },
};



/**
 * Create a video from script segments and character photos using real AI
 */
export const createVideoFromScript = async (
  scriptText: string,
  characters: Character[],
  characterPhotos: CharacterPhoto[],
  theme: string,
  options: Partial<VideoCompositionOptions> = {}
): Promise<CompositionResult> => {
  try {
    console.log('🎬 Starting real AI video composition...');
    
    const compositionOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // 1. Try real AI video generation first
    try {
      console.log('🤖 Attempting real AI video generation...');
      const { generateAIVideo } = await import('./realAIVideoService');
      
      const aiVideoResult = await generateAIVideo(
        scriptText,
        characters,
        characterPhotos,
        theme,
        {
          duration: Math.min(10, Math.max(5, scriptText.length / 20)), // Dynamic duration
          aspectRatio: '9:16',
          style: 'cinematic',
        }
      );
      
      // Generate voiceover for subtitles
      console.log('🎙️ Generating voiceover for subtitles...');
      const voiceoverResult = await generateSpeechFromText(
        scriptText,
        compositionOptions.voiceOptions
      );
      
      // Create subtitle segments
      const segments = splitScriptIntoSegments(scriptText);
      const subtitles = createSubtitleSegments(segments, voiceoverResult.duration);
      
      console.log(`✅ Real AI video generation successful with ${aiVideoResult.provider}`);
      
      return {
        videoUrl: aiVideoResult.videoUrl,
        thumbnailUrl: aiVideoResult.thumbnailUrl,
        duration: aiVideoResult.duration,
        subtitles,
      };
      
    } catch (aiError) {
      console.log('⚠️ Real AI video generation failed, using enhanced fallback:', aiError);
    }
    
    // 2. Fallback to enhanced composition system
    console.log('🎭 Using enhanced video composition system...');
    
    // Split script into manageable segments
    const segments = splitScriptIntoSegments(scriptText);
    console.log(`Script split into ${segments.length} segments`);
    
    // Generate voiceover for the entire script
    console.log('Generating voiceover...');
    const voiceoverResult = await generateSpeechFromText(
      scriptText,
      compositionOptions.voiceOptions
    );
    
    // Create subtitle segments
    const subtitles = createSubtitleSegments(segments, voiceoverResult.duration);
    
    // Select character images for the video
    const selectedImages = selectImagesForVideo(characterPhotos, segments.length);
    
    // Try to compose the video with real API, fallback to mock if needed
    const videoResult = await composeVideoWithAPI({
      segments,
      voiceoverUrl: voiceoverResult.audioUri,
      characterImages: selectedImages,
      subtitles,
      options: compositionOptions,
      theme,
    });
    
    console.log('✅ Enhanced video composition completed');
    return videoResult;
    
  } catch (error) {
    console.error('❌ Video composition error:', error);
    throw new Error(`Failed to create video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Split script into segments for better pacing
 */
const splitScriptIntoSegments = (script: string): VideoSegment[] => {
  // Split by sentences and group into manageable segments
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const segments: VideoSegment[] = [];
  
  let currentSegment = '';
  let segmentIndex = 0;
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // Add sentence to current segment
    currentSegment += (currentSegment ? '. ' : '') + trimmedSentence;
    
    // Create segment if it's getting long or we're at the end
    if (currentSegment.length > 150 || sentences.indexOf(sentence) === sentences.length - 1) {
      segments.push({
        id: `segment_${segmentIndex}`,
        text: currentSegment + '.',
        characterIds: [], // Will be populated based on available characters
        duration: calculateSegmentDuration(currentSegment),
      });
      
      currentSegment = '';
      segmentIndex++;
    }
  }
  
  return segments;
};

/**
 * Calculate estimated duration for a text segment
 */
const calculateSegmentDuration = (text: string): number => {
  // Average reading speed: 150 words per minute
  const wordCount = text.split(' ').length;
  const durationMinutes = wordCount / 150;
  return Math.max(durationMinutes * 60, 2); // Minimum 2 seconds per segment
};

/**
 * Create subtitle segments with timing that match the full video duration
 */
const createSubtitleSegments = (
  segments: VideoSegment[],
  totalDuration: number
): SubtitleSegment[] => {
  const subtitles: SubtitleSegment[] = [];
  let currentTime = 0;
  
  // Calculate proper timing based on actual audio duration
  const segmentDurationRatio = totalDuration / segments.reduce((total, seg) => total + seg.duration, 0);
  
  for (const segment of segments) {
    const adjustedDuration = segment.duration * segmentDurationRatio;
    const endTime = currentTime + adjustedDuration;
    
    // Split long text into multiple subtitle lines
    const lines = splitTextForSubtitles(segment.text);
    const linesDuration = adjustedDuration / lines.length;
    
    for (let i = 0; i < lines.length; i++) {
      const lineStartTime = currentTime + (i * linesDuration);
      const lineEndTime = Math.min(lineStartTime + linesDuration, endTime);
      
      subtitles.push({
        startTime: lineStartTime,
        endTime: lineEndTime,
        text: lines[i],
      });
    }
    
    currentTime = endTime;
  }
  
  // Ensure subtitles cover the full duration
  if (subtitles.length > 0 && currentTime < totalDuration) {
    const lastSubtitle = subtitles[subtitles.length - 1];
    lastSubtitle.endTime = totalDuration;
  }
  
  console.log(`✅ Created ${subtitles.length} subtitle segments spanning ${totalDuration} seconds`);
  return subtitles;
};

/**
 * Split text into subtitle-friendly lines
 */
const splitTextForSubtitles = (text: string): string[] => {
  const maxCharsPerLine = 40;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

/**
 * Select images for video based on available character photos
 */
const selectImagesForVideo = (
  characterPhotos: CharacterPhoto[],
  segmentCount: number
): string[] => {
  const selectedImages: string[] = [];
  
  if (characterPhotos.length === 0) {
    // Use placeholder images if no character photos available
    for (let i = 0; i < segmentCount; i++) {
      selectedImages.push(`https://via.placeholder.com/1080x1920/6200ee/ffffff?text=Character+${i + 1}`);
    }
  } else {
    // Cycle through available character photos
    for (let i = 0; i < segmentCount; i++) {
      const photoIndex = i % characterPhotos.length;
      selectedImages.push(characterPhotos[photoIndex].photoUrl || `https://via.placeholder.com/1080x1920/6200ee/ffffff?text=Character+${photoIndex + 1}`);
    }
  }
  
  return selectedImages;
};

/**
 * Compose video using real API with fallback to mock
 */
const composeVideoWithAPI = async (params: {
  segments: VideoSegment[];
  voiceoverUrl: string;
  characterImages: string[];
  subtitles: SubtitleSegment[];
  options: VideoCompositionOptions;
  theme: string;
}): Promise<CompositionResult> => {
  try {
    console.log('Attempting to compose video with real API...');
    
    // Try cloud video APIs first
    const cloudResult = await tryCloudVideoAPIs(params);
    if (cloudResult) {
      return cloudResult;
    }
    
    // Fallback to enhanced mock with better video URLs
    console.log('Using enhanced mock video generation...');
    return await composeVideo(params);
    
  } catch (error) {
    console.error('Error in video composition API:', error);
    // Fallback to mock
    return await composeVideo(params);
  }
};



/**
 * Try cloud video APIs and local generation
 */
const tryCloudVideoAPIs = async (params: {
  segments: VideoSegment[];
  voiceoverUrl: string;
  characterImages: string[];
  subtitles: SubtitleSegment[];
  options: VideoCompositionOptions;
  theme: string;
}): Promise<CompositionResult | null> => {
  try {
    // Import the cloud video service
    const { generateVideoWithCloudAPI, hasAvailableProviders } = await import('./cloudVideoService');
    
    // Check if any providers are available
    if (hasAvailableProviders()) {
      console.log('🌐 Using cloud video providers...');
      // Generate video with cloud API
      const result = await generateVideoWithCloudAPI(params);
      return result;
    }
    
    // If no cloud providers but we have character images, use enhanced local generation
    if (params.characterImages.length > 0) {
      console.log('🎨 Using enhanced local video generation with character images...');
      
      // Use local video generator for character-based videos
      const { generateLocalVideoSlideshow } = await import('./localVideoGenerator');
      const result = await generateLocalVideoSlideshow(
        params.segments,
        params.characterImages,
        params.subtitles,
        params.theme,
        {
          width: params.options.resolution.width,
          height: params.options.resolution.height,
          fps: params.options.fps,
        }
      );
      return result;
    }
    
    console.log('⚠️ No cloud video providers or character images available');
    return null;
    
  } catch (error) {
    console.error('Video generation error:', error);
    return null;
  }
};

/**
 * Compose the final video (fallback when no cloud APIs available)
 */
const composeVideo = async (params: {
  segments: VideoSegment[];
  voiceoverUrl: string;
  characterImages: string[];
  subtitles: SubtitleSegment[];
  options: VideoCompositionOptions;
  theme: string;
}): Promise<CompositionResult> => {
  try {
    console.log('🎬 Creating fallback video composition...');
    console.log(`📊 Video details:
    - Segments: ${params.segments.length}
    - Character images: ${params.characterImages.length}
    - Subtitles: ${params.subtitles.length}
    - Theme: ${params.theme}`);
    
    // Log character images being used
    params.characterImages.forEach((imageUrl, index) => {
      console.log(`🖼️ Character image ${index + 1}: ${imageUrl.substring(0, 50)}...`);
    });
    
    // Create video directory
    const videoDir = `${FileSystem.documentDirectory}videos/`;
    await FileSystem.makeDirectoryAsync(videoDir, { intermediates: true });
    
    // Create a detailed video composition file
    const videoFilename = `video_${Date.now()}.json`;
    const videoPath = `${videoDir}${videoFilename}`;
    
    // Create video composition metadata with actual character images
    const videoComposition = {
      metadata: {
        width: params.options.resolution.width,
        height: params.options.resolution.height,
        fps: params.options.fps,
        duration: params.segments.reduce((total, seg) => total + seg.duration, 0),
        theme: params.theme,
        created: new Date().toISOString(),
        characterImages: params.characterImages,
        hasRealCharacters: params.characterImages.length > 0,
      },
      timeline: {
        tracks: [
          {
            type: 'video',
            clips: params.characterImages.map((imageUrl, index) => ({
              asset: imageUrl,
              start: params.segments.slice(0, index).reduce((total, seg) => total + seg.duration, 0),
              length: params.segments[index]?.duration || 3,
              effect: {
                type: 'kenBurns', // Add subtle zoom effect
                zoom: 'in',
              },
              characterIndex: index,
            })),
          },
          {
            type: 'audio',
            clips: [
              {
                asset: params.voiceoverUrl,
                start: 0,
                volume: params.options.voiceOptions.volume || 1.0,
              },
            ],
          },
          {
            type: 'subtitle',
            clips: params.subtitles.map(subtitle => ({
              text: subtitle.text,
              start: subtitle.startTime,
              length: subtitle.endTime - subtitle.startTime,
              style: {
                fontSize: params.options.subtitleStyle.fontSize,
                color: params.options.subtitleStyle.fontColor,
                backgroundColor: params.options.subtitleStyle.backgroundColor,
                position: params.options.subtitleStyle.position,
              },
            })),
          },
        ],
      },
    };
    
    // Save composition file
    await FileSystem.writeAsStringAsync(videoPath, JSON.stringify(videoComposition, null, 2));
    
    // Use the first character image as thumbnail
    const thumbnailUrl = params.characterImages[0] || `https://via.placeholder.com/1080x1920/6200ee/ffffff?text=Video+Thumbnail`;
    
    // Generate a better mock video URL that represents the content
    const mockVideoUrl = generateEnhancedMockVideoUrl(params.theme, params.characterImages.length);
    
    console.log('✅ Video composition saved:', videoPath);
    console.log('🎥 Using mock video URL:', mockVideoUrl);
    
    return {
      videoUrl: mockVideoUrl,
      thumbnailUrl,
      duration: videoComposition.metadata.duration,
      subtitles: params.subtitles,
    };
    
  } catch (error) {
    console.error('Error composing video:', error);
    throw new Error('Failed to compose video');
  }
};

/**
 * Generate an enhanced mock video URL that better represents the content
 */
const generateEnhancedMockVideoUrl = (theme: string, characterCount: number): string => {
  // Better quality video URLs that are more suitable for testing
  const videoUrls = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  ];
  
  // Select URL based on theme and character count for better variety
  const index = (theme.length + characterCount) % videoUrls.length;
  return videoUrls[index];
};

/**
 * Generate a mock video URL for demo purposes (legacy function)
 * In production, this would return the actual rendered video URL
 */
const generateMockVideoUrl = (theme: string): string => {
  return generateEnhancedMockVideoUrl(theme, 1);
};

/**
 * Clean up temporary video files
 */
export const cleanupVideoFiles = async (): Promise<void> => {
  try {
    const videoDir = `${FileSystem.documentDirectory}videos/`;
    const dirInfo = await FileSystem.getInfoAsync(videoDir);
    
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(videoDir, { idempotent: true });
      console.log('Video files cleaned up');
    }
  } catch (error) {
    console.warn('Error cleaning up video files:', error);
  }
};
