import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';

type VideoCompilationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoCompilation'>;

interface VideoCompilationScreenProps {
  navigation: VideoCompilationScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      processedSegments: ProcessedSegment[];
    }
  }
}

interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  imageUrl: string | null;
}

interface ProcessedSegment {
  id: string;
  title: string;
  content: string;
  characters: Character[];
  photos: any[];
  videoUrl: string | null;
  videos?: any[];
  selectedVideoId?: string | null;
  skipped?: boolean;
}

const VideoCompilationScreen: React.FC<VideoCompilationScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  
  // Extract params
  const { script, theme: videoTheme, processedSegments } = route.params;
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledVideoUrl, setCompiledVideoUrl] = useState<string | null>(null);
  
  const compileVideo = async () => {
    if (processedSegments.length === 0) {
      Alert.alert('Error', 'No processed segments available.');
      return;
    }
    
    setIsCompiling(true);
    
    // Mock video compilation - in a real app, this would use the API
    setTimeout(() => {
      // In a real app, this would combine all segment videos
      setCompiledVideoUrl('mock-compiled-video-url');
      setIsCompiling(false);
      
      Alert.alert('Success', 'All segments have been compiled into a final video!');
    }, 4000);
  };
  
  const downloadAndShare = () => {
    if (!compiledVideoUrl) {
      Alert.alert('Error', 'Please compile the video first.');
      return;
    }
    
    // Navigate to video style selection before final generation
    navigation.navigate('VideoStyleSelection', {
      script: script,
      contentTheme: videoTheme,
      segments: processedSegments
    });
  };
  
  const getAllCharacters = () => {
    const allCharacters: Character[] = [];
    
    processedSegments.forEach(segment => {
      segment.characters.forEach(character => {
        // Check if character with same name already exists
        const existingIndex = allCharacters.findIndex(c => c.name === character.name);
        
        if (existingIndex === -1) {
          // If not, add the character
          allCharacters.push(character);
        }
      });
    });
    
    return allCharacters;
  };
  
  const getAllPhotos = () => {
    const allPhotos: any[] = [];
    
    processedSegments.forEach(segment => {
      segment.photos.forEach(photo => {
        allPhotos.push(photo);
      });
    });
    
    return allPhotos;
  };
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Final Video Compilation
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Combine all processed segments into a single video
            </Text>
          </View>
          
          <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Project Summary:
            </Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Theme:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{videoTheme}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Total Segments:
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {processedSegments.length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Total Characters:
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {getAllCharacters().length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Total Photos:
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {getAllPhotos().length}
              </Text>
            </View>
          </View>
          
          <View style={styles.segmentsOverview}>
            <Text style={[styles.segmentsTitle, { color: theme.colors.text }]}>
              Processed Segments:
            </Text>
            
            {processedSegments.length > 0 ? (
              processedSegments.map((segment, index) => (
                <View 
                  key={segment.id} 
                  style={[styles.segmentCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                >
                  <View style={styles.segmentHeader}>
                    <Text style={[styles.segmentIndex, { color: theme.colors.textSecondary }]}>
                      Segment {index + 1}
                    </Text>
                    <Text style={[styles.segmentTitle, { color: theme.colors.text }]}>
                      {segment.title}
                    </Text>
                  </View>
                  
                  {/* Segment script preview */}
                  <Text style={[styles.segmentPreviewLabel, { color: theme.colors.textSecondary }]}>
                    Script Preview:
                  </Text>
                  <Text 
                    style={[styles.segmentPreviewContent, { color: theme.colors.text }]} 
                    numberOfLines={2}
                  >
                    {segment.content}
                  </Text>
                  
                  {/* Component status indicators */}
                  <View style={[styles.componentStatusContainer, { borderTopColor: theme.colors.border }]}>
                    {/* Script status */}
                    <View style={styles.componentStatus}>
                      <Text style={[styles.componentLabel, { color: theme.colors.textSecondary }]}>Script</Text>
                      <View 
                        style={[
                          styles.statusIndicator, 
                          { backgroundColor: segment.content ? theme.colors.success : theme.colors.error }
                        ]}
                      />
                    </View>
                    
                    {/* Characters status */}
                    <View style={styles.componentStatus}>
                      <Text style={[styles.componentLabel, { color: theme.colors.textSecondary }]}>Characters</Text>
                      <View 
                        style={[
                          styles.statusIndicator, 
                          { backgroundColor: segment.characters.length > 0 ? theme.colors.success : theme.colors.error }
                        ]}
                      />
                    </View>
                    
                    {/* Photos status */}
                    <View style={styles.componentStatus}>
                      <Text style={[styles.componentLabel, { color: theme.colors.textSecondary }]}>Photos</Text>
                      <View 
                        style={[
                          styles.statusIndicator, 
                          { backgroundColor: segment.photos.length > 0 ? theme.colors.success : theme.colors.error }
                        ]}
                      />
                    </View>
                    
                    {/* Video status */}
                    <View style={styles.componentStatus}>
                      <Text style={[styles.componentLabel, { color: theme.colors.textSecondary }]}>Video</Text>
                      <View 
                        style={[
                          styles.statusIndicator, 
                          { backgroundColor: (segment.videos && segment.videos.length > 0 && segment.selectedVideoId) || segment.videoUrl ? theme.colors.success : theme.colors.error }
                        ]}
                      />
                    </View>
                  </View>
                  
                  {/* Action button - only show if something is missing and not skipped */}
                  {!segment.skipped && (!segment.characters.length || !segment.photos.length || (!segment.videos?.length && !segment.videoUrl) || (!segment.selectedVideoId && !segment.videoUrl)) && (
                    <Button
                      title="Complete Segment"
                      onPress={() => navigation.navigate('SegmentProcessing', {
                        script,
                        theme: videoTheme,
                        segments: processedSegments.map(s => ({ id: s.id, title: s.title, content: s.content })),
                        currentSegmentIndex: index,
                        processedSegments: processedSegments.slice(0, index)
                      })}
                      variant="outline"
                      style={styles.completeSegmentButton}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.emptyStateContainer, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  No segments have been processed yet. Start by processing your script segments.
                </Text>
                <Button
                  title="Start Processing Segments"
                  onPress={() => navigation.navigate('ScriptSegmentation', { script, theme: videoTheme })}
                  variant="primary"
                  style={styles.startButton}
                />
              </View>
            )}
          </View>
          
          {isCompiling ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Compiling all segments into final video...
              </Text>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <Button
                title={compiledVideoUrl ? "Recompile Video" : "Compile Final Video"}
                onPress={compileVideo}
                variant="primary"
                style={styles.compileButton}
              />
              
              {compiledVideoUrl && (
                <View style={[styles.videoReadyContainer, { backgroundColor: theme.colors.success + '20' }]}>
                  <Text style={[styles.videoReadyText, { color: theme.colors.success }]}>
                    Final video compilation is ready!
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
        
        <View style={[styles.bottomContainer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <Button
            title="Continue to Download & Share"
            onPress={downloadAndShare}
            variant="primary"
            style={styles.continueButton}
            disabled={!compiledVideoUrl || isCompiling}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryValue: {
    flex: 2,
    fontSize: 14,
    fontWeight: '600',
  },
  segmentsOverview: {
    marginBottom: 20,
  },
  segmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  segmentCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  segmentIndex: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  segmentStat: {
    fontSize: 14,
    marginRight: 16,
    marginBottom: 4,
  },
  segmentPreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  segmentPreviewContent: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  componentStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  componentStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  componentLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  completeSegmentButton: {
    marginTop: 12,
  },
  emptyStateContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  startButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  actionsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  compileButton: {
    width: '100%',
    marginBottom: 16,
  },
  videoReadyContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  videoReadyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButton: {
    width: '100%',
  },
});

export default VideoCompilationScreen;
