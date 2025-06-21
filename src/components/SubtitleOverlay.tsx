/**
 * Subtitle Overlay Component
 * Displays subtitles over video content with timing synchronization
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

interface SubtitleOverlayProps {
  subtitles: Subtitle[];
  currentTime: number; // in seconds
  visible?: boolean;
  style?: any;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  currentTime,
  visible = true,
  style
}) => {
  const theme = useTheme();
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);

  useEffect(() => {
    if (!subtitles || subtitles.length === 0) {
      setCurrentSubtitle(null);
      return;
    }

    // Find the subtitle that should be displayed at the current time
    // Use a more flexible matching that handles small timing variations
    const activeSubtitle = subtitles.find(
      subtitle => {
        const buffer = 0.1; // Small buffer for timing variations
        return currentTime >= (subtitle.startTime - buffer) && 
               currentTime <= (subtitle.endTime + buffer);
      }
    );
    
    // If no exact match, find the closest subtitle for continuous display
    if (!activeSubtitle && subtitles.length > 0) {
      const closestSubtitle = subtitles.reduce((closest, subtitle) => {
        const currentDistance = Math.min(
          Math.abs(currentTime - subtitle.startTime),
          Math.abs(currentTime - subtitle.endTime)
        );
        const closestDistance = Math.min(
          Math.abs(currentTime - closest.startTime),
          Math.abs(currentTime - closest.endTime)
        );
        return currentDistance < closestDistance ? subtitle : closest;
      });
      
      // Only show if we're reasonably close (within 2 seconds)
      const distance = Math.min(
        Math.abs(currentTime - closestSubtitle.startTime),
        Math.abs(currentTime - closestSubtitle.endTime)
      );
      
      if (distance <= 2.0) {
        setCurrentSubtitle(closestSubtitle);
      } else {
        setCurrentSubtitle(null);
      }
    } else {
      setCurrentSubtitle(activeSubtitle || null);
    }
  }, [currentTime, subtitles]);

  if (!visible || !currentSubtitle || !currentSubtitle.text) {
    return null;
  }

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.subtitleBox}>
        <Text style={styles.subtitleText}>{currentSubtitle.text}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Position above video controls
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  subtitleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: '90%',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SubtitleOverlay;
