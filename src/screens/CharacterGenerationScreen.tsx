import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { generateSingleCharacter, generateCharactersFromScript, Character } from '../utils/characterGenerationAPI';
import { generateAIImage, AIImageRequest } from '../utils/aiImageService';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

type CharacterGenerationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CharacterGeneration'>;

interface CharacterGenerationScreenProps {
  navigation: CharacterGenerationScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      videoStyle: string;
      contentTheme: string;
      segmentCharacters?: Character[];
    }
  }
}

// Character type is imported from characterGenerationAPI

const CharacterGenerationScreen: React.FC<CharacterGenerationScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { showSuccess, showError, showInfo, showConfirm, alertConfig, visible, hideAlert } = useCustomAlert();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [segmentCharactersAdded, setSegmentCharactersAdded] = useState(false);
  
  // Extract script, theme, and segment characters from route params
  const { script, theme: videoTheme, videoStyle, contentTheme, segmentCharacters = [] } = route.params;
  
  // Check if we have segment characters and add them to the character list
  useEffect(() => {
    if (segmentCharacters && segmentCharacters.length > 0 && !segmentCharactersAdded) {
      // De-duplicate characters by name
      const uniqueCharacters = segmentCharacters.filter(
        (char, index, self) => 
          index === self.findIndex(c => c.name === char.name)
      );
      
      setCharacters(prevChars => {
        // Merge with existing characters, avoiding duplicates by name
        const existingNames = new Set(prevChars.map(c => c.name));
        const newChars = uniqueCharacters.filter(char => !existingNames.has(char.name));
        
        if (newChars.length > 0) {
          showInfo('Characters Loaded', `${newChars.length} characters from your script segments have been added. You can view, edit, or add more characters below.`);
        }
        
        return [...prevChars, ...newChars];
      });
      
      setSegmentCharactersAdded(true);
    }
  }, [segmentCharacters, segmentCharactersAdded]);

  const addCharacter = () => {
    if (characterName.trim() === '' || characterDescription.trim() === '') {
      showError('Missing Information', 'Please enter both character name and description to continue.');
      return;
    }

    // Check if character with same name already exists
    const existingCharacter = characters.find(char => char.name.toLowerCase() === characterName.toLowerCase());
    if (existingCharacter) {
      showError('Character Exists', 'A character with this name already exists. Please choose a different name.');
      return;
    }

    const newCharacter: Character = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: characterName,
      description: characterDescription,
      traits: ['Creative', 'Unique'],
      role: 'supporting',
      age: 'adult',
      gender: 'neutral'
    };

    setCharacters([...characters, newCharacter]);
    setCharacterName('');
    setCharacterDescription('');
    showSuccess('Character Added!', 'Your new character has been successfully created and added to the list.');
  };

  const generateCharacterFromDescription = async () => {
    if (characterDescription.trim() === '') {
      showError('Description Required', 'Please enter a character description to generate with AI.');
      return;
    }

    setIsGenerating(true);

    try {
      console.log(`🎭 Generating AI character for ${contentTheme} theme in ${videoStyle} style`);
      
      const generatedCharacter = await generateSingleCharacter(
        characterDescription,
        videoStyle,
        contentTheme
      );
      
      // Check if character with same name already exists
      const existingCharacter = characters.find(char => char.name.toLowerCase() === generatedCharacter.name.toLowerCase());
      if (existingCharacter) {
        showError('Character Already Exists', `A character named "${generatedCharacter.name}" already exists. Please try a different description.`);
        setIsGenerating(false);
        return;
      }

      setCharacters([...characters, generatedCharacter]);
      setCharacterDescription('');
      showSuccess('AI Character Generated!', `Successfully created "${generatedCharacter.name}" using AI. Ready to add more characters or continue.`);
    } catch (error) {
      console.error('❌ Error generating AI character:', error);
      showError('Generation Failed', 'Unable to generate character with AI. Please try again or create manually.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to automatically generate all characters from the script
  const autoGenerateAllCharacters = async () => {
    if (!script || script.trim() === '') {
      showError('No Script Found', 'No script available. Please go back and create a script first.');
      return;
    }
    
    setIsAutoGenerating(true);
    
    try {
      console.log(`🎬 Auto-generating AI characters for ${contentTheme} theme in ${videoStyle} style`);
      
      // Use the real AI API to extract and generate characters from the script
      const generatedCharacters = await generateCharactersFromScript(
        script, 
        videoStyle, 
        contentTheme, 
        3 // Generate 3 characters
      );
      
      // Filter out characters that already exist (by name)
      const existingNames = new Set(characters.map(c => c.name.toLowerCase()));
      const newCharacters = generatedCharacters.filter(char => !existingNames.has(char.name.toLowerCase()));
      
      if (newCharacters.length === 0) {
        Alert.alert('No New Characters', 'All characters from the script already exist in your character list.');
        return;
      }
      
      // Add new characters to existing ones
      setCharacters(prevChars => [...prevChars, ...newCharacters]);
      Alert.alert('Success', `✅ Generated ${newCharacters.length} AI characters based on your ${contentTheme} script!`);
    } catch (error) {
      console.error('❌ Error auto-generating AI characters:', error);
      Alert.alert('Error', 'Failed to generate characters from script with AI. Please try again or create characters manually.');
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const continueToPhotoGeneration = () => {
    if (characters.length === 0) {
      Alert.alert('Error', 'Please add at least one character');
      return;
    }

    // Navigate to the Photo Generation screen
    navigation.navigate('PhotoGeneration', {
      script: route.params.script,
      theme: route.params.theme,
      characters: characters
    });
  };

  // Skip character generation and go directly to video compilation
  const skipCharacterGeneration = () => {
    Alert.alert(
      'Skip Character Generation',
      'Are you sure you want to skip character generation? You can still create a video without custom characters.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => {
            // Navigate directly to video compilation with empty characters
            navigation.navigate('VideoCompilation', {
              script: script,
              theme: videoTheme,
              processedSegments: [] // Empty segments since we're skipping
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Character Generation</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Create characters for your video
            </Text>
          </View>

          {/* Auto-generate section */}
          <View style={styles.autoGenerateContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Start:</Text>
            <Button
              title={isAutoGenerating ? "Generating..." : "Auto-Generate Characters from Script"}
              onPress={autoGenerateAllCharacters}
              variant="primary"
              disabled={isAutoGenerating}
              style={styles.autoGenerateButton}
            />
            <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
              This will analyze your script and automatically create characters
            </Text>
          </View>

          {/* Manual character creation */}
          <View style={styles.manualCreateContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Or Create Manually:</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Character Name:</Text>
              <TextInput
                style={[styles.textInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                placeholder="Enter character name"
                placeholderTextColor={theme.colors.textSecondary}
                value={characterName}
                onChangeText={setCharacterName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Character Description:</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
                placeholder="Describe the character's appearance, personality, role..."
                placeholderTextColor={theme.colors.textSecondary}
                value={characterDescription}
                onChangeText={setCharacterDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              style={styles.buttonScrollContainer}
            >
              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Add Character"
                    onPress={addCharacter}
                    variant="primary"
                    style={{ 
                      width: '100%',
                      backgroundColor: theme.colors.primary,
                      borderWidth: 0,
                      elevation: 3,
                      height: 52,
                      paddingVertical: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    textStyle={{ 
                      color: '#fff', 
                      fontWeight: '600',
                      fontSize: 16,
                      textAlign: 'center',
                      lineHeight: 20
                    }}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title={isGenerating ? "Generating..." : "Generate with AI"}
                    onPress={generateCharacterFromDescription}
                    variant="primary"
                    style={{ 
                      width: '100%',
                      backgroundColor: theme.colors.primary,
                      borderWidth: 0,
                      elevation: 3,
                      height: 52,
                      paddingVertical: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    textStyle={{ 
                      color: '#fff', 
                      fontWeight: '600',
                      fontSize: 16,
                      textAlign: 'center',
                      lineHeight: 20
                    }}
                    disabled={isGenerating}
                  />
                </View>
              </View>
            </ScrollView>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Characters:</Text>
          
          {characters.length === 0 ? (
            <View style={styles.noCharactersContainer}>
              <Text style={[styles.noCharactersText, { color: theme.colors.textSecondary }]}>
                No characters created yet. Use the options above to add characters.
              </Text>
            </View>
          ) : (
            <View style={styles.charactersContainer}>
              {characters.map((character, index) => (
                <View key={character.id} style={[styles.characterCard, { borderColor: theme.colors.border }]}>
                  <View style={styles.characterHeader}>
                    <Text style={[styles.characterName, { color: theme.colors.text }]}>
                      {character.name}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => removeCharacter(character.id)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.characterDescription, { color: theme.colors.textSecondary }]}>
                    {character.description}
                  </Text>
                  {character.traits && character.traits.length > 0 && (
                    <View style={styles.traitsContainer}>
                      {character.traits.map((trait, traitIndex) => (
                        <View key={traitIndex} style={[styles.traitBadge, { backgroundColor: theme.colors.primaryLight }]}>
                          <Text style={[styles.traitText, { color: theme.colors.primary }]}>
                            {trait}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Fixed bottom buttons */}
        <View style={[styles.bottomContainer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <View style={styles.bottomButtonsContainer}>
            <Button
              title="Skip Characters"
              onPress={skipCharacterGeneration}
              variant="secondary"
              style={styles.skipButton}
            />
            <Button
              title="Continue to Photos"
              onPress={continueToPhotoGeneration}
              variant="primary"
              style={styles.continueButton}
              disabled={characters.length === 0}
            />
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Extra padding for fixed buttons
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  autoGenerateContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  autoGenerateButton: {
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  manualCreateContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonScrollContainer: {
    marginTop: 16,
    flexGrow: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    minWidth: 150,
  },
  charactersContainer: {
    marginBottom: 20,
  },
  noCharactersContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 20,
  },
  noCharactersText: {
    fontSize: 16,
    textAlign: 'center',
  },
  characterCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  characterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
});

export default CharacterGenerationScreen;
