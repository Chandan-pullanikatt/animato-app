/**
 * Text-to-Speech Service
 * Handles voice generation for scripts using Expo Speech API
 */

import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export interface VoiceOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export interface TTSResult {
  audioUri: string;
  duration: number;
  text: string;
}

/**
 * Generate speech from text using Expo Speech API
 */
export const generateSpeechFromText = async (
  text: string,
  options: VoiceOptions = {}
): Promise<TTSResult> => {
  try {
    console.log('Generating speech for text:', text.substring(0, 100) + '...');
    
    const {
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      language = 'en-US'
    } = options;

    // Create audio directory
    const audioDir = `${FileSystem.documentDirectory}audio/`;
    await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `speech_${timestamp}.wav`;
    const audioUri = `${audioDir}${filename}`;
    
    // For now, we'll use expo-speech for immediate playback
    // and create a metadata file for the audio
    const speechOptions = {
      language,
      pitch,
      rate,
      onStart: () => console.log('Speech started'),
      onDone: () => console.log('Speech completed'),
      onStopped: () => console.log('Speech stopped'),
      onError: (error: any) => console.error('Speech error:', error),
    };
    
    // Create audio metadata file
    const audioMetadata = {
      text,
      options: speechOptions,
      duration: calculateEstimatedDuration(text, rate),
      created: new Date().toISOString(),
      uri: audioUri,
    };
    
    // Save metadata as JSON (in production, this would be actual audio file)
    await FileSystem.writeAsStringAsync(audioUri, JSON.stringify(audioMetadata, null, 2));
    
    console.log('Speech metadata saved:', audioUri);
    
    return {
      audioUri,
      duration: audioMetadata.duration,
      text,
    };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech from text');
  }
};

/**
 * Play text using expo-speech for immediate audio feedback
 */
export const speakText = async (
  text: string,
  options: VoiceOptions = {}
): Promise<void> => {
  try {
    const {
      rate = 1.0,
      pitch = 1.0,
      language = 'en-US'
    } = options;

    // Stop any currently playing speech
    await Speech.stop();
    
    // Speak the text
    await Speech.speak(text, {
      language,
      pitch,
      rate,
    });
  } catch (error) {
    console.error('Error speaking text:', error);
    throw new Error('Failed to speak text');
  }
};

/**
 * Stop any currently playing speech
 */
export const stopSpeech = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn('Error stopping speech:', error);
  }
};

/**
 * Calculate estimated duration based on text length and speech speed
 */
const calculateEstimatedDuration = (text: string, rate: number): number => {
  // Average reading speed is about 150-200 words per minute
  const wordsPerMinute = 150 * rate;
  const wordCount = text.split(' ').length;
  const durationMinutes = wordCount / wordsPerMinute;
  return Math.max(durationMinutes * 60, 1); // Minimum 1 second
};

/**
 * Generate speech for multiple text segments
 */
export const generateSpeechForSegments = async (
  textSegments: string[],
  options: VoiceOptions = {}
): Promise<TTSResult[]> => {
  const results: TTSResult[] = [];
  
  for (let i = 0; i < textSegments.length; i++) {
    const segment = textSegments[i];
    console.log(`Generating speech for segment ${i + 1}/${textSegments.length}`);
    
    const result = await generateSpeechFromText(segment, options);
    results.push(result);
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
};

/**
 * Combine multiple audio files into one
 */
export const combineAudioFiles = async (audioUris: string[]): Promise<string> => {
  try {
    console.log('Combining audio files:', audioUris.length);
    
    // For demo purposes, we'll just return the first audio file
    // In production, you would use audio processing libraries to combine files
    if (audioUris.length === 0) {
      throw new Error('No audio files to combine');
    }
    
    // Create combined audio directory
    const audioDir = `${FileSystem.documentDirectory}audio/combined/`;
    await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
    
    const combinedFilename = `combined_${Date.now()}.txt`;
    const combinedPath = `${audioDir}${combinedFilename}`;
    
    // Placeholder: combine text files (in production, combine actual audio)
    let combinedText = '';
    for (const uri of audioUris) {
      try {
        const content = await FileSystem.readAsStringAsync(uri);
        combinedText += content + ' ';
      } catch (error) {
        console.warn('Error reading audio file:', uri, error);
      }
    }
    
    await FileSystem.writeAsStringAsync(combinedPath, combinedText);
    console.log('Combined audio file created:', combinedPath);
    
    return combinedPath;
  } catch (error) {
    console.error('Error combining audio files:', error);
    throw new Error('Failed to combine audio files');
  }
};

/**
 * Clean up temporary audio files
 */
export const cleanupAudioFiles = async (): Promise<void> => {
  try {
    const audioDir = `${FileSystem.documentDirectory}audio/`;
    const dirInfo = await FileSystem.getInfoAsync(audioDir);
    
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(audioDir, { idempotent: true });
      console.log('Audio files cleaned up');
    }
  } catch (error) {
    console.warn('Error cleaning up audio files:', error);
  }
};
