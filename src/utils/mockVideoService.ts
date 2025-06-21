/**
 * Mock Video Service
 * Provides realistic video generation simulation for development and testing
 */

import * as FileSystem from 'expo-file-system';
import { CompositionResult, SubtitleSegment } from './videoCompositionService';

/**
 * Generate a demo video with proper timing and subtitles
 * This simulates the video generation process for development
 */
export const generateDemoVideo = async (
  script: string,
  theme: string,
  characterImageUrls: string[]
): Promise<CompositionResult> => {
  try {
    console.log('Generating demo video...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create realistic subtitle segments based on script
    const subtitles = createSubtitlesFromScript(script);
    
    // Calculate total duration based on script length
    const totalDuration = calculateVideoDuration(script);
    
    // Select video URL based on theme
    const videoUrl = selectVideoByTheme(theme);
    
    // Generate thumbnail from first character image or placeholder
    const thumbnailUrl = characterImageUrls[0] || `https://via.placeholder.com/1080x1920/6200ee/ffffff?text=${encodeURIComponent(theme)}`;
    
    console.log('Demo video generated successfully');
    
    return {
      videoUrl,
      thumbnailUrl,
      duration: totalDuration,
      subtitles,
    };
  } catch (error) {
    console.error('Error generating demo video:', error);
    throw new Error('Failed to generate demo video');
  }
};

/**
 * Create subtitle segments from script text
 */
const createSubtitlesFromScript = (script: string): SubtitleSegment[] => {
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const subtitles: SubtitleSegment[] = [];
  
  let currentTime = 0;
  const averageWordsPerMinute = 150; // Average reading speed
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // Calculate duration for this sentence
    const wordCount = trimmedSentence.split(' ').length;
    const durationMinutes = wordCount / averageWordsPerMinute;
    const duration = Math.max(durationMinutes * 60, 2); // Minimum 2 seconds
    
    // Split long sentences into multiple subtitle lines
    const lines = splitSentenceForSubtitles(trimmedSentence);
    const lineDuration = duration / lines.length;
    
    for (const line of lines) {
      subtitles.push({
        startTime: currentTime,
        endTime: currentTime + lineDuration,
        text: line,
      });
      currentTime += lineDuration;
    }
  }
  
  return subtitles;
};

/**
 * Split long sentences into subtitle-friendly lines
 */
const splitSentenceForSubtitles = (sentence: string): string[] => {
  const maxCharsPerLine = 50;
  const words = sentence.split(' ');
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
  
  return lines.length > 0 ? lines : [sentence];
};

/**
 * Calculate video duration based on script length
 */
const calculateVideoDuration = (script: string): number => {
  const wordCount = script.split(' ').length;
  const averageWordsPerMinute = 150;
  const durationMinutes = wordCount / averageWordsPerMinute;
  return Math.max(durationMinutes * 60, 10); // Minimum 10 seconds
};

/**
 * Select video URL based on theme
 */
const selectVideoByTheme = (theme: string): string => {
  const videoMap: Record<string, string> = {
    'Educational': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'Entertainment': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'Marketing': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'Social Media': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'Business': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'Tutorial': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  };
  
  return videoMap[theme] || videoMap['Educational'];
};

/**
 * Create a sample script for testing
 */
export const createSampleScript = (): string => {
  return `Welcome to our amazing story! This is where our adventure begins. 
Our characters are about to embark on an incredible journey that will change their lives forever. 
Through challenges and triumphs, they will discover the true meaning of friendship and courage. 
Join us as we explore this fascinating world filled with wonder and excitement. 
The story unfolds with each passing moment, revealing new mysteries and surprises. 
Don't miss a single second of this captivating tale that will keep you on the edge of your seat!`;
};

/**
 * Create sample character images for testing
 */
export const createSampleCharacterImages = (): string[] => {
  return [
    'https://via.placeholder.com/512x512/6200ee/ffffff?text=Hero',
    'https://via.placeholder.com/512x512/ff6200/ffffff?text=Sidekick',
    'https://via.placeholder.com/512x512/00b4d8/ffffff?text=Mentor',
  ];
};
