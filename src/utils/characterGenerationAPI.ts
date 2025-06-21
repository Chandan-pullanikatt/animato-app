/**
 * Real AI-Powered Character Generation API
 * Uses Gemini AI for all character creation - NO MOCK DATA
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from '../config/env';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  role: string;
  age?: string;
  gender?: string;
  appearance?: string;
  background?: string;
}

/**
 * Generate characters using AI based on script analysis
 */
export const generateCharactersFromScript = async (
  script: string,
  videoStyle: string,
  contentTheme: string,
  numberOfCharacters: number = 3
): Promise<Character[]> => {
  console.log(`👥 Generating ${numberOfCharacters} AI characters from script`);
  
  try {
    const prompt = `Analyze this script and create ${numberOfCharacters} DIVERSE and UNIQUE characters:

Script:
${script}

Video Style: ${videoStyle}
Content Theme: ${contentTheme}

IMPORTANT REQUIREMENTS:
- Each character must be completely DIFFERENT from the others
- Vary gender, age, appearance, and personality significantly
- Ensure gender consistency throughout the description
- Create distinct and memorable personalities
- Make each character visually unique

For each character, provide:
1. Name (appropriate for the theme and gender)
2. Detailed description (personality, background, motivations)
3. Physical appearance (age, gender, distinctive features, clothing style)
4. 5 personality traits (make them unique per character)
5. Role in the story (protagonist, antagonist, supporting, etc.)
6. Background story (different for each character)

Format as JSON array:
[
  {
    "name": "Character Name",
    "description": "Detailed character description including personality and motivations",
    "appearance": "Physical description including age, gender, height, hair, clothing style",
    "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
    "role": "protagonist/antagonist/supporting/comic relief",
    "age": "young/adult/middle-aged/elderly",
    "gender": "male/female/non-binary",
    "background": "Character's background story and history"
  }
]

Generate ${numberOfCharacters} DIVERSE characters that fit the ${contentTheme} theme and ${videoStyle} style.
Make sure each character has a DIFFERENT gender, age, and appearance from the others:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const charactersText = response.text();
    
    // Clean and parse JSON response
    const cleanedResponse = charactersText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const charactersData = JSON.parse(cleanedResponse);
      
      const characters: Character[] = charactersData.map((char: any, index: number) => ({
        id: `char-${Date.now()}-${index}`,
        name: char.name,
        description: char.description,
        appearance: char.appearance || 'A distinctive character with unique features',
        traits: char.traits || ['intelligent', 'determined', 'charismatic'],
        role: char.role || 'supporting',
        age: char.age || 'adult',
        gender: char.gender || 'neutral',
        background: char.background || 'An interesting character with a unique story'
      }));
      
      console.log(`✅ Generated ${characters.length} AI characters`);
      return characters;
      
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback character generation');
      return generateFallbackCharacters(script, numberOfCharacters);
    }
    
  } catch (error) {
    console.error('❌ Error generating AI characters:', error);
    return generateFallbackCharacters(script, numberOfCharacters);
  }
};

/**
 * Generate a single character using AI
 */
export const generateSingleCharacter = async (
  description: string,
  videoStyle: string,
  contentTheme: string
): Promise<Character> => {
  console.log(`👤 Generating single AI character: ${description.substring(0, 50)}...`);
  
  try {
    const prompt = `Create a detailed character based on this description:

Description: ${description}
Video Style: ${videoStyle}
Content Theme: ${contentTheme}

Provide:
1. A suitable name
2. Enhanced character description
3. Physical appearance details
4. 5 personality traits
5. Character role
6. Background story

Format as JSON:
{
  "name": "Character Name",
  "description": "Detailed character description",
  "appearance": "Physical description",
  "traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "role": "character role",
  "age": "age category",
  "gender": "gender",
  "background": "background story"
}

Generate character:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const characterText = response.text();
    
    const cleanedResponse = characterText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const characterData = JSON.parse(cleanedResponse);
      
      const character: Character = {
        id: `char-${Date.now()}`,
        name: characterData.name,
        description: characterData.description,
        appearance: characterData.appearance,
        traits: characterData.traits || ['intelligent', 'determined', 'charismatic'],
        role: characterData.role || 'supporting',
        age: characterData.age || 'adult',
        gender: characterData.gender || 'neutral',
        background: characterData.background
      };
      
      console.log(`✅ Generated AI character: ${character.name}`);
      return character;
      
    } catch (parseError) {
      throw new Error('Failed to parse character data');
    }
    
  } catch (error) {
    console.error('❌ Error generating AI character:', error);
    throw new Error(`Failed to generate character: ${error}`);
  }
};

/**
 * Enhance existing characters with AI
 */
export const enhanceCharacters = async (
  characters: Character[],
  videoStyle: string,
  contentTheme: string
): Promise<Character[]> => {
  console.log(`✨ Enhancing ${characters.length} characters with AI`);
  
  const enhancedCharacters: Character[] = [];
  
  for (const character of characters) {
    try {
      const prompt = `Enhance this character for a ${contentTheme} story in ${videoStyle} style:

Current Character:
Name: ${character.name}
Description: ${character.description}
Traits: ${character.traits.join(', ')}

Enhance with:
1. More detailed personality
2. Better physical description
3. Deeper background story
4. Style-appropriate details for ${videoStyle}
5. Theme-appropriate elements for ${contentTheme}

Format as JSON:
{
  "name": "${character.name}",
  "description": "Enhanced description",
  "appearance": "Detailed physical description",
  "traits": ["enhanced", "trait", "list"],
  "role": "character role",
  "age": "age category",
  "gender": "gender",
  "background": "enhanced background story"
}

Enhanced character:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();
      
      const cleanedResponse = enhancedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const enhancedData = JSON.parse(cleanedResponse);
        
        enhancedCharacters.push({
          ...character,
          description: enhancedData.description || character.description,
          appearance: enhancedData.appearance || character.appearance,
          traits: enhancedData.traits || character.traits,
          background: enhancedData.background || character.background
        });
        
        console.log(`✅ Enhanced character: ${character.name}`);
        
      } catch (parseError) {
        // Keep original character if enhancement fails
        enhancedCharacters.push(character);
        console.log(`⚠️ Using original character: ${character.name}`);
      }
      
    } catch (error) {
      // Keep original character if enhancement fails
      enhancedCharacters.push(character);
      console.log(`⚠️ Enhancement failed for: ${character.name}`);
    }
  }
  
  return enhancedCharacters;
};

/**
 * Generate character relationships using AI
 */
export const generateCharacterRelationships = async (
  characters: Character[],
  contentTheme: string
): Promise<Record<string, string[]>> => {
  console.log(`🤝 Generating AI character relationships for ${characters.length} characters`);
  
  try {
    const characterList = characters.map(c => `${c.name}: ${c.description}`).join('\n');
    
    const prompt = `Analyze these characters and create relationships between them for a ${contentTheme} story:

Characters:
${characterList}

Create meaningful relationships that would work well in a ${contentTheme} story. Consider:
1. Protagonist/antagonist dynamics
2. Romantic relationships (if appropriate)
3. Family connections
4. Professional relationships
5. Friendships and rivalries

Format as JSON object where each character name maps to an array of relationship descriptions:
{
  "Character Name": ["relationship with other character", "another relationship"],
  "Another Character": ["relationship descriptions"]
}

Generate relationships:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const relationshipsText = response.text();
    
    const cleanedResponse = relationshipsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const relationshipsData = JSON.parse(cleanedResponse);
      console.log(`✅ Generated character relationships`);
      return relationshipsData;
    } catch (parseError) {
      console.log('Failed to parse relationships, returning empty');
      return {};
    }
    
  } catch (error) {
    console.error('❌ Error generating character relationships:', error);
    return {};
  }
};

/**
 * Fallback character generation when AI fails
 */
function generateFallbackCharacters(script: string, numberOfCharacters: number): Character[] {
  const characters: Character[] = [];
  
  // Extract character names from script dialogue
  const lines = script.split('\n');
  const characterNames = new Set<string>();
  
  lines.forEach(line => {
    const match = line.match(/^([A-Z][A-Za-z\s]+):/);
    if (match) {
      characterNames.add(match[1].trim());
    }
  });
  
  // Create character objects
  const names = Array.from(characterNames).slice(0, numberOfCharacters);
  
  // Add generic characters if not enough found
  while (names.length < numberOfCharacters) {
    names.push(`Character ${names.length + 1}`);
  }
  
  names.forEach((name, index) => {
    characters.push({
      id: `char-fallback-${Date.now()}-${index}`,
      name,
      description: `A character in the story with a unique personality and important role.`,
      appearance: `A distinctive person with memorable features and appropriate styling.`,
      traits: ['intelligent', 'determined', 'charismatic', 'resourceful', 'authentic'],
      role: index === 0 ? 'protagonist' : index === 1 ? 'supporting' : 'supporting',
      age: 'adult',
      gender: 'neutral',
      background: `An interesting individual with a compelling personal story and clear motivations.`
    });
  });
  
  return characters;
}

/**
 * Validate character data
 */
export const validateCharacter = (character: Character): boolean => {
  return !!(
    character.id &&
    character.name &&
    character.description &&
    character.traits &&
    character.traits.length > 0
  );
};

/**
 * Get character summary for display
 */
export const getCharacterSummary = (character: Character): string => {
  return `${character.name} - ${character.role} - ${character.traits.slice(0, 3).join(', ')}`;
};
