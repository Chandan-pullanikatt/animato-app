/**
 * Script and Segment Types
 * Contains type definitions for script-related objects
 */

export interface ScriptSegment {
  id: string;
  title?: string;
  content: string;
  description?: string;
}

export interface ProcessedSegment extends ScriptSegment {
  characters?: Character[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  imageUrl?: string | null;
}

export interface Script {
  title: string;
  content: string;
  theme: string;
  segments: ScriptSegment[];
}
