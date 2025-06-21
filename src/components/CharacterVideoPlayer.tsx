/**
 * Character Video Player Component
 * Displays a video with character images as slideshow overlay and synchronized subtitles
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, Animated } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import SubtitleOverlay, { Subtitle } from './SubtitleOverlay';

export interface CharacterVideoPlayerProps {
  videoUrl: string;
  characterImages: string[];
  subtitles: Subtitle[];
  segments: Array<{ duration: number; text: string }>;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  showSubtitles?: boolean;
  style?: any;
}

const CharacterVideoPlayer: React.FC<CharacterVideoPlayerProps> = ({
  videoUrl,
  characterImages,
  subtitles,
  segments,
  onLoad,
  onError,
  onLoadStart,
  onPlaybackStatusUpdate,
  showSubtitles = true,
  style,
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef<Video>(null);

  // Calculate which character image should be showing based on current time
  useEffect(() => {
    if (characterImages.length === 0 || segments.length === 0) return;

    const totalDuration = segments.reduce((total, segment) => total + segment.duration, 0);
    
    // Handle video looping by normalizing time
    const normalizedTime = totalDuration > 0 ? currentTime % totalDuration : currentTime;
    
    let accumulatedTime = 0;
    let newCharacterIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      const segmentEndTime = accumulatedTime + segments[i].duration;
      
      if (normalizedTime >= accumulatedTime && normalizedTime < segmentEndTime) {
        newCharacterIndex = i % characterImages.length;
        break;
      }
      
      accumulatedTime = segmentEndTime;
    }

    // If we're past all segments, show the last character
    if (normalizedTime >= accumulatedTime && segments.length > 0) {
      newCharacterIndex = (segments.length - 1) % characterImages.length;
    }

    if (newCharacterIndex !== currentCharacterIndex) {
      console.log(`🎭 Switching to character ${newCharacterIndex + 1} at time ${normalizedTime.toFixed(1)}s`);
      
      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change image and fade in
        setCurrentCharacterIndex(newCharacterIndex);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentTime, characterImages.length, segments, currentCharacterIndex, fadeAnim]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const timeInSeconds = (status.positionMillis || 0) / 1000;
      setCurrentTime(timeInSeconds);
      setIsPlaying(status.isPlaying || false);
      
      // Handle video completion - restart if needed
      if (status.didJustFinish) {
        console.log('📹 Video playback finished, restarting...');
        // Restart the video to create a continuous loop
        if (videoRef.current) {
          videoRef.current.replayAsync();
        }
      }
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status);
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {/* Background Video */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.backgroundVideo}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
        onLoad={onLoad}
        onError={onError}
        onLoadStart={onLoadStart}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
      
      {/* Character Image Overlay */}
      {characterImages.length > 0 && (
        <View style={styles.characterOverlay}>
          <Animated.View style={[styles.characterImageContainer, { opacity: fadeAnim }]}>
            <Image
              source={{ uri: characterImages[currentCharacterIndex] }}
              style={styles.characterImage}
              resizeMode="cover"
            />
            <View style={styles.characterImageBorder} />
          </Animated.View>
          
          {/* Character Info */}
          <View style={styles.characterInfo}>
            <Text style={styles.characterCounter}>
              Character {currentCharacterIndex + 1} of {characterImages.length}
            </Text>
          </View>
        </View>
      )}
      
      {/* Subtitle Overlay */}
      {showSubtitles && subtitles.length > 0 && (
        <SubtitleOverlay
          subtitles={subtitles}
          currentTime={currentTime}
          visible={showSubtitles && isPlaying}
          style={styles.subtitleOverlay}
        />
      )}
      
      {/* Theme Badge */}
      <View style={styles.themeBadge}>
        <Text style={styles.themeBadgeText}>✨ Character Video</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    aspectRatio: 9 / 16, // Vertical video aspect ratio
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3, // Make background video subtle
  },
  characterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  characterImageContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterImageBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  characterInfo: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  characterCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  subtitleOverlay: {
    zIndex: 10,
  },
  themeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(98, 0, 238, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 15,
  },
  themeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CharacterVideoPlayer; 