/**
 * Mock Photos Utility
 * Provides consistent mock photos for characters based on their names
 */

export interface MockPhoto {
  id: string;
  characterName: string;
  imageUrl: string;
  thumbnailUrl: string;
}

// Predefined character photos that will be consistent across the app
const CHARACTER_PHOTOS: Record<string, string> = {
  // Main characters
  'Alex': 'https://picsum.photos/seed/alex-character/400/400',
  'Jordan': 'https://picsum.photos/seed/jordan-character/400/400',
  'Taylor': 'https://picsum.photos/seed/taylor-character/400/400',
  'Riley': 'https://picsum.photos/seed/riley-character/400/400',
  'Morgan': 'https://picsum.photos/seed/morgan-character/400/400',
  'Jamie': 'https://picsum.photos/seed/jamie-character/400/400',
  
  // Themed characters
  'Explorer Alex': 'https://picsum.photos/seed/explorer-alex/400/400',
  'Guide Jordan': 'https://picsum.photos/seed/guide-jordan/400/400',
  'Captain Nova': 'https://picsum.photos/seed/captain-nova/400/400',
  'Engineer Zeta': 'https://picsum.photos/seed/engineer-zeta/400/400',
  'Detective Morgan': 'https://picsum.photos/seed/detective-morgan/400/400',
  'Witness Jamie': 'https://picsum.photos/seed/witness-jamie/400/400',
  
  // Role-based characters
  'Host': 'https://picsum.photos/seed/host-character/400/400',
  'Guest Expert': 'https://picsum.photos/seed/guest-expert/400/400',
  'Instructor': 'https://picsum.photos/seed/instructor-character/400/400',
  'Narrator': 'https://picsum.photos/seed/narrator-character/400/400',
  'Main Character': 'https://picsum.photos/seed/main-character/400/400',
  'Presenter': 'https://picsum.photos/seed/presenter-character/400/400',
  'Default Presenter': 'https://picsum.photos/seed/default-presenter/400/400',
  
  // Generic fallbacks
  'Character 1': 'https://picsum.photos/seed/character-1/400/400',
  'Character 2': 'https://picsum.photos/seed/character-2/400/400',
  'Unnamed Character': 'https://picsum.photos/seed/unnamed-character/400/400',
};

/**
 * Get a consistent photo URL for a character based on their name
 */
export const getCharacterPhotoUrl = (characterName: string): string => {
  // First, try to find an exact match
  if (CHARACTER_PHOTOS[characterName]) {
    return CHARACTER_PHOTOS[characterName];
  }
  
  // If no exact match, create a consistent URL based on the name
  const cleanName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://picsum.photos/seed/${cleanName}/400/400`;
};

/**
 * Get a thumbnail URL for a character photo
 */
export const getCharacterThumbnailUrl = (characterName: string): string => {
  const cleanName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://picsum.photos/seed/${cleanName}/200/200`;
};

/**
 * Generate mock photos for a list of characters
 */
export const generateMockPhotosForCharacters = (characters: Array<{ id: string; name: string }>): MockPhoto[] => {
  return characters.map(character => ({
    id: `photo-${character.id}`,
    characterName: character.name,
    imageUrl: getCharacterPhotoUrl(character.name),
    thumbnailUrl: getCharacterThumbnailUrl(character.name)
  }));
};

/**
 * Get all photos for characters, ensuring same name = same photo
 */
export const getConsistentCharacterPhotos = (characters: Array<{ id: string; name: string }>): MockPhoto[] => {
  const uniqueCharacters = new Map<string, { id: string; name: string }>();
  
  // Remove duplicates by name, keeping the first occurrence
  characters.forEach(character => {
    if (!uniqueCharacters.has(character.name)) {
      uniqueCharacters.set(character.name, character);
    }
  });
  
  // Generate photos for unique characters
  return Array.from(uniqueCharacters.values()).map(character => ({
    id: `photo-${character.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    characterName: character.name,
    imageUrl: getCharacterPhotoUrl(character.name),
    thumbnailUrl: getCharacterThumbnailUrl(character.name)
  }));
};

/**
 * Get photo for a specific character name
 */
export const getPhotoForCharacter = (characterName: string): MockPhoto => {
  return {
    id: `photo-${characterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    characterName: characterName,
    imageUrl: getCharacterPhotoUrl(characterName),
    thumbnailUrl: getCharacterThumbnailUrl(characterName)
  };
}; 