import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, ActivityIndicator, Dimensions, Image, TouchableOpacity, Animated, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { generateSegmentVideo, VideoOption } from '../utils/videoGenerationAPI';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

type VideoGenerationStepScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoGenerationStep'>;

interface VideoGenerationStepScreenProps {
  navigation: VideoGenerationStepScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      segments: any[];
      currentSegmentIndex: number;
      processedSegments: any[];
      currentSegment: any;
      segmentCharacters: any[];
      segmentPhotos: any[];
    }
  }
}

const VideoGenerationStepScreen: React.FC<VideoGenerationStepScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { 
    script = '', 
    theme: videoTheme = '', 
    segments = [], 
    currentSegmentIndex = 0, 
    processedSegments = [],
    currentSegment = {},
    segmentCharacters = [],
    segmentPhotos = []
  } = route.params || {};
  
  const [segmentVideos, setSegmentVideos] = useState<VideoOption[]>([]);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  // Progress information
  const totalSegments = segments?.length || 1;
  const progress = totalSegments > 0 ? ((currentSegmentIndex + 1) / totalSegments) * 100 : 0;

  const generateVideosForSegment = async () => {
    if (!currentSegment || !currentSegment.content) {
      Alert.alert('Error', 'No segment content available to generate videos');
      return;
    }

    if (segmentPhotos.length === 0) {
      Alert.alert('Error', 'Please generate photos first before creating videos');
      return;
    }

    setIsGeneratingVideos(true);

    try {
      // Create segment object for API call
      const segmentForAPI = {
        id: currentSegment.id || `segment-${currentSegmentIndex}`,
        title: currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
        content: currentSegment.content
      };

      const videos = await generateSegmentVideo(
        segmentForAPI,
        segmentCharacters,
        segmentPhotos,
        videoTheme
      );

      setSegmentVideos(videos);
      Alert.alert('Success', `Generated ${videos.length} video options for this segment`);
    } catch (error) {
      console.error('Error generating segment videos:', error);
      Alert.alert('Error', 'Failed to generate videos for this segment');
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const handleNext = () => {
    if (segmentVideos.length === 0) {
      Alert.alert('Warning', 'Please generate videos for this segment');
      return;
    }
    
    if (!selectedVideo) {
      Alert.alert('Warning', 'Please select a video for this segment');
      return;
    }
    
    // Create the updated processed segment with video data
    const updatedProcessedSegment = {
      ...currentSegment,
      id: currentSegment.id || `segment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
      content: currentSegment.content || '',
      characters: segmentCharacters,
      photos: segmentPhotos,
      videos: segmentVideos,
      selectedVideoId: selectedVideo,
      processedAt: new Date().toISOString()
    };
    
    const updatedProcessedSegments = [...processedSegments, updatedProcessedSegment];
    
    if (currentSegmentIndex + 1 < totalSegments) {
      // Go to next segment processing
      navigation.navigate('SegmentProcessing', {
        script,
        theme: videoTheme,
        segments,
        currentSegmentIndex: currentSegmentIndex + 1,
        processedSegments: updatedProcessedSegments
      });
    } else {
      // All segments processed, proceed to final compilation
      navigation.navigate('VideoCompilation', {
        script,
        theme: videoTheme,
        processedSegments: updatedProcessedSegments
      });
    }
  };

  const handleSkip = () => {
    // Skip video generation for this segment
    const skippedSegment = {
      ...currentSegment,
      id: currentSegment.id || `segment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
      content: currentSegment.content || '',
      characters: segmentCharacters,
      photos: segmentPhotos,
      videos: [],
      selectedVideoId: null,
      skipped: true,
      processedAt: new Date().toISOString()
    };
    
    const updatedProcessedSegments = [...processedSegments, skippedSegment];
    
    if (currentSegmentIndex + 1 < totalSegments) {
      navigation.navigate('SegmentProcessing', {
        script,
        theme: videoTheme,
        segments,
        currentSegmentIndex: currentSegmentIndex + 1,
        processedSegments: updatedProcessedSegments
      });
    } else {
      navigation.navigate('VideoCompilation', {
        script,
        theme: videoTheme,
        processedSegments: updatedProcessedSegments
      });
    }
  };

  const renderVideoGenerationSection = () => {
    return (
      <View style={styles.videoGenerationSection}>
        <Text style={styles.sectionTitle}>Generate Video for Segment</Text>
        <Text style={styles.sectionDescription}>
          Create video content using the characters and photos from this segment
        </Text>
        
        {isGeneratingVideos ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Generating videos...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments...</Text>
          </View>
        ) : segmentVideos.length === 0 ? (
          <View>
            <View style={styles.noVideosContainer}>
              <Text style={styles.noVideosText}>No videos generated yet for this segment</Text>
              <Text style={styles.noVideosSubtext}>
                Generate videos using the {segmentCharacters.length} characters and {segmentPhotos.length} photos
              </Text>
            </View>
            <Button
              title="Generate Videos"
              style={styles.generateVideosButton}
              onPress={generateVideosForSegment}
              disabled={segmentPhotos.length === 0}
            />
          </View>
        ) : (
          <View style={styles.videosContainer}>
            <Text style={styles.inputLabel}>Select a video for this segment:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.videosScrollContainer}
              contentContainerStyle={styles.videosContent}
            >
              {segmentVideos.map((video) => (
                <TouchableOpacity 
                  key={video.id} 
                  style={[styles.videoCard, selectedVideo === video.id && styles.selectedVideoCard]}
                  onPress={() => setSelectedVideo(video.id)}
                >
                  <View style={styles.videoThumbnailContainer}>
                    <Image 
                      source={{ uri: video.thumbnailUrl }} 
                      style={styles.videoThumbnail} 
                      resizeMode="cover"
                    />
                    {selectedVideo === video.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.videoTitle}>Option {segmentVideos.indexOf(video) + 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Preview of selected video */}
            {selectedVideo && (
              <View style={styles.selectedVideoPreview}>
                <Text style={styles.inputLabel}>Video Preview:</Text>
                <Video
                  source={{ uri: segmentVideos.find(v => v.id === selectedVideo)?.url || '' }}
                  style={styles.videoPlayer}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={status => console.log('Video status update:', status)}
                  onLoad={() => console.log('Video loaded successfully')}
                  onLoadStart={() => console.log('Loading video...')}
                  onError={(error) => console.log('Video error:', error)}
                  onReadyForDisplay={() => console.log('Video is ready for display')}
                />
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Compact header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Generate Videos</Text>
          
          {/* Compact Processing Steps */}
          <View style={styles.processingStepsContainer}>
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, styles.stepCompleted]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Process</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, styles.stepCompleted]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Characters</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, styles.stepCompleted]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Photos</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, segmentVideos.length > 0 ? styles.stepCompleted : styles.stepActive]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Videos</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, styles.stepPending]}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <Text style={styles.stepText}>Complete</Text>
            </View>
          </View>
        </View>
        
        {/* Video Generation Section */}
        {renderVideoGenerationSection()}
        
        {/* Segment Summary - Compact */}
        <View style={styles.segmentSummaryContainer}>
          <Text style={styles.summaryTitle}>Processing Summary:</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryItem}>✓ {segmentCharacters.length} characters</Text>
            <Text style={styles.summaryItem}>✓ {segmentPhotos.length} photos</Text>
            <Text style={styles.summaryItem}>
              {segmentVideos.length > 0 ? `✓ ${segmentVideos.length} videos` : '⏳ Videos pending'}
            </Text>
          </View>
        </View>
        
        {/* Bottom spacing for fixed buttons */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
      
      {/* Fixed Navigation Buttons */}
      <View style={styles.fixedButtonsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buttonsScrollContent}
          style={styles.buttonsScrollView}
        >
          <Button
            title="Skip Video Generation"
            onPress={handleSkip}
            variant="secondary"
            style={styles.skipButton}
          />
          <Button
            title={currentSegmentIndex + 1 < totalSegments ? "Next Segment" : "Finish Processing"}
            onPress={handleNext}
            variant="primary"
            disabled={segmentVideos.length === 0 || !selectedVideo}
            style={styles.nextButton}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
  processingStepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  processingStepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepActive: {
    backgroundColor: theme.colors.primary,
  },
  stepPending: {
    backgroundColor: theme.colors.disabled,
  },
  stepNumber: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: theme.colors.border,
    marginBottom: 20,
  },
  videoGenerationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  noVideosContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  noVideosText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  noVideosSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  generateVideosButton: {
    marginBottom: 20,
  },
  videosContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 12,
  },
  videosScrollContainer: {
    marginBottom: 20,
  },
  videosContent: {
    paddingHorizontal: 4,
  },
  videoCard: {
    width: 150,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  selectedVideoCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  videoThumbnailContainer: {
    position: 'relative',
    height: 100,
    backgroundColor: theme.colors.background,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  videoTitle: {
    padding: 8,
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  selectedVideoPreview: {
    marginTop: 16,
    marginBottom: 20,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: theme.colors.black,
  },
  segmentSummaryContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  bottomPadding: {
    height: 120,
  },
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonsScrollView: {
    flex: 1,
  },
  buttonsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    minWidth: '100%',
  },
  skipButton: {
    marginRight: 12,
    minWidth: 160,
  },
  nextButton: {
    minWidth: 180,
  },
});

export default VideoGenerationStepScreen; 