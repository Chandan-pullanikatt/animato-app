import { ScriptSegment, Character, ProcessedSegment } from '../types/segment';
import { generateCharacterImages, generateVideo } from './api';

/**
 * Generate sample content for an empty segment
 */
export const generateSampleContentForSegment = (title: string, index: number): string => {
  // Basic sample contents based on common segment titles
  if (title.toLowerCase().includes('introduction') || title.toLowerCase().includes('intro')) {
    return 'This introduction sets up the main topic and gives a brief overview of what will be covered in this video. It engages the audience with an interesting hook and establishes the tone for the rest of the content.';
  } else if (title.toLowerCase().includes('conclusion')) {
    return 'This conclusion summarizes the key points discussed in the video and provides a call to action for the audience. It leaves viewers with final thoughts and encourages engagement.';
  } else if (title.toLowerCase().includes('main point') || title.toLowerCase().includes('key point')) {
    return `This segment explores the ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'next'} key point in detail, providing examples and evidence to support the argument. It builds upon previous segments and leads naturally to the next topic.`;
  } else if (title.toLowerCase().includes('example') || title.toLowerCase().includes('case study')) {
    return 'This segment presents a detailed example or case study that illustrates the main concepts. It provides concrete evidence and helps the audience understand the practical applications of the ideas being discussed.';
  } else if (title.toLowerCase().includes('background') || title.toLowerCase().includes('context')) {
    return 'This segment provides necessary background information and context for the topic. It helps viewers understand why this subject matters and how it fits into the broader picture.';
  } else {
    return `This segment covers ${title} in detail, explaining the core concepts and their significance. It presents information in a clear, engaging manner that helps viewers understand and retain the material.`;
  }
};

/**
 * Generates characters based on the content of a segment
 */
export const generateCharactersForSegment = async (
  content: string,
  setIsLoading: (loading: boolean) => void,
  setCharacters: (characters: Character[]) => void
): Promise<void> => {
  // Extract potential characters from the script
  setIsLoading(true);
  
  try {
    // Create placeholder characters based on content analysis
    // This is a simplified example - in a real app this would call the AI API
    const contentLower = content.toLowerCase();
    const newCharacters: Character[] = [];
    
    // Sample character extraction logic
    if (contentLower.includes('interview') || contentLower.includes('conversation')) {
      newCharacters.push({
        id: 'host-1',
        name: 'Host',
        description: 'An engaging and knowledgeable host who guides the conversation',
        traits: ['articulate', 'friendly', 'professional'],
        imageUrl: null
      });
      
      newCharacters.push({
        id: 'guest-1',
        name: 'Guest Expert',
        description: 'A subject matter expert with deep knowledge of the topic',
        traits: ['knowledgeable', 'experienced', 'insightful'],
        imageUrl: null
      });
    } else if (contentLower.includes('tutorial') || contentLower.includes('guide') || contentLower.includes('how to')) {
      newCharacters.push({
        id: 'instructor-1',
        name: 'Instructor',
        description: 'A clear and patient instructor who explains concepts well',
        traits: ['educational', 'precise', 'helpful'],
        imageUrl: null
      });
    } else if (contentLower.includes('story') || contentLower.includes('narrative')) {
      newCharacters.push({
        id: 'narrator-1',
        name: 'Narrator',
        description: 'A compelling storyteller with an engaging voice',
        traits: ['expressive', 'articulate', 'captivating'],
        imageUrl: null
      });
      
      newCharacters.push({
        id: 'char-1',
        name: 'Main Character',
        description: 'The protagonist of the story around whom the narrative revolves',
        traits: ['relatable', 'dynamic', 'memorable'],
        imageUrl: null
      });
    } else {
      // Default presenter for all other content types
      newCharacters.push({
        id: 'presenter-1',
        name: 'Presenter',
        description: 'A confident and knowledgeable presenter who explains the content clearly',
        traits: ['clear', 'authoritative', 'engaging'],
        imageUrl: null
      });
    }
    
    setCharacters(newCharacters);
  } catch (error) {
    console.error('Error generating characters:', error);
    // Set some fallback characters
    setCharacters([{
      id: 'default-1',
      name: 'Default Presenter',
      description: 'A default presenter for the video',
      traits: ['professional', 'clear'],
      imageUrl: null
    }]);
  } finally {
    setIsLoading(false);
  }
};

/**
 * Generates photos for characters using the AI API
 */
export const generatePhotosForCharacters = async (
  characters: Character[],
  videoTheme: string,
  setIsLoading: (loading: boolean) => void,
  setCharacters: (characters: Character[]) => void
): Promise<void> => {
  if (characters.length === 0) {
    return;
  }
  
  setIsLoading(true);
  
  try {
    const result = await generateCharacterImages(characters, videoTheme);
    
    if (result && result.characters) {
      setCharacters(result.characters);
    } else {
      throw new Error('Failed to generate character images');
    }
  } catch (error) {
    console.error('Error generating photos:', error);
  } finally {
    setIsLoading(false);
  }
};

/**
 * Generates a video for the segment using the AI API
 */
export const generateVideoForSegment = async (
  segment: ScriptSegment,
  charactersWithImages: Character[],
  videoTheme: string,
  setIsLoading: (loading: boolean) => void,
  setVideoUrl: (url: string | null) => void
): Promise<void> => {
  if (charactersWithImages.length === 0) {
    return;
  }
  
  setIsLoading(true);
  
  try {
    const videoResult = await generateVideo(
      segment.content,
      [{ title: segment.title, content: segment.content }],
      charactersWithImages,
      videoTheme
    );
    
    if (videoResult && videoResult.videoUrl) {
      setVideoUrl(videoResult.videoUrl);
    } else {
      throw new Error('Failed to generate video');
    }
  } catch (error) {
    console.error('Error generating video:', error);
  } finally {
    setIsLoading(false);
  }
};
