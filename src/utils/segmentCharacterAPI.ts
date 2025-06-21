/**
 * Segment Character API Module
 * Handles character generation for individual script segments
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from '../config/env';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Types
export interface SegmentCharacter {
  id: string;
  name: string;
  description: string;
  traits: string[];
  role: string; // Role in this specific segment
  imageUrl: string | null;
}

// Helper function to generate content safely
async function generateContent(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    // Return empty string instead of throwing error
    // This will trigger the fallback characters instead of showing an error popup
    return '';
  }
}

/**
 * Extract and generate characters from a specific script segment
 */
export const extractCharactersFromSegment = async (
  segmentContent: string,
  segmentTitle: string,
  theme: string
): Promise<SegmentCharacter[]> => {
  console.log('Extracting characters from segment:', segmentTitle);
  
  try {
    // Create default fallback characters
    const fallbackCharacters = generateFallbackCharacters(segmentTitle, theme);
    
    // Try to extract characters using AI
    const prompt = `Analyze the following script segment and extract all characters mentioned in it. 
    For each character, provide a name, a detailed description, 3-5 personality traits, and their role in this specific segment.
    
    Segment Title: ${segmentTitle}
    Script Segment:
    ${segmentContent}
    
    Theme: ${theme}
    
    Respond in this JSON format:
    [
      {
        "name": "Character Name",
        "description": "A detailed description of the character",
        "traits": ["trait1", "trait2", "trait3"],
        "role": "Character's role in this specific segment (e.g., 'Protagonist', 'Supporting Character', 'Antagonist', etc.)"
      }
      // More characters...
    ]
    
    If no characters are explicitly named in the segment, create appropriate characters that would fit this segment and theme.`;

    const response = await generateContent(prompt);
    
    // If the response is empty, use fallback characters
    if (!response) {
      console.log('Using fallback characters due to empty API response');
      return fallbackCharacters;
    }
    
    try {
      // Try to parse the response as JSON
      const characterDataArray = JSON.parse(response);
      
      if (Array.isArray(characterDataArray) && characterDataArray.length > 0) {
        return characterDataArray.map(char => ({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name: char.name || 'Unnamed Character',
          description: char.description || `A character suitable for a ${theme} theme video`,
          traits: Array.isArray(char.traits) ? char.traits.slice(0, 5) : ['Adaptable', 'Creative'],
          role: char.role || 'Supporting Character',
          imageUrl: null
        }));
      } else {
        console.log('Using fallback characters due to invalid API response format');
        return fallbackCharacters;
      }
    } catch (e) {
      console.log('Using fallback characters due to JSON parsing error');
      return fallbackCharacters;
    }
  } catch (error) {
    console.log('Using fallback characters due to extractCharactersFromSegment error');
    return generateFallbackCharacters(segmentTitle, theme);
  }
};

/**
 * Generate fallback characters for a segment when AI generation fails
 */
function generateFallbackCharacters(segmentTitle: string, theme: string): SegmentCharacter[] {
  // Create fallback character names based on theme
  let character1Name = 'Alex';
  let character2Name = 'Jordan';
  
  // Customize character names based on theme if possible
  if (theme.toLowerCase().includes('adventure')) {
    character1Name = 'Explorer Alex';
    character2Name = 'Guide Jordan';
  } else if (theme.toLowerCase().includes('scifi') || theme.toLowerCase().includes('sci-fi')) {
    character1Name = 'Captain Nova';
    character2Name = 'Engineer Zeta';
  } else if (theme.toLowerCase().includes('romance')) {
    character1Name = 'Taylor';
    character2Name = 'Riley';
  } else if (theme.toLowerCase().includes('mystery') || theme.toLowerCase().includes('detective')) {
    character1Name = 'Detective Morgan';
    character2Name = 'Witness Jamie';
  }
  
  return [
    {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      name: character1Name,
      description: `A main character in the "${segmentTitle}" segment with a unique perspective on the ${theme} theme.`,
      traits: ['Confident', 'Creative', 'Resourceful'],
      role: 'Protagonist',
      imageUrl: null
    },
    {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      name: character2Name,
      description: `A supporting character in the "${segmentTitle}" segment who adds depth to the ${theme} theme.`,
      traits: ['Supportive', 'Curious', 'Insightful'],
      role: 'Supporting Character',
      imageUrl: null
    }
  ];
}
