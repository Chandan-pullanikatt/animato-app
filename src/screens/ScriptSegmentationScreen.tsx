import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';


const { width } = Dimensions.get('window');

type ScriptSegmentationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ScriptSegmentation'>;

interface ScriptSegmentationScreenProps {
  navigation: ScriptSegmentationScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
    }
  }
}

interface ScriptSegment {
  id: string;
  content: string;
  title: string;
}

const ScriptSegmentationScreen: React.FC<ScriptSegmentationScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  // Generate styles with current theme colors
  const styles = createStyles(theme);
  const [numberOfSegments, setNumberOfSegments] = useState(2);
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [showScriptPreview, setShowScriptPreview] = useState(false);
  
  // Extract script and theme from route params
  const { script, theme: videoTheme } = route.params;

  const segmentScript = () => {
    if (!script || script.trim() === '') {
      Alert.alert('Error', 'No script available. Please go back and create a script first.');
      return;
    }
    
    setIsSegmenting(true);
    
    // Improved segmentation logic - ensure all segments get content
    const lines = script.split('\n').filter(line => line.trim() !== '');
    
    // Calculate number of lines per segment, ensuring even distribution
    const linesPerSegment = Math.max(1, Math.ceil(lines.length / numberOfSegments));
    
    // Temporary segments array
    let tempSegments: ScriptSegment[] = [];
    
    // First pass: Create initial segments from the script
    for (let i = 0; i < numberOfSegments; i++) {
      const startIdx = i * linesPerSegment;
      // Make sure we don't go beyond available lines
      const endIdx = Math.min(lines.length, (i + 1) * linesPerSegment);
      
      // Initial segment with basic content if available, or placeholder
      let segmentContent = '';
      let segmentTitle = `Part ${i + 1}`;
      
      if (startIdx < lines.length) {
        // We have some content from the script
        segmentContent = lines.slice(startIdx, endIdx).join('\n');
      }
      
      tempSegments.push({
        id: `segment-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: segmentContent,
        title: segmentTitle
      });
    }
    
    // Second pass: Generate rich content for each segment
    const finalSegments = tempSegments.map((segment, index) => {
      // If segment is empty or too short, generate content
      if (!segment.content || segment.content.trim() === '' || 
          segment.content.split('\n').length < 3) {
            
        // Generate rich content based on segment title and index
        return {
          ...segment,
          content: generateSampleContentForSegment(segment.title, index)
        };
      }
      return segment;
    });
    
    // Update state with final segments
    setSegments(finalSegments);
    setIsSegmenting(false);
    
    // Provide feedback that segmentation is complete
    Alert.alert(
      'Segmentation Complete',
      `Your script has been divided into ${finalSegments.length} segments with content. Review and edit as needed.`,
      [{ text: 'OK' }]
    );
  };

  const updateSegmentTitle = (index: number, newTitle: string) => {
    const updatedSegments = [...segments];
    updatedSegments[index] = {
      ...updatedSegments[index],
      title: newTitle
    };
    setSegments(updatedSegments);
  };

  const updateSegmentContent = (index: number, newContent: string) => {
    const updatedSegments = [...segments];
    updatedSegments[index] = {
      ...updatedSegments[index],
      content: newContent
    };
    setSegments(updatedSegments);
  };

  // Helper function to generate sample script content for empty segments
  const generateSampleContentForSegment = (title: string, index: number): string => {
    // Create different content based on segment index to make it more varied
    const settings = [
      'A futuristic cityscape with flying cars',
      'A cozy coffee shop on a rainy day',
      'A mysterious ancient temple',
      'A bustling space station',
      'A serene beach at sunset'
    ];
    
    const characters = [
      ['Maya', 'Zack'],
      ['Emily', 'Jackson'],
      ['Sophia', 'Ethan'],
      ['Olivia', 'Noah'],
      ['Ava', 'Liam']
    ];
    
    const settingIndex = index % settings.length;
    const characterPair = characters[index % characters.length];
    
    return `[Setting]: ${settings[settingIndex]}\n\n` +
           `[${characterPair[0]}]: I've been waiting for this moment for so long.\n\n` +
           `[${characterPair[1]}]: Everything is about to change, isn't it?\n\n` +
           `[Action]: ${characterPair[0]} moves closer to the window and looks out at the view.\n\n` +
           `[${characterPair[0]}]: This is just the beginning of our journey in ${title}.\n\n` +
           `[${characterPair[1]}]: Let's make it count then!`;
  };
  
  // Ensure all segments have actual content before proceeding
  const ensureAllSegmentsHaveContent = () => {
    const updatedSegments = segments.map((segment, index) => {
      // Check if segment has placeholder content or is empty
      if (!segment.content || 
          segment.content.trim() === '' || 
          segment.content.includes('[Add content for Part')) {
        
        // Generate proper content for this segment
        const newContent = generateSampleContentForSegment(segment.title, index);
        
        return {
          ...segment,
          content: newContent
        };
      }
      
      return segment;
    });
    
    setSegments(updatedSegments);
    return updatedSegments;
  };

  const continueToSegmentProcessing = () => {
    if (segments.length === 0) {
      segmentScript(); // Auto-segment if not done already
      Alert.alert('Notice', 'Script has been automatically segmented. Please review before continuing.');
      return;
    }
    
    // Make sure all segments have proper content before proceeding
    const finalSegments = ensureAllSegmentsHaveContent();
    
    // Display message about the generated content
    Alert.alert(
      'Content Ready', 
      'All segments now have script content. Proceeding to segment processing.',
      [{
        text: 'Continue',
        onPress: () => {
          // Navigate to the first segment's character generation screen
          navigation.navigate('SegmentProcessing', {
            script: route.params.script,
            theme: route.params.theme,
            segments: finalSegments,
            currentSegmentIndex: 0,
            processedSegments: [],
          });
        }
      }]
    );
  };

  const continueToStreamlinedWorkflow = () => {
    // Navigate directly to the streamlined creation screen
    navigation.navigate('StreamlinedCreation', {
      script: route.params.script,
      theme: route.params.theme,
      videoStyle: 'realistic', // Default style
      contentTheme: route.params.theme
    });
  };

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Enhanced Progress Header */}
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Script Processing</Text>
            <View style={styles.stepsIndicator}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.stepLabel}>Segment</Text>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepPending]}>
                  <Text style={styles.stepNumberPending}>2</Text>
                </View>
                <Text style={styles.stepLabel}>Process</Text>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepPending]}>
                  <Text style={styles.stepNumberPending}>3</Text>
                </View>
                <Text style={styles.stepLabel}>Generate</Text>
              </View>
            </View>
          </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Segment Your Script</Text>
              <Text style={styles.subtitle}>
                Divide your script into smaller parts for more detailed processing
              </Text>
              
              {/* Current Step Indicator */}
              <View style={styles.currentStepBanner}>
                <Text style={styles.currentStepText}>Step 1 of 3: Script Segmentation</Text>
                <Text style={styles.currentStepDescription}>Choose how many segments to create for your script</Text>
              </View>

              {/* Script Preview Section */}
              <TouchableOpacity 
                style={styles.scriptPreviewToggle}
                onPress={() => setShowScriptPreview(!showScriptPreview)}
              >
                <View style={styles.scriptPreviewToggleGradient}>
                  <Text style={styles.scriptPreviewToggleText}>
                    {showScriptPreview ? '📖 Hide Script Preview' : '📖 View Full Script'}
                  </Text>
                  <Text style={styles.scriptPreviewToggleIcon}>
                    {showScriptPreview ? '▼' : '▶'}
                  </Text>
                </View>
              </TouchableOpacity>

              {showScriptPreview && (
                <View style={styles.scriptPreviewContainer}>
                  <View style={styles.scriptPreviewGradient}>
                    <Text style={styles.scriptPreviewTitle}>📝 Your Complete Script</Text>
                    <ScrollView 
                      style={styles.scriptPreviewScroll}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      <Text style={styles.scriptPreviewText}>{script}</Text>
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>

          <View style={styles.segmentationContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              Number of Segments: {numberOfSegments}
            </Text>
            
            <View style={styles.segmentSelectorContainer}>
              <TouchableOpacity
                style={[styles.segmentButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setNumberOfSegments(Math.max(1, numberOfSegments - 1))}
              >
                <Text style={styles.segmentButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.segmentNumberContainer}>
                <Text style={[styles.segmentNumber, { color: theme.colors.text }]}>{numberOfSegments}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.segmentButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setNumberOfSegments(Math.min(10, numberOfSegments + 1))}
              >
                <Text style={styles.segmentButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sliderLabelsContainer}>
              <Text style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}>Min: 1</Text>
              <Text style={[styles.sliderLabel, { color: theme.colors.textSecondary }]}>Max: 10</Text>
            </View>
            
            {/* Primary Action Button */}
            <Button
              title={segments.length > 0 ? "Re-segment Script" : "Segment Script"}
              onPress={segmentScript}
              variant="primary"
              style={[styles.primaryActionButton, {
                backgroundColor: theme.colors.primary,
                borderWidth: 0,
                elevation: 3,
              }]}
              textStyle={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 16,
                textAlign: 'center',
                lineHeight: 20
              }}
              disabled={isSegmenting}
            />
            
            {/* Guidance text */}
            <Text style={styles.guidanceText}>
              {segments.length === 0 
                ? "Click 'Segment Script' to automatically divide your script into manageable parts." 
                : "Review and edit your segments below, then proceed to the next step."
              }
            </Text>
          </View>

          {segments.length > 0 && (
            <View style={styles.segmentsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Review Your Segments:</Text>
              
              {segments.map((segment, index) => (
                <View 
                  key={segment.id} 
                  style={[styles.segmentCard, { borderColor: theme.colors.border }]}
                >
                  <View style={styles.segmentHeader}>
                    <Text style={[styles.segmentIndexText, { color: theme.colors.textSecondary }]}>
                      Segment {index + 1} of {segments.length}
                    </Text>
                    <TextInput
                      style={[styles.segmentTitleInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                      value={segment.title}
                      onChangeText={(text) => updateSegmentTitle(index, text)}
                      placeholder="Segment Title"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                  
                  <TextInput
                    style={[styles.segmentContentInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                    value={segment.content}
                    onChangeText={(text) => updateSegmentContent(index, text)}
                    placeholder="Segment content..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={6}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        
          {/* Fixed bottom action area */}
          <View style={styles.bottomContainer}>
            {segments.length > 0 && (
              <View style={styles.nextStepPrompt}>
                <Text style={styles.nextStepText}>Ready to proceed?</Text>
                <Text style={styles.nextStepDescription}>Move to character generation and processing</Text>
              </View>
            )}
            
            {/* Streamlined Workflow Option */}
            <TouchableOpacity
              style={[styles.continueButton, { marginBottom: 12 }]}
              onPress={continueToStreamlinedWorkflow}
            >
              <View style={[styles.continueGradient, { backgroundColor: '#10b981' }]}>
                <Text style={styles.continueText}>
                  🚀 Quick Create (Recommended) →
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.continueButton, segments.length === 0 && styles.disabledButton]}
              onPress={continueToSegmentProcessing}
              disabled={segments.length === 0}
            >
              <View style={[styles.continueGradient, { backgroundColor: segments.length > 0 ? '#3b82f6' : '#9ca3af' }]}>
                <Text style={styles.continueText}>
                  {segments.length > 0 ? "Advanced Processing →" : "Please Segment Script First"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    </View>
  );
};

// Create styles with dynamic theme-based colors
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 24,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  segmentationContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.text,
  },
  segmentSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 16,
  },
  segmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentButtonText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmentNumberContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  segmentNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  segmentsContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.text,
  },
  segmentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  segmentHeader: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  segmentIndexText: {
    fontSize: 12,
    marginBottom: 4,
    color: theme.colors.textSecondary,
  },
  segmentTitleInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    fontWeight: '500',
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  segmentContentInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 120,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    width: '100%',
  },
  progressHeader: {
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: '#3b82f6',
  },
  stepPending: {
    backgroundColor: theme.colors.surface,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepNumberPending: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  stepLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  stepConnector: {
    width: 20,
    height: 2,
    backgroundColor: theme.colors.border,
  },
  currentStepBanner: {
    marginBottom: 16,
  },
  currentStepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  currentStepDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  primaryActionButton: {
    width: '100%',
    marginVertical: 16,
  },
  guidanceText: {
    marginBottom: 16,
    color: theme.colors.textSecondary,
  },
  nextStepPrompt: {
    marginBottom: 16,
  },
  nextStepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  nextStepDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderRadius: 25,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  scriptPreviewToggle: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scriptPreviewToggleGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  scriptPreviewToggleText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
  },
  scriptPreviewToggleIcon: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scriptPreviewContainer: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scriptPreviewGradient: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  scriptPreviewTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  scriptPreviewScroll: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scriptPreviewText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});

export default ScriptSegmentationScreen;
