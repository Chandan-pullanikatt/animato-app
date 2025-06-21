import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, SafeAreaView, FlatList, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import { Video, ResizeMode } from 'expo-av';

// Simple screen to show video generation for each segment
type SegmentVideoScreenProps = NativeStackScreenProps<RootStackParamList, 'SegmentVideo'>;

interface Segment {
  id: string;
  title: string;
  content: string;
}

const SegmentVideoScreen: React.FC<SegmentVideoScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<Record<string, string>>({});
  
  // Extract segments from route params
  const segments = route.params?.segments || [];
  const videoTheme = route.params?.theme || 'default';
  
  const currentSegment = segments[currentSegmentIndex];
  
  // Generate a video for the current segment
  const generateVideo = () => {
    setIsGenerating(true);
    
    // Simulate video generation with a delay
    setTimeout(() => {
      // Create a unique video URL for this segment using placeholder videos
      const videoOptions = [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      ];
      
      // Pick a random video from the options
      const randomVideo = videoOptions[Math.floor(Math.random() * videoOptions.length)];
      
      // Update the generated videos
      setGeneratedVideos(prev => ({
        ...prev,
        [currentSegment.id]: randomVideo
      }));
      
      setIsGenerating(false);
    }, 1500);
  };
  
  // Generate videos for all segments
  const generateAllVideos = () => {
    setIsGenerating(true);
    
    // Simulate generating videos for all segments
    setTimeout(() => {
      const newVideos: Record<string, string> = {};
      
      // Assign videos to each segment
      segments.forEach(segment => {
        const videoOptions = [
          'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        ];
        
        const randomVideo = videoOptions[Math.floor(Math.random() * videoOptions.length)];
        newVideos[segment.id] = randomVideo;
      });
      
      setGeneratedVideos(newVideos);
      setIsGenerating(false);
      
      Alert.alert('Success', `Generated videos for all ${segments.length} segments!`);
    }, 2000);
  };
  
  // Go to the next segment
  const goToNextSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
    }
  };
  
  // Go to the previous segment
  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
    }
  };
  
  // Continue to final video compilation
  const continueToFinalVideo = () => {
    // Check if all segments have videos
    const allSegmentsHaveVideos = segments.every(segment => 
      generatedVideos[segment.id] !== undefined
    );
    
    if (!allSegmentsHaveVideos) {
      Alert.alert('Missing Videos', 'Please generate videos for all segments first.');
      return;
    }
    
    // Create array of segment videos
    const segmentVideos = segments.map(segment => ({
      segmentId: segment.id,
      videoUrl: generatedVideos[segment.id] || null,
      thumbnailUrl: null
    }));
    
    // Navigate to final video generation
    navigation.navigate('VideoGeneration', {
      script: segments.map(s => s.content).join(' '),
      theme: videoTheme,
      characters: route.params.characters || [],
      photos: route.params.photos || [],
      segmentVideos: segmentVideos
    });
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Container>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            Generate Videos for Each Segment
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Create individual videos for each segment
          </Text>
        </View>
        
        <View style={styles.segmentNavigation}>
          <Button
            title="Previous"
            onPress={goToPreviousSegment}
            variant="secondary"
            disabled={currentSegmentIndex === 0}
            style={styles.navButton}
          />
          <Text style={styles.segmentIndicator}>
            Segment {currentSegmentIndex + 1} of {segments.length}
          </Text>
          <Button
            title="Next"
            onPress={goToNextSegment}
            variant="secondary"
            disabled={currentSegmentIndex === segments.length - 1}
            style={styles.navButton}
          />
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {currentSegment && (
            <View style={styles.segmentContainer}>
              <Text style={[styles.segmentTitle, { color: theme.colors.primary }]}>
                {currentSegment.title || `Segment ${currentSegmentIndex + 1}`}
              </Text>
              <View style={[styles.segmentContent, { borderColor: theme.colors.border }]}>
                <Text style={styles.segmentText}>
                  {currentSegment.content}
                </Text>
              </View>
              
              {generatedVideos[currentSegment.id] ? (
                <View style={styles.videoContainer}>
                  <Text style={[styles.videoTitle, { color: theme.colors.text }]}>
                    Generated Video:
                  </Text>
                  <Video
                    source={{ uri: generatedVideos[currentSegment.id] }}
                    style={styles.videoPlayer}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                  />
                </View>
              ) : (
                <View style={styles.generateButtonContainer}>
                  <Button
                    title={isGenerating ? "Generating..." : "Generate Video for this Segment"}
                    onPress={generateVideo}
                    variant="primary"
                    disabled={isGenerating}
                    style={styles.generateButton}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Generate All Videos"
            onPress={generateAllVideos}
            variant="secondary"
            disabled={isGenerating}
            style={styles.actionButton}
          />
          <Button
            title="Continue to Final Video"
            onPress={continueToFinalVideo}
            variant="primary"
            style={styles.actionButton}
          />
        </View>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  segmentNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navButton: {
    minWidth: 100,
  },
  segmentIndicator: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  segmentContainer: {
    marginBottom: 20,
  },
  segmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentContent: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  segmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  generateButtonContainer: {
    marginVertical: 16,
  },
  generateButton: {
    marginBottom: 8,
  },
  videoContainer: {
    marginTop: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  buttonsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default SegmentVideoScreen;
