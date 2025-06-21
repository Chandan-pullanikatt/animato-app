import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import * as API from '../utils/api';
import { extractCharactersFromSegment, SegmentCharacter } from '../utils/segmentCharacterAPI';

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
    }
  }
}

const SegmentProcessingScreen: React.FC<SegmentProcessingScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { script = '', theme: videoTheme = '', segments = [], currentSegmentIndex = 0, processedSegments = [] } = route.params || {};
  
  const [currentSegment, setCurrentSegment] = useState<any>(segments && segments.length > 0 ? segments[currentSegmentIndex] : { content: '' });
  const [processedSegment, setProcessedSegment] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [segmentCharacters, setSegmentCharacters] = useState<SegmentCharacter[]>([]);
  const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
  
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
          photos: currentSegment.photos || [],
          videoUrl: null,
          processedAt: new Date().toISOString()
        };
        
        setProcessedSegment(mockProcessedSegment);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to process segment');
      setIsProcessing(false);
    }
  };

  const generateCharactersForSegment = async () => {
    if (!currentSegment || !currentSegment.content) {
      Alert.alert('Error', 'No segment content available to generate characters');
      return;
    }

    setIsGeneratingCharacters(true);

    try {
      // The API now handles errors internally and returns fallback characters
      // instead of throwing errors
      const characters = await extractCharactersFromSegment(
        currentSegment.content,
        currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
        videoTheme
      );

      setSegmentCharacters(characters);
      Alert.alert('Success', `Generated ${characters.length} characters for this segment`);
    } catch (error) {
      // This shouldn't happen anymore, but just in case
      console.log('Unexpected error in generateCharactersForSegment:', error);
      // Don't show an alert - the API already provides fallback characters
    } finally {
      setIsGeneratingCharacters(false);
    }
  };
  
  const handleNext = () => {
    if (!processedSegment) {
      Alert.alert('Warning', 'Please process this segment first');
      return;
    }
    
    const updatedProcessedSegments = [...processedSegments, processedSegment];
    
    if (currentSegmentIndex + 1 < totalSegments) {
      // Go to next segment
      navigation.replace('SegmentProcessing', {
        script,
        theme: videoTheme,
        segments,
        currentSegmentIndex: currentSegmentIndex + 1,
        processedSegments: updatedProcessedSegments
      });
    } else {
      // All segments processed, go directly to character generation
      // Make sure processedSegments has the correct structure
      const formattedSegments = updatedProcessedSegments.map((segment, index) => {
        // Create a guaranteed unique ID for each segment
        const uniqueId = `segment-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 10)}`;
        
        return {
          id: segment.id || uniqueId,
          title: segment.title || 'Untitled Segment',
          content: segment.content || '',
          characters: segment.characters || [],
          photos: segment.photos || [],
          videoUrl: segment.videoUrl || null
        };
      });
      
      // Get all unique characters from all segments
      const allCharacters = formattedSegments.flatMap(segment => segment.characters || []);
      
      // Remove duplicate characters by name
      const uniqueCharacters = allCharacters.filter(
        (char, index, self) => 
          index === self.findIndex(c => c.name === char.name)
      );
      
      // Navigate to CharacterGeneration first
      navigation.navigate('CharacterGeneration', {
        script,
        theme: videoTheme,
        videoStyle: 'realistic', // Default style, will be chosen later
        contentTheme: 'drama',
        segmentCharacters: uniqueCharacters
      });
    }
  };
  
  const handleSkip = () => {
    // Skip current segment by using it without processing
    const uniqueId = `segment-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    const skippedSegment = {
      id: currentSegment.id || uniqueId,
      title: currentSegment.title || `Segment ${currentSegmentIndex + 1}`,
      content: currentSegment.content || '',
      characters: segmentCharacters, // Include any generated characters even if skipping
      photos: currentSegment.photos || [],
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
      // All segments processed, route through CharacterGeneration first
      // Make sure processedSegments has the correct structure
      const formattedSegments = updatedProcessedSegments.map((segment, index) => {
        // Create a guaranteed unique ID for each segment
        const segmentUniqueId = `segment-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 10)}`;
        
        return {
          id: segment.id || segmentUniqueId,
          title: segment.title || 'Untitled Segment',
          content: segment.content || '',
          characters: segment.characters || [],
          photos: segment.photos || [],
          videoUrl: segment.videoUrl || null
        };
      });
      
      // Get all unique characters from all segments
      const allSegmentCharacters = formattedSegments.flatMap(segment => segment.characters || []);
      
      // Remove duplicate characters by name
      const uniqueSegmentCharacters = allSegmentCharacters.filter(
        (char, index, self) => 
          index === self.findIndex(c => c.name === char.name)
      );
      
      // Navigate to CharacterGeneration first
      navigation.navigate('CharacterGeneration', {
        script,
        theme: videoTheme,
        videoStyle: 'realistic', // Default style, will be chosen later
        contentTheme: 'drama',
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Processing Segment {currentSegmentIndex + 1} of {totalSegments}
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progress}%`,
                  backgroundColor: theme.colors.primary
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.segmentContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Segment Content:</Text>
          <View style={[styles.segmentCard, { borderColor: theme.colors.border }]}>
            <Text style={[styles.segmentText, { color: theme.colors.text }]}>
              {currentSegment?.content || 'No content available'}
            </Text>
          </View>
          
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
          
          <Button
            title={isProcessing ? "Processing..." : "Process Segment"}
            onPress={processSegment}
            variant="primary"
            disabled={isProcessing}
            style={styles.processButton}
          />
        </View>
        
        {/* Character Generation Section */}
        <View style={styles.characterGenerationSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Segment Characters:</Text>
          
          <Button
            title={isGeneratingCharacters ? "Generating..." : "Generate Characters for this Segment"}
            onPress={generateCharactersForSegment}
            variant="secondary"
            disabled={isGeneratingCharacters}
            style={styles.generateCharactersButton}
          />
          
          {isGeneratingCharacters ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Generating characters...
              </Text>
            </View>
          ) : renderCharacters()}
        </View>
        
        {processedSegment && (
          <View style={styles.processedContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Processed Result:</Text>
            <View style={[styles.segmentCard, { borderColor: theme.colors.success }]}>
              <Text style={[styles.segmentTitle, { color: theme.colors.success }]}>
                {processedSegment.title}
              </Text>
              <Text style={[styles.segmentDescription, { color: theme.colors.text }]}>
                {processedSegment.description}
              </Text>
            </View>
          </View>
        )}
        
        {/* Add extra padding at the bottom to ensure content doesn't get hidden behind fixed buttons */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Navigation Buttons */}
      <View style={styles.fixedNavigationContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.buttonsScrollContent}
          style={styles.buttonsScrollView}
        >
          <Button
            title="Skip This Segment"
            onPress={handleSkip}
            variant="secondary"
            style={styles.skipButton}
          />
          <Button
            title={currentSegmentIndex + 1 < totalSegments ? "Next Segment" : "Continue to Videos →"}
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    // Increase bottom padding to ensure buttons are fully visible
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  segmentContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  segmentCard: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  segmentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  segmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  processButton: {
    marginBottom: 20,
  },
  // Character generation styles
  characterGenerationSection: {
    marginBottom: 20,
  },
  generateCharactersButton: {
    marginBottom: 15,
  },
  noCharactersContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  noCharactersText: {
    fontSize: 16,
    textAlign: 'center',
  },
  charactersContainer: {
    marginBottom: 15,
  },
  characterCard: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  characterRole: {
    fontSize: 14,
    marginBottom: 8,
  },
  characterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  processedContainer: {
    marginBottom: 20,
  },
  fixedNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
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
  // Extra padding at the bottom to ensure content doesn't get hidden behind fixed buttons
  bottomPadding: {
    height: 120,
  },
});

export default SegmentProcessingScreen;
