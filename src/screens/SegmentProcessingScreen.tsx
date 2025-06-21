import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView, ActivityIndicator, Dimensions, Image, TouchableOpacity, Animated, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import * as API from '../utils/api';
import { extractCharactersFromSegment, SegmentCharacter } from '../utils/segmentCharacterAPI';
import { generateAIImage, AIImageRequest } from '../utils/aiImageService';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

const { width } = Dimensions.get('window');

type SegmentProcessingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SegmentProcessing'>;

interface SegmentProcessingScreenProps {
  navigation: SegmentProcessingScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      segments: any[];
      currentSegmentIndex: number;
      processedSegments: any[];
      videoStyle?: string;
      contentTheme?: string;
    }
  }
}

const SegmentProcessingScreen: React.FC<SegmentProcessingScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { showSuccess, showError, showWarning, alertConfig, visible, hideAlert } = useCustomAlert();
  // Generate styles with current theme colors
  const styles = createStyles(theme);
  const { script = '', theme: videoTheme = '', segments = [], currentSegmentIndex = 0, processedSegments = [] } = route.params || {};
  
  const [currentSegment, setCurrentSegment] = useState<any>(segments && segments.length > 0 ? segments[currentSegmentIndex] : { content: '' });
  const [processedSegment, setProcessedSegment] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [segmentCharacters, setSegmentCharacters] = useState<SegmentCharacter[]>([]);
  const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
  const [segmentPhotos, setSegmentPhotos] = useState<Array<{ id: string; characterName: string; imageUrl: string }>>([]);
  const [isGeneratingPhotos, setIsGeneratingPhotos] = useState(false);
  
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
  
  const processSegment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call for processing segment
      setTimeout(() => {
        // Create properly formatted processed segment
        const mockProcessedSegment = {
          id: currentSegment.id || `segment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
          content: currentSegment.content || '',
          description: customDescription || `A scene from a ${videoTheme} video showing ${currentSegment?.content?.substring(0, 50) || ''}...`,
          characters: segmentCharacters, // Use the generated characters
          photos: segmentPhotos, // Use the generated photos
          videoUrl: null,
          processedAt: new Date().toISOString()
        };
        
        setProcessedSegment(mockProcessedSegment);
        setIsProcessing(false);
        
        // Automatically generate characters after processing if none exist
        if (segmentCharacters.length === 0) {
          setTimeout(() => {
            generateCharactersForSegment();
          }, 500);
        }
      }, 1500);
    } catch (error) {
      showError('Processing Failed', 'Unable to process this segment. Please try again.');
      setIsProcessing(false);
    }
  };

  const generateCharactersForSegment = async () => {
    if (!currentSegment || !currentSegment.content) {
      showError('Content Missing', 'No segment content available to generate characters. Please process the segment first.');
      return;
    }

    setIsGeneratingCharacters(true);

    try {
      const characters = await extractCharactersFromSegment(
        currentSegment.content,
        currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
        videoTheme
      );

      setSegmentCharacters(characters);
      showSuccess('Characters Created!', `Successfully generated ${characters.length} characters for this segment. Photos will be created next.`);
      
      // Automatically generate photos after characters are created
      setTimeout(() => {
        generatePhotosForCharacters(characters);
      }, 1000);
    } catch (error) {
      console.error('Error generating segment characters:', error);
      showError('Character Generation Failed', 'Unable to create characters for this segment. Please try again.');
    } finally {
      setIsGeneratingCharacters(false);
    }
  };

  const generatePhotosForCharacters = async (characters?: SegmentCharacter[]) => {
    const charactersToUse = characters || segmentCharacters;
    
    if (charactersToUse.length === 0) {
      showError('No Characters Found', 'Please generate characters first before creating photos.');
      return;
    }

    setIsGeneratingPhotos(true);

    try {
      // Generate AI photos for the characters
      const aiPhotos = await Promise.all(
        charactersToUse.map(async (character) => {
          const imageRequest: AIImageRequest = {
            prompt: `Professional portrait of ${character.description}, ${character.traits.join(', ')}, high quality, realistic style`,
            style: 'realistic',
            width: 400,
            height: 600,
            quality: 'high'
          };
          
          const aiResponse = await generateAIImage(imageRequest);
          
          return {
            id: `photo-${character.id}`,
            characterName: character.name,
            imageUrl: aiResponse.url
          };
        })
      );
      
      setSegmentPhotos(aiPhotos);
      
      showSuccess('Photos Generated!', `Successfully created ${aiPhotos.length} AI-generated photos for your characters. Ready to proceed!`);
    } catch (error) {
      console.error('Error generating AI photos:', error);
      showError('Photo Generation Failed', 'Unable to create AI photos for characters. Please try again.');
    } finally {
      setIsGeneratingPhotos(false);
    }
  };
  
  const handleNext = () => {
    if (!processedSegment) {
      showWarning('Process Required', 'Please process this segment first before continuing.');
      return;
    }
    
    if (segmentPhotos.length === 0) {
      showWarning('Photos Required', 'Please generate photos for characters in this segment before proceeding.');
      return;
    }
    
    // Navigate to video generation step with all the processed data
    navigation.navigate('VideoGenerationStep', {
      script,
      theme: videoTheme,
      segments,
      currentSegmentIndex,
      processedSegments,
      currentSegment: {
        ...processedSegment,
        characters: segmentCharacters,
        photos: segmentPhotos
      },
      segmentCharacters,
      segmentPhotos
    });
  };
  
  const handleSkip = () => {
    // Skip current segment by using it without processing
    const uniqueId = `segment-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    const skippedSegment = {
      id: currentSegment.id || uniqueId,
      title: currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
      content: currentSegment.content || '',
      characters: segmentCharacters, // Include any generated characters even if skipping
      photos: segmentPhotos, // Include any generated photos
      videoUrl: null,
      skipped: true,
      description: 'Skipped segment'
    };
    
    const updatedProcessedSegments = [...processedSegments, skippedSegment];
    
    if (currentSegmentIndex + 1 < totalSegments) {
      navigation.replace('SegmentProcessing', {
        script,
        theme: videoTheme,
        segments,
        currentSegmentIndex: currentSegmentIndex + 1,
        processedSegments: updatedProcessedSegments
      });
    } else {
      // All segments processed, check if we need character generation
      const allCharacters = updatedProcessedSegments.flatMap(segment => segment.characters || []);
      
      // Remove duplicate characters by name
      const uniqueCharacters = allCharacters.filter(
        (char, index, self) => 
          index === self.findIndex(c => c.name === char.name)
      );
      
      // All segments processed, go directly to character generation
      const allSegmentCharacters = updatedProcessedSegments.flatMap(segment => segment.characters || []);
      
      // Remove duplicate characters by name
      const uniqueSegmentCharacters = allSegmentCharacters.filter(
        (char, index, self) => 
          index === self.findIndex(c => c.name === char.name)
      );
      
      // Navigate to CharacterGeneration first
      navigation.navigate('CharacterGeneration', {
        script,
        theme: route.params.contentTheme || 'drama',
        videoStyle: 'realistic', // Default style, will be chosen later
        contentTheme: route.params.contentTheme || 'drama',
        segmentCharacters: uniqueSegmentCharacters
      });
    }
  };

  // Render a list of generated characters
  const renderCharacters = () => {
    if (segmentCharacters.length === 0) {
      return (
        <View style={styles.noCharactersContainer}>
          <Text style={[styles.noCharactersText, { color: theme.colors.textSecondary }]}>
            No characters generated for this segment yet
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.charactersContainer}>
        {segmentCharacters.map((character, index) => (
          <View key={character.id} style={[styles.characterCard, { borderColor: theme.colors.border }]}>
            <Text style={[styles.characterName, { color: theme.colors.text }]}>
              {character.name}
            </Text>
            <Text style={[styles.characterRole, { color: theme.colors.primary }]}>
              {character.role}
            </Text>
            <Text style={[styles.characterDescription, { color: theme.colors.textSecondary }]}>
              {character.description}
            </Text>
            <View style={styles.traitsContainer}>
              {character.traits.map((trait, traitIndex) => (
                <View key={traitIndex} style={[styles.traitBadge, { backgroundColor: '#e6e6ff' }]}>
                  <Text style={[styles.traitText, { color: theme.colors.primary }]}>
                    {trait}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render generated photos
  const renderPhotos = () => {
    if (segmentPhotos.length === 0) {
      return (
        <View style={styles.noPhotosContainer}>
          <Text style={[styles.noPhotosText, { color: theme.colors.textSecondary }]}>
            No photos generated yet
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.photosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {segmentPhotos.map((photo, index) => (
            <View key={photo.id} style={styles.photoCard}>
              <Image 
                source={{ uri: photo.imageUrl }} 
                style={styles.photoImage}
                resizeMode="cover"
              />
              <Text style={[styles.photoCharacterName, { color: theme.colors.text }]}>
                {photo.characterName}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Calculate the current step number
  const getCurrentStep = () => {
    if (!processedSegment) return 'process';
    if (segmentCharacters.length === 0) return 'characters';
    if (segmentPhotos.length === 0) return 'photos';
    return 'complete'; // Photos step completed, ready for video generation
  };
  
  const currentStep = getCurrentStep();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Process Segment {currentSegmentIndex + 1}
          </Text>
          
          {/* Clear Step Progress Indicator */}
          <View style={styles.processingStepsContainer}>
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, processedSegment ? styles.stepCompleted : (currentStep === 'process' ? styles.stepActive : styles.stepPending)]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Process</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, segmentCharacters.length > 0 ? styles.stepCompleted : (currentStep === 'characters' ? styles.stepActive : styles.stepPending)]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Characters</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, segmentPhotos.length > 0 ? styles.stepCompleted : (currentStep === 'photos' ? styles.stepActive : styles.stepPending)]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Photos</Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.processingStepItem}>
              <View style={[styles.stepCircle, styles.stepPending]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Videos</Text>
            </View>
          </View>
          
          {/* Current Step Banner */}
          <View style={styles.currentStepBanner}>
            <Text style={styles.currentStepText}>
              {currentStep === 'process' && 'Step 1: Process Segment Content'}
              {currentStep === 'characters' && 'Step 2: Generate Characters'}
              {currentStep === 'photos' && 'Step 3: Create Character Photos'}
              {currentStep === 'complete' && 'Ready for Video Generation'}
            </Text>
            <Text style={styles.currentStepDescription}>
              {currentStep === 'process' && 'Analyze and understand the segment content'}
              {currentStep === 'characters' && 'Create characters based on the segment'}
              {currentStep === 'photos' && 'Generate visual representations of characters'}
              {currentStep === 'complete' && 'All preparation steps completed'}
            </Text>
          </View>
        </View>
        
        {/* Always show generated characters if they exist */}
        {segmentCharacters.length > 0 && (
          <View style={styles.generatedContentSection}>
            <Text style={styles.generatedSectionTitle}>✅ Generated Characters ({segmentCharacters.length})</Text>
            {renderCharacters()}
          </View>
        )}
        
        {/* Always show generated photos if they exist */}
        {segmentPhotos.length > 0 && (
          <View style={styles.generatedContentSection}>
            <Text style={styles.generatedSectionTitle}>✅ Generated Photos ({segmentPhotos.length})</Text>
            {renderPhotos()}
          </View>
        )}
        
        {/* Primary Action Card */}
        <View style={styles.primaryActionCard}>
          {currentStep === 'process' && (
            <>
              <Text style={styles.actionCardTitle}>Review & Process Segment</Text>
              <Text style={styles.actionCardDescription}>
                Review the content below and click 'Process Segment' to analyze it.
              </Text>
              <View style={[styles.segmentCard, { borderColor: theme.colors.border }]}>
                <Text style={[styles.segmentText, { color: theme.colors.text }]}>
                  {currentSegment?.content || 'No content available'}
                </Text>
              </View>
              <Button
                title={isProcessing ? "Processing..." : "Process Segment →"}
                onPress={processSegment}
                variant="primary"
                disabled={isProcessing}
                style={styles.primaryActionButton}
              />
            </>
          )}
          
          {currentStep === 'characters' && (
            <>
              <Text style={styles.actionCardTitle}>Generate Characters</Text>
              <Text style={styles.actionCardDescription}>
                Create characters that will appear in this segment.
              </Text>
              <Button
                title={isGeneratingCharacters ? "Generating..." : "Generate Characters →"}
                onPress={generateCharactersForSegment}
                variant="primary"
                disabled={isGeneratingCharacters}
                style={styles.primaryActionButton}
              />
              {isGeneratingCharacters ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Creating characters for this segment...
                  </Text>
                </View>
              ) : renderCharacters()}
            </>
          )}
          
          {currentStep === 'photos' && (
            <>
              <Text style={styles.actionCardTitle}>Create Character Photos</Text>
              <Text style={styles.actionCardDescription}>
                Generate visual images for the characters in this segment.
              </Text>
              <Button
                title={isGeneratingPhotos ? "Generating..." : "Generate Photos →"}
                onPress={() => generatePhotosForCharacters()}
                variant="primary"
                disabled={isGeneratingPhotos || segmentCharacters.length === 0}
                style={styles.primaryActionButton}
              />
              {isGeneratingPhotos ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Creating character photos...
                  </Text>
                </View>
              ) : renderPhotos()}
            </>
          )}
          
          {currentStep === 'complete' && (
            <>
              <Text style={styles.actionCardTitle}>✓ Segment Ready</Text>
              <Text style={styles.actionCardDescription}>
                All processing steps completed. Ready to generate videos.
              </Text>
              <View style={styles.completionSummary}>
                <Text style={styles.summaryItem}>✓ {segmentCharacters.length} characters created</Text>
                <Text style={styles.summaryItem}>✓ {segmentPhotos.length} photos generated</Text>
                <Text style={styles.summaryItem}>✓ Ready for video generation</Text>
              </View>
            </>
          )}
        </View>

        {/* Optional custom description section */}
        {currentStep === 'process' && (
          <View style={styles.optionalSection}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Custom Description (Optional):
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
              placeholder="Add custom description for this segment..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
              value={customDescription}
              onChangeText={setCustomDescription}
            />
          </View>
        )}
        
        {/* Fixed bottom navigation */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
      
      {/* Fixed Navigation Buttons */}
      <View style={styles.fixedNavigationContainer}>
        <Button
          title="Skip This Segment"
          onPress={handleSkip}
          variant="secondary"
          style={styles.skipButton}
        />
        <Button
          title={currentStep === 'complete' ? "Continue to Videos →" : "Please Complete Steps Above"}
          onPress={handleNext}
          variant="primary"
          disabled={currentStep !== 'complete'}
          style={[styles.nextButton, currentStep !== 'complete' && styles.disabledButton]}
        />
      </View>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      )}
    </SafeAreaView>
  );
};

// Create styles with dynamic theme-based colors
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
    // Increase bottom padding to ensure buttons are fully visible
    paddingBottom: 150,
  },
  headerContainer: {
    marginBottom: 20,
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
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  processingStepItem: {
    alignItems: 'center',
    width: 100,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepPending: {
    backgroundColor: theme.colors.border,
  },
  stepConnector: {
    height: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
  },
  stepNumber: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  stepActive: {
    backgroundColor: theme.colors.primary,
  },
  currentStepBanner: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentStepText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  currentStepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  primaryActionCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  actionCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  primaryActionButton: {
    marginTop: 15,
  },
  segmentCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  optionalSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  completionSummary: {
    marginTop: 15,
  },
  summaryItem: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  bottomPadding: {
    height: 120,
  },
  fixedNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  skipButton: {
    flex: 1,
    marginRight: 10,
    minWidth: width * 0.35,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
    minWidth: width * 0.35,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
  },
  charactersContainer: {
    marginBottom: 15,
  },
  noCharactersContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: theme.colors.border,
    marginBottom: 15,
    backgroundColor: theme.colors.surface,
  },
  noCharactersText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  characterCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.text,
  },
  characterRole: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.colors.textSecondary,
  },
  characterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    color: theme.colors.text,
  },
  traitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  traitText: {
    fontSize: 12,
    color: theme.colors.white,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noPhotosContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: theme.colors.border,
    marginBottom: 15,
    backgroundColor: theme.colors.surface,
  },
  noPhotosText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  photosContainer: {
    marginBottom: 15,
  },
  photoCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  photoCharacterName: {
    fontSize: 12,
    textAlign: 'center',
    color: theme.colors.text,
  },
  generatedContentSection: {
    marginBottom: 20,
  },
  generatedSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
});

export default SegmentProcessingScreen;
