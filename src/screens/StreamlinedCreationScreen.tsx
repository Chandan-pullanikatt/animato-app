import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { generateCharactersFromScript, Character } from '../utils/characterGenerationAPI';
import { generateAIImage, AIImageRequest, getHuggingFaceSetupInstructions } from '../utils/aiImageService';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

type StreamlinedCreationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StreamlinedCreation'>;

interface Props {
  navigation: StreamlinedCreationScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      videoStyle: string;
      contentTheme: string;
    };
  };
}

interface CharacterWithImage extends Character {
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

const StreamlinedCreationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { script, theme, videoStyle, contentTheme } = route.params;
  const { colors } = useTheme();
  const { showAlert, showSuccess, showError, hideAlert, visible, alertConfig } = useCustomAlert();

  const [characters, setCharacters] = useState<CharacterWithImage[]>([]);
  const [isGeneratingCharacters, setIsGeneratingCharacters] = useState(false);
  const [currentStep, setCurrentStep] = useState<'characters' | 'images' | 'complete'>('characters');

  useEffect(() => {
    generateCharacters();
  }, []);

  const generateCharacters = async () => {
    setIsGeneratingCharacters(true);
    try {
      console.log('🎭 Generating AI characters for streamlined workflow...');
      
      const generatedCharacters = await generateCharactersFromScript(
        script,
        videoStyle,
        contentTheme,
        3 // Generate 3 characters max for simplicity
      );
      
      setCharacters(generatedCharacters);
      setCurrentStep('images');
      
      showSuccess(
        'Characters Created!', 
        `Generated ${generatedCharacters.length} unique characters. Now let's create their images!`
      );
      
      // Auto-generate images for all characters
      generateAllImages(generatedCharacters);
      
    } catch (error) {
      console.error('Error generating characters:', error);
      showError('Character Generation Failed', 'Unable to create characters. Please try again.');
    } finally {
      setIsGeneratingCharacters(false);
    }
  };

  const generateAllImages = async (charactersToProcess: CharacterWithImage[]) => {
    console.log('🖼️ Auto-generating images for all characters...');
    
    for (let i = 0; i < charactersToProcess.length; i++) {
      const character = charactersToProcess[i];
      
      // Update state to show this character is generating
      setCharacters(prev => prev.map(c => 
        c.id === character.id 
          ? { ...c, isGeneratingImage: true }
          : c
      ));
      
      try {
        const imageRequest: AIImageRequest = {
          prompt: `${character.description}, ${character.traits.join(', ')}, professional portrait`,
          style: videoStyle,
          width: 512,
          height: 512,
          quality: 'high'
        };
        
        const aiResponse = await generateAIImage(imageRequest);
        
        // Update character with generated image
        setCharacters(prev => prev.map(c => 
          c.id === character.id 
            ? { ...c, imageUrl: aiResponse.url, isGeneratingImage: false }
            : c
        ));
        
        console.log(`✅ Generated image for ${character.name}`);
        
      } catch (error) {
        console.error(`Error generating image for ${character.name}:`, error);
        
        // Update with error state
        setCharacters(prev => prev.map(c => 
          c.id === character.id 
            ? { ...c, isGeneratingImage: false }
            : c
        ));
      }
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCurrentStep('complete');
    showSuccess(
      'All Set!', 
      'Characters and images are ready! You can now proceed to create your video.'
    );
  };

  const regenerateCharacterImage = async (character: CharacterWithImage) => {
    setCharacters(prev => prev.map(c => 
      c.id === character.id 
        ? { ...c, isGeneratingImage: true }
        : c
    ));
    
    try {
      const imageRequest: AIImageRequest = {
        prompt: `${character.description}, ${character.traits.join(', ')}, professional portrait, ${videoStyle} style`,
        style: videoStyle,
        width: 512,
        height: 512,
        quality: 'high'
      };
      
      const aiResponse = await generateAIImage(imageRequest);
      
      setCharacters(prev => prev.map(c => 
        c.id === character.id 
          ? { ...c, imageUrl: aiResponse.url, isGeneratingImage: false }
          : c
      ));
      
      showSuccess('Image Updated!', `New image generated for ${character.name}`);
      
    } catch (error) {
      console.error('Error regenerating image:', error);
      showError('Image Generation Failed', 'Unable to generate new image. Please try again.');
      
      setCharacters(prev => prev.map(c => 
        c.id === character.id 
          ? { ...c, isGeneratingImage: false }
          : c
      ));
    }
  };

  const proceedToVideoGeneration = () => {
    const charactersWithImages = characters.filter(c => c.imageUrl);
    
    if (charactersWithImages.length === 0) {
      showError('No Images Ready', 'Please wait for character images to be generated.');
      return;
    }
    
    // Navigate to video generation with the streamlined data
    navigation.navigate('VideoGeneration', {
      script,
      theme,
      characters: charactersWithImages,
      photos: charactersWithImages.map(c => ({
        id: `photo-${c.id}`,
        characterName: c.name,
        imageUrl: c.imageUrl!
      })),
      videoStyle,
      contentTheme
    });
  };

  const showSetupInstructions = () => {
    showAlert({
      title: 'Free AI Image Setup',
      message: getHuggingFaceSetupInstructions(),
      type: 'info',
      buttons: [{ text: 'Got it!', onPress: () => {}, style: 'primary' }]
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[
        styles.step, 
        { backgroundColor: currentStep === 'characters' ? colors.primary : colors.success }
      ]}>
        <Text style={styles.stepText}>1</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={[
        styles.step, 
        { backgroundColor: currentStep === 'images' ? colors.primary : 
          currentStep === 'complete' ? colors.success : colors.border }
      ]}>
        <Text style={styles.stepText}>2</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={[
        styles.step, 
        { backgroundColor: currentStep === 'complete' ? colors.success : colors.border }
      ]}>
        <Text style={styles.stepText}>3</Text>
      </View>
    </View>
  );

  const renderCharacterCard = (character: CharacterWithImage) => (
    <View key={character.id} style={[styles.characterCard, { backgroundColor: colors.surface }]}>
      <View style={styles.characterInfo}>
        <Text style={[styles.characterName, { color: colors.text }]}>{character.name}</Text>
        <Text style={[styles.characterRole, { color: colors.textSecondary }]}>{character.role}</Text>
        <Text style={[styles.characterDescription, { color: colors.textSecondary }]}>
          {character.description}
        </Text>
        <View style={styles.traitsContainer}>
          {character.traits.slice(0, 3).map((trait, index) => (
            <View key={index} style={[styles.trait, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.traitText, { color: colors.primary }]}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.imageContainer}>
        {character.isGeneratingImage ? (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Text style={[styles.generatingText, { color: colors.textSecondary }]}>
              Generating...
            </Text>
          </View>
        ) : character.imageUrl ? (
          <TouchableOpacity onPress={() => regenerateCharacterImage(character)}>
            <Image source={{ uri: character.imageUrl }} style={styles.characterImage} />
            <Text style={[styles.regenerateHint, { color: colors.textSecondary }]}>
              Tap to regenerate
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Image pending...
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create Your Video</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          AI-powered characters and images in 3 simple steps
        </Text>
        {renderStepIndicator()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'characters' && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Step 1: Generating Characters
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              AI is creating unique characters based on your script...
            </Text>
            {isGeneratingCharacters && (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.primary }]}>
                  🎭 Creating characters with AI...
                </Text>
              </View>
            )}
          </View>
        )}

        {(currentStep === 'images' || currentStep === 'complete') && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              {currentStep === 'images' ? 'Step 2: Generating Images' : 'Step 3: Ready to Create!'}
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              {currentStep === 'images' 
                ? 'AI is creating realistic images for each character...'
                : 'Your characters and images are ready! Proceed to create your video.'
              }
            </Text>
            
            <View style={styles.charactersContainer}>
              {characters.map(renderCharacterCard)}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.setupButton, { backgroundColor: colors.surface }]}
          onPress={showSetupInstructions}
        >
          <Text style={[styles.setupButtonText, { color: colors.primary }]}>
            🎨 Setup Free AI Images
          </Text>
        </TouchableOpacity>
        
        {currentStep === 'complete' && (
          <Button
            title="Create Video"
            onPress={proceedToVideoGeneration}
            style={styles.proceedButton}
          />
        )}
      </View>

      <CustomAlert
        visible={visible}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  charactersContainer: {
    gap: 16,
  },
  characterCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  characterInfo: {
    flex: 1,
    marginRight: 16,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  characterRole: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  characterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  trait: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    width: 120,
    alignItems: 'center',
  },
  characterImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 4,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 12,
    textAlign: 'center',
  },
  regenerateHint: {
    fontSize: 10,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  setupButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  proceedButton: {
    marginTop: 8,
  },
});

export default StreamlinedCreationScreen; 