import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import { Video, ResizeMode } from 'expo-av';
import { VideoOption, generateSegmentVideo, generateAllSegmentVideos } from '../utils/videoGenerationAPI';
import { ScriptSegment } from '../types/script';
import { Character } from '../utils/characterGenerationAPI';
import { CharacterPhoto } from '../utils/photoGenerationAPI';

type SegmentVideoGenerationScreenProps = NativeStackScreenProps<RootStackParamList, 'SegmentVideoGeneration'>;

const SegmentVideoGenerationScreen: React.FC<SegmentVideoGenerationScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const { videoTheme, segments, characters, characterPhotos } = route.params;
  
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [videoOptions, setVideoOptions] = useState<Record<string, VideoOption[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [allSegmentsProcessed, setAllSegmentsProcessed] = useState(false);
  
  const currentSegment = segments[currentSegmentIndex];
  
  // Initialize video options when screen loads
  useEffect(() => {
    if (segments.length > 0 && Object.keys(videoOptions).length === 0) {
      generateInitialVideoOptions();
    }
  }, []);
  
  // Generate initial video options for the first segment
  const generateInitialVideoOptions = async () => {
    if (segments.length === 0) return;
    
    setIsGenerating(true);
    try {
      const options = await generateSegmentVideo(
        segments[0],
        characters,
        characterPhotos,
        videoTheme
      );
      
      setVideoOptions({
        [segments[0].id]: options
      });
    } catch (error) {
      console.log('Error generating initial video options:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate videos for the current segment
  const generateVideosForSegment = async () => {
    if (!currentSegment) return;
    
    setIsGenerating(true);
    
    try {
      const options = await generateSegmentVideo(
        currentSegment,
        characters,
        characterPhotos,
        videoTheme
      );
      
      setVideoOptions({
        ...videoOptions,
        [currentSegment.id]: options
      });
    } catch (error) {
      console.log('Handling video generation gracefully:', currentSegment.title);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate videos for all segments at once
  const generateAllVideos = async () => {
    if (segments.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      const allOptions = await generateAllSegmentVideos(
        segments,
        characters,
        characterPhotos,
        videoTheme
      );
      
      setVideoOptions(allOptions);
      setAllSegmentsProcessed(true);
    } catch (error) {
      console.log('Handling batch video generation gracefully');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Select a video for the current segment
  const selectVideo = (videoId: string) => {
    const updatedOptions = videoOptions[currentSegment.id].map(option => ({
      ...option,
      selected: option.id === videoId
    }));
    
    setVideoOptions({
      ...videoOptions,
      [currentSegment.id]: updatedOptions
    });
  };
  
  // Navigate to the next segment
  const goToNextSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      
      // Generate videos for the next segment if we don't have them yet
      const nextSegment = segments[currentSegmentIndex + 1];
      if (!videoOptions[nextSegment.id]) {
        setTimeout(() => {
          generateVideosForSegment();
        }, 300);
      }
    }
  };
  
  // Navigate to the previous segment
  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
    }
  };
  
  // Finish video generation and move to final video compilation
  const finishVideoGeneration = () => {
    // Collect all selected videos
    const selectedVideos = segments.map(segment => {
      const options = videoOptions[segment.id] || [];
      const selected = options.find(option => option.selected) || options[0];
      
      return {
        segmentId: segment.id,
        videoUrl: selected?.url || null,
        thumbnailUrl: selected?.thumbnailUrl || null
      };
    });
    
    // Navigate to the final video generation screen
    navigation.navigate('VideoGeneration', {
      theme: videoTheme,
      script: segments.map(s => s.content).join(' '),
      characters: characters,
      photos: characterPhotos,
      segmentVideos: selectedVideos
    });
  };
  
  // Check if all segments have videos generated
  const allSegmentsHaveVideos = () => {
    return segments.every(segment => videoOptions[segment.id]);
  };
  
  // Render a video option
  const renderVideoOption = (option: VideoOption) => {
    const isSelected = option.selected;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.videoOptionContainer,
          isSelected && { borderColor: theme.colors.primary, borderWidth: 3 }
        ]}
        onPress={() => selectVideo(option.id)}
      >
        {option.url ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: option.url }}
              style={styles.videoPreview}
              useNativeControls
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={false}
            />
            <Image
              source={{ uri: option.thumbnailUrl }}
              style={styles.videoThumbnail}
            />
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>▶</Text>
            </View>
          </View>
        ) : (
          <View style={styles.videoPlaceholder}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
        
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render the segment navigation
  const renderSegmentNavigation = () => {
    return (
      <View style={styles.segmentNavigation}>
        <Button
          title="Previous"
          onPress={goToPreviousSegment}
          variant="secondary"
          disabled={currentSegmentIndex === 0}
          style={[styles.navButton, currentSegmentIndex === 0 && styles.disabledButton]}
        />
        <Text style={styles.segmentIndicator}>
          Segment {currentSegmentIndex + 1} of {segments.length}
        </Text>
        <Button
          title="Next"
          onPress={goToNextSegment}
          variant="secondary"
          disabled={currentSegmentIndex === segments.length - 1}
          style={[styles.navButton, currentSegmentIndex === segments.length - 1 && styles.disabledButton]}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Container>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Generate Videos for Each Segment
          </Text>
          
          {currentSegment && (
            <>
              <View style={styles.segmentInfoContainer}>
                <Text style={[styles.segmentTitle, { color: theme.colors.primary }]}>
                  {currentSegment.title || `Segment ${currentSegmentIndex + 1}`}
                </Text>
                <Text style={styles.segmentContent}>
                  {currentSegment.content}
                </Text>
              </View>
              
              <View style={styles.optionsContainer}>
                <Text style={styles.sectionTitle}>Video Options:</Text>
                
                {isGenerating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Generating videos...</Text>
                  </View>
                ) : !videoOptions[currentSegment.id] ? (
                  <Button
                    title="Generate Videos for this Segment"
                    onPress={generateVideosForSegment}
                    variant="primary"
                    style={styles.generateButton}
                  />
                ) : (
                  <View style={styles.videoOptionsGrid}>
                    {videoOptions[currentSegment.id].map(option => renderVideoOption(option))}
                  </View>
                )}
              </View>
            </>
          )}
          
          {renderSegmentNavigation()}
          
          <View style={styles.buttonsContainer}>
            <Button
              title="Generate All Videos"
              onPress={generateAllVideos}
              variant="secondary"
              disabled={isGenerating || allSegmentsProcessed}
              style={styles.button}
            />
            
            <Button
              title="Finish"
              onPress={finishVideoGeneration}
              variant="primary"
              disabled={!allSegmentsHaveVideos()}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  segmentInfoContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  segmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  generateButton: {
    marginVertical: 20,
  },
  videoOptionsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  videoOptionContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  videoContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    opacity: 0, // Hide the actual video player and show the thumbnail instead
  },
  videoThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6200ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  segmentNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  navButton: {
    flex: 1,
    maxWidth: 120,
  },
  segmentIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SegmentVideoGenerationScreen;
