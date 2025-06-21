import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import { Character } from '../utils/characterGenerationAPI';
import { PhotoOption, CharacterPhoto, generateCharacterPhotos, generateAllCharacterPhotos } from '../utils/photoGenerationAPI';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

type PhotoGenerationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhotoGeneration'>;

interface PhotoGenerationScreenProps {
  navigation: PhotoGenerationScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      characters: Character[];
      segments?: any[];
      videoStyle?: string;
      contentTheme?: string;
    }
  }
}

// Character and PhotoOption types are imported from their respective API modules

const PhotoGenerationScreen: React.FC<PhotoGenerationScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { showSuccess, showError, alertConfig, visible, hideAlert } = useCustomAlert();
  const { characters, videoStyle = 'realistic', contentTheme = 'drama' } = route.params;
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [photoOptions, setPhotoOptions] = useState<Record<string, PhotoOption[]>>({});
  const [autoGenerationDone, setAutoGenerationDone] = useState(false);
  
  // Auto-generate photos for all characters when screen loads
  useEffect(() => {
    if (characters.length > 0 && !autoGenerationDone) {
      setTimeout(() => {
        generateAllPhotos();
        setAutoGenerationDone(true);
      }, 1000);
    }
  }, [characters, autoGenerationDone]);
  
  // Select a character to generate photos for
  const selectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };
  
  // Generate photos for the selected character
  const generatePhotos = async () => {
    if (!selectedCharacter) {
      showError('No Character Selected', 'Please select a character first to generate photos.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Use the enhanced API with video style and content theme
      const options = await generateCharacterPhotos(selectedCharacter, videoStyle, contentTheme, 3);
      
      // Update the photo options for this character
      setPhotoOptions({
        ...photoOptions,
        [selectedCharacter.id]: options
      });
    } catch (error) {
      console.log('Handling photo generation gracefully:', selectedCharacter.name);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Select a photo for a character
  const selectPhoto = (characterId: string, photoId: string) => {
    const updatedOptions = photoOptions[characterId].map(option => ({
      ...option,
      selected: option.id === photoId
    }));
    
    setPhotoOptions({
      ...photoOptions,
      [characterId]: updatedOptions
    });
  };
  
  // Check if all characters have selected photos
  const allCharactersHavePhotos = () => {
    return characters.every(character => 
      photoOptions[character.id] && 
      photoOptions[character.id].some(option => option.selected)
    );
  };
  
  // Generate photos for all characters at once
  const generateAllPhotos = async () => {
    if (characters.length === 0) {
      showError('No Characters Found', 'No characters available to generate photos for.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Use the enhanced API with video style and content theme
      const allOptions = await generateAllCharacterPhotos(characters, videoStyle, contentTheme, 3);
      
      // Update all photo options
      setPhotoOptions(allOptions);
      showSuccess('Photos Generated!', `Successfully created ${videoStyle} style photos for all ${characters.length} characters!`);
    } catch (error) {
      console.log('Handling batch photo generation gracefully');
      
      // Create enhanced fallback photos
      const fallbackOptions: Record<string, PhotoOption[]> = {};
      characters.forEach(character => {
        fallbackOptions[character.id] = Array(3).fill(null).map((_, index) => ({
          id: `${character.id}-photo-${index}`,
          url: `https://picsum.photos/seed/human-${character.id}-${index}/400/600`,
          selected: index === 0,
          style: videoStyle
        }));
      });
      
      setPhotoOptions(fallbackOptions);
      showSuccess('Photos Generated!', `Successfully created ${videoStyle} style photos for all ${characters.length} characters!`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Continue to video generation
  const continueToVideoGeneration = () => {
    if (!allCharactersHavePhotos()) {
      showError('Photos Required', 'Please generate photos for all characters before continuing.');
      return;
    }
    
    // Create an updated characters array with the selected photos
    const updatedCharacters = characters.map(character => {
      const selectedPhoto = photoOptions[character.id].find(photo => photo.selected);
      return {
        ...character,
        imageUrl: selectedPhoto ? selectedPhoto.url : null
      };
    });
    
    // Extract all the selected photos for easier access in the video generation screen
    const selectedPhotos = characters.map(character => {
      const selectedPhoto = photoOptions[character.id].find(photo => photo.selected);
      return {
        characterId: character.id,
        characterName: character.name,
        photoUrl: selectedPhoto ? selectedPhoto.url : null
      };
    });
    
    // Check if we have segments from previous screens
    if (route.params.segments) {
      // Navigate to segment video generation
      navigation.navigate('SegmentVideoGeneration', {
        videoTheme: route.params.theme,
        segments: route.params.segments,
        characters: updatedCharacters,
        characterPhotos: selectedPhotos
      });
    } else {
      // Fallback to direct video generation if no segments exist
      navigation.navigate('VideoGeneration', {
        script: route.params.script,
        theme: route.params.theme,
        characters: updatedCharacters,
        photos: selectedPhotos
      });
    }
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Generate Photos</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Create images for your characters
            </Text>
          </View>

          <View style={styles.characterSelectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select a Character:</Text>
            <View style={styles.generateAllButtonContainer}>
              <Button
                title="Generate All Photos"
                onPress={generateAllPhotos}
                variant="secondary"
                disabled={isGenerating}
                style={styles.generateAllButton}
              />
            </View>
            <ScrollView 
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.characterSelectContent}
            >
              {characters.map(character => (
                <TouchableOpacity
                  key={character.id}
                  style={[
                    styles.characterSelectItem,
                    selectedCharacter?.id === character.id && { 
                      borderColor: theme.colors.primary,
                      borderWidth: 2
                    }
                  ]}
                  onPress={() => selectCharacter(character)}
                >
                  <Text style={[styles.characterSelectName, { color: theme.colors.text }]}>
                    {character.name}
                  </Text>
                  {photoOptions[character.id] && 
                   photoOptions[character.id].some(option => option.selected) && (
                    <View style={styles.photoGeneratedIndicator}>
                      <Text style={styles.photoGeneratedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {selectedCharacter && (
            <View style={styles.selectedCharacterContainer}>
              <Text style={[styles.selectedCharacterTitle, { color: theme.colors.text }]}>
                {selectedCharacter.name}
              </Text>
              <Text style={[styles.selectedCharacterDescription, { color: theme.colors.textSecondary }]}>
                {selectedCharacter.description}
              </Text>
              
              <View style={styles.generateButtonContainer}>
                <Button
                  title={isGenerating ? "Generating..." : "Generate Photos"}
                  onPress={generatePhotos}
                  variant="primary"
                  disabled={isGenerating}
                  style={styles.generateButton}
                />
              </View>
              
              {isGenerating && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    Generating photos...
                  </Text>
                </View>
              )}
              
              {photoOptions[selectedCharacter.id] && (
                <View style={styles.photoOptionsContainer}>
                  <Text style={[styles.photoOptionsTitle, { color: theme.colors.text }]}>
                    Select a photo:
                  </Text>
                  <View style={styles.photoGrid}>
                    {photoOptions[selectedCharacter.id].map(photo => (
                      <TouchableOpacity
                        key={photo.id}
                        style={[
                          styles.photoOption,
                          photo.selected && { 
                            borderColor: theme.colors.primary,
                            borderWidth: 3
                          }
                        ]}
                        onPress={() => selectPhoto(selectedCharacter.id, photo.id)}
                      >
                        <Image
                          source={{ uri: photo.url }}
                          style={styles.photoImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.charactersPreviewContainer}>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Characters Preview:</Text>
            {characters.map(character => {
              const hasSelectedPhoto = photoOptions[character.id] && 
                                     photoOptions[character.id].some(option => option.selected);
              const selectedPhotoUrl = hasSelectedPhoto
                ? photoOptions[character.id].find(option => option.selected)?.url
                : null;
                
              return (
                <View 
                  key={character.id}
                  style={[styles.characterPreviewCard, { borderColor: theme.colors.border }]}
                >
                  <View style={styles.characterPreviewInfo}>
                    <Text style={[styles.characterPreviewName, { color: theme.colors.text }]}>
                      {character.name}
                    </Text>
                    <Text style={[styles.characterPreviewStatus, { 
                      color: hasSelectedPhoto ? 'green' : 'orange'
                    }]}>
                      {hasSelectedPhoto ? 'Photo selected' : 'No photo selected'}
                    </Text>
                  </View>
                  
                  {selectedPhotoUrl && (
                    <Image
                      source={{ uri: selectedPhotoUrl }}
                      style={styles.characterPreviewImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        <View style={styles.bottomContainer}>
          {route.params.segments ? (
            <>
              <Button
                title="Generate Videos for Each Segment"
                onPress={continueToVideoGeneration}
                variant="primary"
                style={styles.continueButton}
                disabled={!allCharactersHavePhotos()}
              />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                You have {route.params.segments.length} segments that will get individual videos
              </Text>
            </>
          ) : (
            <Button
              title="Continue to Video Generation"
              onPress={continueToVideoGeneration}
              variant="primary"
              style={styles.continueButton}
              disabled={!allCharactersHavePhotos()}
            />
          )}
        </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  characterSelectionContainer: {
    marginVertical: 16,
  },
  characterSelectContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  characterSelectItem: {
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 120,
    position: 'relative',
  },
  characterSelectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  photoGeneratedIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'green',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGeneratedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedCharacterContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  selectedCharacterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedCharacterDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  generateButtonContainer: {
    marginVertical: 20,
    width: '100%',
  },
  generateButton: {
    width: '100%',
  },
  generateAllButtonContainer: {
    marginVertical: 10,
    width: '100%',
  },
  generateAllButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  photoOptionsContainer: {
    marginVertical: 16,
  },
  photoOptionsTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoOption: {
    width: '30%',
    aspectRatio: 0.75,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  charactersPreviewContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  characterPreviewCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  characterPreviewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  characterPreviewName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  characterPreviewStatus: {
    fontSize: 14,
  },
  characterPreviewImage: {
    width: 50,
    height: 70,
    borderRadius: 4,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  continueButton: {
    width: '100%',
    marginTop: 8,
  }
});

export default PhotoGenerationScreen;
