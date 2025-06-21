export interface ScriptSegment {
  id: string;
  content: string;
  title: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  imageUrl: string | null;
}

export interface ProcessedSegment {
  id: string;
  title: string;
  content: string;
  characters: Character[];
  photos: any[];
  videoUrl: string | null;
}

export interface ThemeColors {
  text: string;
  textSecondary: string;
  background: string;
  primary: string;
  border: string;
  muted: string;
  secondaryBackground: string;
  white: string;
  success: string;
}
