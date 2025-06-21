/**
 * Photo Generation API Module
 * Handles all API calls related to photo generation with AI integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from '../config/env';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Character } from './characterGenerationAPI';
import { generateAIImage, AIImageRequest } from './aiImageService';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
const modelWithImages = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Types
export interface PhotoOption {
  id: string;
  url: string;
  selected: boolean;
  style?: string;
  prompt?: string;
}

export interface CharacterPhoto {
  characterId: string;
  characterName: string;
  photoUrl: string | null;
  style?: string;
}

// Human photo datasets for realistic characters
const HUMAN_PHOTO_SEEDS: Record<string, string[]> = {
  male: [
    'professional-man-1', 'business-man-2', 'casual-man-3', 'young-man-4', 'mature-man-5',
    'athlete-man-6', 'artist-man-7', 'scientist-man-8', 'teacher-man-9', 'doctor-man-10'
  ],
  female: [
    'professional-woman-1', 'business-woman-2', 'casual-woman-3', 'young-woman-4', 'mature-woman-5',
    'athlete-woman-6', 'artist-woman-7', 'scientist-woman-8', 'teacher-woman-9', 'doctor-woman-10'
  ],
  neutral: [
    'person-1', 'individual-2', 'character-3', 'human-4', 'portrait-5',
    'face-6', 'profile-7', 'headshot-8', 'photo-9', 'image-10'
  ]
};

/**
 * Generate a detailed prompt for character image generation based on video style
 */
async function generateImagePrompt(character: Character, videoStyle: string, contentTheme: string): Promise<string> {
  try {
    const prompt = `Create a detailed description for generating a realistic human portrait photo with the following specifications:

Character Details:
- Name: ${character.name}
- Description: ${character.description}
- Personality Traits: ${character.traits.join(', ')}

Video Style: ${videoStyle}
Content Theme: ${contentTheme}

Style Guidelines:
${getStyleGuidelines(videoStyle)}

Requirements:
1. The image must feature a real human person (not cartoon, anime, or illustration unless specifically requested)
2. High-quality portrait photography
3. Professional lighting and composition
4. Age-appropriate appearance based on character description
5. Clothing and styling that matches the ${contentTheme} theme
6. Expression and pose that reflects the character's personality

Generate a detailed prompt that an AI image generator can use to create this realistic human portrait. Focus on photographic terms, lighting, composition, and realistic human features.

Respond with ONLY the image generation prompt. Do not include explanations or formatting.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (apiError) {
      console.log('Using fallback image prompt due to API error');
      return getAdvancedImagePrompt(character, videoStyle, contentTheme);
    }
  } catch (error) {
    console.log('Using fallback image prompt due to error');
    return getAdvancedImagePrompt(character, videoStyle, contentTheme);
  }
}

/**
 * Get style-specific guidelines for image generation
 */
function getStyleGuidelines(videoStyle: string): string {
  switch (videoStyle) {
    case 'realistic':
      return `- Photorealistic human portrait
- Natural lighting and skin tones
- Professional photography quality
- Realistic facial features and expressions
- Contemporary clothing and styling`;
    
    case 'anime':
      return `- Anime-style character design
- Large expressive eyes
- Stylized hair and features
- Vibrant colors and clean lines
- Japanese animation aesthetic`;
    
    case 'comic':
      return `- Comic book art style
- Bold outlines and dramatic shading
- Dynamic poses and expressions
- Vibrant, saturated colors
- Superhero/comic book aesthetic`;
    
    case 'cyberpunk':
      return `- Futuristic cyberpunk aesthetic
- Neon lighting and dark atmosphere
- High-tech clothing and accessories
- Urban, dystopian background elements
- Metallic and electric color palette`;
    
    case 'fantasy':
      return `- Fantasy art style
- Magical or mystical elements
- Period-appropriate fantasy clothing
- Ethereal lighting and atmosphere
- Rich, warm color palette`;
    
    case 'noir':
      return `- Film noir aesthetic
- Black and white or desaturated colors
- Dramatic shadows and lighting
- 1940s-1950s styling and clothing
- Moody, atmospheric composition`;
    
    default:
      return `- High-quality portrait photography
- Professional lighting and composition
- Realistic human features
- Appropriate styling for the theme`;
  }
}

/**
 * Get an advanced image prompt when API fails
 */
function getAdvancedImagePrompt(character: Character, videoStyle: string, contentTheme: string): string {
  const gender = detectGender(character);
  const age = detectAge(character);
  
  let basePrompt = `Professional portrait photograph of a ${age} ${gender}`;
  
  // Add character-specific details
  if (character.description) {
    basePrompt += `, ${character.description.toLowerCase()}`;
  }
  
  // Add personality-based appearance
  if (character.traits && character.traits.length > 0) {
    const traits = character.traits.slice(0, 3).join(', ').toLowerCase();
    basePrompt += `, with a ${traits} appearance`;
  }
  
  // Add style-specific elements
  basePrompt += `, ${getStyleSpecificPrompt(videoStyle)}`;
  
  // Add theme-specific elements
  basePrompt += `, ${getThemeSpecificPrompt(contentTheme)}`;
  
  // Add technical specifications
  basePrompt += `, high resolution, professional lighting, sharp focus, detailed facial features`;
  
  return basePrompt;
}

/**
 * Detect gender from character description
 */
function detectGender(character: Character): string {
  // First check the explicit gender field
  if (character.gender) {
    if (character.gender.toLowerCase() === 'female') return 'woman';
    if (character.gender.toLowerCase() === 'male') return 'man';
  }
  
  const description = (character.description + ' ' + character.name + ' ' + (character.appearance || '')).toLowerCase();
  
  // More comprehensive gender detection
  const femaleIndicators = ['woman', 'female', 'she', 'her', 'girl', 'lady', 'ms', 'mrs', 'miss'];
  const maleIndicators = ['man', 'male', 'he', 'his', 'him', 'boy', 'guy', 'mr', 'sir'];
  
  const femaleCount = femaleIndicators.filter(indicator => description.includes(indicator)).length;
  const maleCount = maleIndicators.filter(indicator => description.includes(indicator)).length;
  
  if (femaleCount > maleCount) {
    return 'woman';
  } else if (maleCount > femaleCount) {
    return 'man';
  }
  
  return 'person';
}

/**
 * Detect age from character description
 */
function detectAge(character: Character): string {
  const description = (character.description + ' ' + character.traits.join(' ')).toLowerCase();
  
  if (description.includes('young') || description.includes('teen') || description.includes('student')) {
    return 'young';
  } else if (description.includes('old') || description.includes('elderly') || description.includes('senior')) {
    return 'elderly';
  } else if (description.includes('middle') || description.includes('mature')) {
    return 'middle-aged';
  }
  
  return 'adult';
}

/**
 * Get style-specific prompt elements
 */
function getStyleSpecificPrompt(videoStyle: string): string {
  switch (videoStyle) {
    case 'realistic':
      return 'photorealistic style, natural lighting, contemporary setting';
    case 'anime':
      return 'anime art style, large expressive eyes, stylized features';
    case 'comic':
      return 'comic book art style, bold colors, dynamic composition';
    case 'cyberpunk':
      return 'cyberpunk aesthetic, neon lighting, futuristic elements';
    case 'fantasy':
      return 'fantasy art style, magical atmosphere, ethereal lighting';
    case 'noir':
      return 'film noir style, dramatic shadows, monochromatic tones';
    default:
      return 'professional photography style';
  }
}

/**
 * Get theme-specific prompt elements
 */
function getThemeSpecificPrompt(contentTheme: string): string {
  switch (contentTheme) {
    case 'comedy':
      return 'cheerful expression, bright and colorful setting';
    case 'drama':
      return 'emotional expression, dramatic lighting';
    case 'action':
      return 'confident pose, dynamic background';
    case 'romance':
      return 'soft expression, warm lighting, romantic atmosphere';
    case 'horror':
      return 'mysterious expression, dark atmospheric lighting';
    case 'adventure':
      return 'adventurous look, outdoor or exotic setting';
    case 'mystery':
      return 'intriguing expression, shadowy atmosphere';
    case 'scifi':
      return 'futuristic setting, technological elements';
    default:
      return 'appropriate thematic styling';
  }
}

/**
 * Generate realistic human photo URLs using AI-generated descriptions
 */
async function generateRealisticPhotoUrl(character: Character, videoStyle: string, contentTheme: string, index: number): Promise<string> {
  try {
    // Generate AI-enhanced description for the photo
    const photoDescription = await generateImagePrompt(character, videoStyle, contentTheme);
    
    console.log(`Generating AI photo for ${character.name} in ${videoStyle} style`);
    
    // Use the AI image service to generate the photo
    const aiImageRequest: AIImageRequest = {
      prompt: photoDescription,
      style: videoStyle,
      width: 400,
      height: 600,
      quality: 'high'
    };
    
    const aiImageResponse = await generateAIImage(aiImageRequest);
    
    console.log(`Generated AI photo for ${character.name}: ${aiImageResponse.url.substring(0, 50)}...`);
    
    return aiImageResponse.url;
  } catch (error) {
    console.log(`Error generating AI photo for ${character.name}, using fallback:`, error);
    return generateFallbackPhotoUrl(character, index);
  }
}

/**
 * Generate AI-based photo seed using character description
 */
async function generatePhotoSeed(character: Character, videoStyle: string, contentTheme: string): Promise<string> {
  try {
    const prompt = `Generate a unique identifier seed for a ${videoStyle} style photo of ${character.name}.
    
Character: ${character.description}
Traits: ${character.traits.join(', ')}
Style: ${videoStyle}
Theme: ${contentTheme}

Create a short, unique identifier (5-10 characters) that captures the essence of this character for photo generation.
Respond with ONLY the identifier, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const seed = response.text().trim().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    
    return seed || `${character.id}-${Date.now()}`.substring(0, 10);
  } catch (error) {
    // Fallback seed generation
    return `${character.id.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`.substring(0, 10);
  }
}

/**
 * Generate fallback photo URL when AI fails
 */
function generateFallbackPhotoUrl(character: Character, index: number): string {
  const gender = detectGender(character);
  const seeds = HUMAN_PHOTO_SEEDS[gender] || HUMAN_PHOTO_SEEDS.neutral;
  const seed = seeds[index % seeds.length];
  
  // Use high-quality stock photo services as fallback
  const fallbackServices = [
    `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face&auto=format&q=80&seed=${seed}`,
    `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face&auto=format&q=80&seed=${seed}`,
    `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face&auto=format&q=80&seed=${seed}`,
    `https://picsum.photos/seed/portrait-${seed}-${character.id}-${index}/400/600`
  ];
  
  return fallbackServices[index % fallbackServices.length];
}

/**
 * Generate multiple photo options for a character with AI-enhanced prompts
 */
export const generateCharacterPhotos = async (
  character: Character,
  videoStyle: string,
  contentTheme: string,
  numberOfOptions: number = 3
): Promise<PhotoOption[]> => {
  console.log('Generating AI-enhanced photos for character:', character.name, 'Style:', videoStyle);
  
  try {
    // Generate AI-enhanced prompt
    const aiPrompt = await generateImagePrompt(character, videoStyle, contentTheme);
    console.log('Generated AI prompt for', character.name, ':', aiPrompt.substring(0, 100) + '...');
    
    // Create photo options with enhanced styling
    return await generateEnhancedPhotoOptions(character, videoStyle, contentTheme, numberOfOptions, aiPrompt);
  } catch (error) {
    console.log('Using fallback photos for character:', character.name);
    return await generateEnhancedPhotoOptions(character, videoStyle, contentTheme, numberOfOptions);
  }
};

/**
 * Generate enhanced photo options with style-specific URLs
 */
async function generateEnhancedPhotoOptions(
  character: Character, 
  videoStyle: string, 
  contentTheme: string, 
  numberOfOptions: number, 
  aiPrompt?: string
): Promise<PhotoOption[]> {
  const photoOptions: PhotoOption[] = [];
  
  for (let index = 0; index < numberOfOptions; index++) {
    try {
      const photoUrl = await generateRealisticPhotoUrl(character, videoStyle, contentTheme, index);
      
      photoOptions.push({
        id: `${character.id}-photo-${index}`,
        url: photoUrl,
        selected: index === 0,
        style: videoStyle,
        prompt: aiPrompt || getAdvancedImagePrompt(character, videoStyle, contentTheme)
      });
    } catch (error) {
      // Use fallback if individual photo generation fails
      const fallbackUrl = generateFallbackPhotoUrl(character, index);
      
      photoOptions.push({
        id: `${character.id}-photo-${index}`,
        url: fallbackUrl,
        selected: index === 0,
        style: videoStyle,
        prompt: aiPrompt || getAdvancedImagePrompt(character, videoStyle, contentTheme)
      });
    }
  }
  
  return photoOptions;
}

/**
 * Generate photos for all characters with enhanced AI integration
 */
export const generateAllCharacterPhotos = async (
  characters: Character[],
  videoStyle: string,
  contentTheme: string,
  optionsPerCharacter: number = 3
): Promise<Record<string, PhotoOption[]>> => {
  console.log('Generating AI-enhanced photos for all characters with style:', videoStyle);
  
  try {
    const photoOptions: Record<string, PhotoOption[]> = {};
    
    // Process each character with AI enhancement
    for (const character of characters) {
      try {
        const options = await generateCharacterPhotos(character, videoStyle, contentTheme, optionsPerCharacter);
        photoOptions[character.id] = options;
        
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (characterError) {
        console.log(`Using fallback photos for character ${character.name}`);
        photoOptions[character.id] = await generateEnhancedPhotoOptions(character, videoStyle, contentTheme, optionsPerCharacter);
      }
    }
    
    return photoOptions;
  } catch (error) {
    console.log('Using fallback photos for all characters');
    
    // Return enhanced fallback photos
    const fallbackOptions: Record<string, PhotoOption[]> = {};
    
    for (const character of characters) {
      fallbackOptions[character.id] = await generateEnhancedPhotoOptions(character, videoStyle, contentTheme, optionsPerCharacter);
    }
    
    return fallbackOptions;
  }
};

/**
 * Download an image from a URL and save it locally
 */
export const downloadImage = async (url: string): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      // For web platform, we can't download and save locally
      // Just return the URL
      return url;
    }
    
    // Create a unique filename
    const filename = FileSystem.documentDirectory + 'character_' + 
      new Date().getTime() + '.jpg';
    
    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, filename);
    
    if (downloadResult.status === 200) {
      return downloadResult.uri;
    } else {
      throw new Error('Failed to download image');
    }
  } catch (error) {
    console.error('Error downloading image:', error);
    // Return the original URL if download fails
    return url;
  }
};

/**
 * Get a placeholder image for a character (fallback)
 */
export const getPlaceholderImageForCharacter = (name: string): string => {
  // Create a deterministic seed based on the character name
  const seed = name.replace(/[^a-zA-Z0-9]/g, '');
  return `https://picsum.photos/seed/${seed}/400/600`;
};
