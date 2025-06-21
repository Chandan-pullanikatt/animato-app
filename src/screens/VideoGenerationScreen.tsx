import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { generateAIImage, AIImageRequest } from '../utils/aiImageService';
import { createVideoFromScript, CompositionResult } from '../utils/videoCompositionService';
import { cleanupAudioFiles, speakText, stopSpeech } from '../utils/textToSpeechService';
import SubtitleOverlay, { Subtitle } from '../components/SubtitleOverlay';
import CharacterVideoPlayer from '../components/CharacterVideoPlayer';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

type VideoGenerationScreenProps = NativeStackScreenProps<RootStackParamList, 'VideoGeneration'>;

const VideoGenerationScreen: React.FC<VideoGenerationScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const { showSuccess, showError, alertConfig, visible, hideAlert } = useCustomAlert();
  const styles = createStyles(theme);
  const { theme: videoTheme, script, characters, photos, compiledVideoUrl } = route.params;
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoComposition, setVideoComposition] = useState<CompositionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const videoRef = useRef<Video>(null);
  const [minimumLoadingComplete, setMinimumLoadingComplete] = useState(false);

  // Use photos from route params or generate placeholder
  const characterPhotos = photos || [];

  // Handle video initialization
  useEffect(() => {
    // If we have a compiledVideoUrl from the segmented process, use it
    if (compiledVideoUrl) {
      console.log('Using compiled video URL:', compiledVideoUrl);
      
      // Check if it's a valid URL (not a mock string)
      if (compiledVideoUrl.startsWith('http://') || compiledVideoUrl.startsWith('https://')) {
        setVideoUrl(compiledVideoUrl);
        setProgress(100);
        setProgressMessage('Video ready');
      } else {
        console.log('Invalid compiled video URL, ignoring:', compiledVideoUrl);
        // Don't set the URL if it's not valid
      }
      // Don't set isVideoReady yet - wait for the actual loading to complete
    }
    // Otherwise, we'll wait for the user to manually start generation
  }, [compiledVideoUrl]);

  // Add another effect to preload the video when videoUrl changes
  useEffect(() => {
    if (videoUrl && (videoUrl.startsWith('http://') || videoUrl.startsWith('https://'))) {
      console.log('Video URL set, preparing to load video:', videoUrl);
      // Allow a moment for the component to update with the new URL
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Loading video...');
          // Force a reload of the video
          videoRef.current.loadAsync(
            { uri: videoUrl },
            { shouldPlay: false },
            false
          ).then(() => {
            console.log('Video loaded successfully');
            setIsVideoReady(true);
            setError(null);
          }).catch((err) => {
            console.error('Error loading video:', err);
            setError('Failed to load video. Please try again.');
            setIsVideoReady(false);
          });
        }
      }, 500);
    }
  }, [videoUrl]);

  // Voice preview functionality
  const handleVoicePreview = async () => {
    if (isPreviewingVoice) {
      setIsPreviewingVoice(false);
      await stopSpeech();
      return;
    }

    try {
      setIsPreviewingVoice(true);
      await speakText(script, {
        rate: 1.0,
        pitch: 1.0,
        language: 'en-US'
      });
    } catch (error) {
      console.error('Error previewing voice:', error);
      showError('Voice Preview Error', 'Failed to preview voice. Please try again.');
    } finally {
      setIsPreviewingVoice(false);
    }
  };

  // Handle video playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentVideoTime((status.positionMillis || 0) / 1000); // Convert to seconds
      setIsVideoPlaying(status.isPlaying || false);
    }
  };

  const generateVideo = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage('');
    setIsVideoReady(false);
    
    try {
      console.log('🎬 Starting video generation...');
      console.log(`📊 Video generation details:
      - Theme: ${videoTheme}
      - Script length: ${script.length} characters
      - Characters: ${characters.length}
      - Character photos: ${characterPhotos.length}`);
      
      // Log character photos
      characterPhotos.forEach((photo, index) => {
        console.log(`🖼️ Character photo ${index + 1}: ${photo.characterName} - ${photo.imageUrl.substring(0, 50)}...`);
      });
      
      // 1. Update progress during video generation
      setProgress(25);
      setProgressMessage('Generating voiceover...');
      
      // 2. Create video composition with all required parameters
      console.log('📝 Creating video composition...');
      const compositionResult = await createVideoFromScript(
        script, 
        characters, 
        characterPhotos, 
        videoTheme
      );
      setVideoComposition(compositionResult);
      
      console.log('✅ Video composition result:', {
        videoUrl: compositionResult.videoUrl.substring(0, 100) + '...',
        duration: compositionResult.duration,
        subtitlesCount: compositionResult.subtitles.length,
        thumbnailUrl: compositionResult.thumbnailUrl.substring(0, 50) + '...'
      });
      
      setProgress(75);
      setProgressMessage('Composing video...');
      
      // 3. Use the video URL from composition result
      setVideoUrl(compositionResult.videoUrl);
      
      // 4. Update progress
      setProgress(100);
      setProgressMessage('Video ready');
      
      // Add a small delay before considering the video ready
      setTimeout(() => {
        setIsVideoReady(true);
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Error generating video:', err);
      setError(`Failed to generate video: ${err?.message || 'Unknown error'}`);
      // Log additional error details if available
      if (err?.response) {
        console.error('API response error:', err.response.status, err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!videoUrl) {
      showError('No Video Available', 'No video available to share. Please generate a video first.');
      return;
    }

    try {
      setLoading(true);
      
      // First, we need to download the file locally to be able to share it
      const localUri = FileSystem.documentDirectory + 'animato_video.mp4';
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        localUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult) {
        throw new Error('Failed to download file');
      }
      const uri = downloadResult.uri;
      console.log('File downloaded to:', uri);

      // Check if sharing is available on the device
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showError('Sharing Unavailable', 'Sharing is not available on this device.');
        return;
      }

      // Share the video
      await Sharing.shareAsync(uri, {
        mimeType: 'video/mp4',
        dialogTitle: 'Share your Animato video',
        UTI: 'public.movie' // iOS only
      });
      console.log('Successfully shared video');
      
    } catch (error: any) {
      console.error('Error sharing video:', error);
      showError('Sharing Failed', `Failed to share video: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) {
      showError('No Video Available', 'No video available to download. Please generate a video first.');
      return;
    }

    try {
      setLoading(true);
      
      // Request permission to save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save videos');
        return;
      }

      // Download the file
      const localUri = FileSystem.documentDirectory + 'animato_video.mp4';
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        localUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${progress * 100}%`);
        }
      );

      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult) {
        throw new Error('Failed to download file');
      }
      const uri = downloadResult.uri;
      console.log('File downloaded to:', uri);

      // Save the file to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Animato', asset, false);
      
      Alert.alert('Success', 'Video successfully saved to your device');
      console.log('Video saved to media library:', asset);
      
    } catch (error: any) {
      console.error('Error downloading video:', error);
      Alert.alert('Error', `Failed to download video: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSummary = () => {
    // Display a summary of all the video generation details
    Alert.alert(
      'Video Generation Summary',
      `Theme: ${videoTheme}\n\nScript: ${script}\n\nCharacters: ${characters.map(c => c.name).join(', ')}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const renderCharacterPhotos = () => {
    if (characterPhotos.length === 0) {
      return (
        <View style={styles.noCharactersContainer}>
          <Text style={[styles.noCharactersText, { color: theme.colors.textSecondary }]}>
            No character photos available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.charactersSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Characters in your video:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.charactersScrollView}>
          {characterPhotos.map((photo, index) => (
            <View key={photo.id} style={styles.characterPhotoCard}>
              <Image 
                source={{ uri: photo.imageUrl }} 
                style={styles.characterPhoto}
                resizeMode="cover"
              />
              <Text style={[styles.characterName, { color: theme.colors.text }]}>
                {photo.characterName}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderVideoPreview = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Button title="Try Again" onPress={generateVideo} variant="secondary" />
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Generating your video... {Math.round(progress)}%
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[styles.progressFill, { 
                backgroundColor: theme.colors.primary,
                width: `${progress}%`
              }]} 
            />
          </View>
          <Text style={[styles.progressMessage, { color: theme.colors.textSecondary }]}>{progressMessage}</Text>
        </View>
      );
    }

    if (videoUrl) {
      // Check if we have character images to show enhanced video player
      const hasCharacterImages = characterPhotos && characterPhotos.length > 0;
      const segments = videoComposition?.subtitles ? 
        videoComposition.subtitles.map(sub => ({ 
          duration: sub.endTime - sub.startTime, 
          text: sub.text 
        })) : [];

      return (
        <View style={styles.videoContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {hasCharacterImages ? 'Your Character Video:' : 'Your Generated Video:'}
          </Text>
          
          <View style={styles.videoWrapper}>
            {hasCharacterImages ? (
              // Use Character Video Player when we have character images
              <CharacterVideoPlayer
                videoUrl={videoUrl}
                characterImages={characterPhotos.map(photo => photo.imageUrl)}
                subtitles={videoComposition?.subtitles || []}
                segments={segments}
                onLoad={() => {
                  console.log('Character video loaded successfully');
                  setIsVideoReady(true);
                  setError(null);
                }}
                onError={(error) => {
                  console.error('Character video error:', error);
                  setError('Failed to load video. Please try generating a new video.');
                  setIsVideoReady(false);
                }}
                onLoadStart={() => {
                  console.log('Character video loading started');
                  setIsVideoReady(false);
                }}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                showSubtitles={showSubtitles}
                style={styles.video}
              />
            ) : (
              // Use regular Video component for fallback
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onLoad={() => {
                  console.log('Video loaded successfully');
                  setIsVideoReady(true);
                  setError(null);
                }}
                onError={(error) => {
                  console.error('Video error:', error);
                  setError('Failed to load video. The video file may be temporarily unavailable. Please try generating a new video.');
                  setIsVideoReady(false);
                }}
                onLoadStart={() => {
                  console.log('Video loading started');
                  setIsVideoReady(false);
                }}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              />
            )}
            
            {/* Subtitle Overlay for regular video player only */}
            {!hasCharacterImages && videoComposition?.subtitles && showSubtitles && (
              <SubtitleOverlay
                subtitles={videoComposition.subtitles}
                currentTime={currentVideoTime}
                visible={showSubtitles && isVideoPlaying}
                style={styles.subtitleOverlay}
              />
            )}
            
            {!isVideoReady && !error && (
              <View style={styles.videoOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={[styles.videoLoadingText, { color: '#fff' }]}>
                  {hasCharacterImages ? 'Loading character video...' : 'Loading video...'}
                </Text>
              </View>
            )}
            
            {error && (
              <View style={styles.videoOverlay}>
                <Text style={[styles.videoErrorText, { color: '#fff' }]}>Video unavailable</Text>
                <Button 
                  title="Generate New Video" 
                  onPress={generateVideo} 
                  variant="secondary"
                  style={styles.retryButton}
                />
              </View>
            )}
          </View>
          
          <View style={styles.actionButtons}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionButtonsContainer}
              style={styles.actionButtonsScrollView}
            >
              <Button 
                title="Share" 
                onPress={handleShare} 
                variant="secondary"
                style={styles.actionButton} 
                disabled={!isVideoReady || loading}
              />
              <Button 
                title="Download" 
                onPress={handleDownload} 
                variant="primary"
                style={styles.actionButton}
                disabled={!isVideoReady || loading}
              />
              <Button 
                title="Preview Voice" 
                onPress={handleVoicePreview} 
                variant="secondary"
                style={styles.actionButton}
                disabled={!isVideoReady || loading}
              />
              <Button 
                title={showSubtitles ? "Hide Subtitles" : "Show Subtitles"}
                onPress={() => setShowSubtitles(!showSubtitles)}
                variant="secondary"
                style={styles.actionButton}
                disabled={!isVideoReady || loading}
              />
            </ScrollView>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.startContainer}>
        <Text style={[styles.startText, { color: theme.colors.text }]}>Ready to create your video?</Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          We'll use your selected theme, script, characters, and photos to generate a custom video.
        </Text>
        <Button title="Generate Video" onPress={generateVideo} variant="primary" />
      </View>
    );
  };

  return (
    <Container style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>Final Video Generation</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Theme: {videoTheme}
        </Text>
        
        {renderCharacterPhotos()}
        {renderVideoPreview()}
        
        <View style={styles.summaryContainer}>
          <Button 
            title="View Summary" 
            onPress={handleViewSummary} 
            variant="outline"
            style={styles.summaryButton}
          />
        </View>
      </ScrollView>
    </Container>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  charactersSection: {
    marginBottom: 24,
  },
  charactersScrollView: {
    flexGrow: 0,
  },
  characterPhotoCard: {
    marginRight: 16,
    alignItems: 'center',
    width: 100,
  },
  characterPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  characterName: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    color: theme.colors.text,
  },
  noCharactersContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: theme.colors.border,
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
  },
  noCharactersText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  startContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  startText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: theme.colors.text,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.text,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 14,
    marginTop: 8,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  videoContainer: {
    marginBottom: 24,
  },
  videoWrapper: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoLoadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  videoErrorText: {
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    minWidth: 200,
  },
  actionButtons: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  actionButtonsScrollView: {
    flexGrow: 0,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 12,
    minWidth: '100%',
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    maxWidth: 200,
  },
  summaryContainer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  summaryButton: {
    minWidth: 200,
  },
  subtitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
  },
});

export default VideoGenerationScreen;