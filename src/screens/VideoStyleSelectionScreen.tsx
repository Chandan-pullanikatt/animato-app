import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';

type VideoStyleSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoStyleSelection'>;

interface VideoStyleSelectionScreenProps {
  navigation: VideoStyleSelectionScreenNavigationProp;
  route?: {
    params?: {
      script?: string;
      contentTheme?: string;
      segments?: any[];
    }
  }
}

interface VideoStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  tags: string[];
}

const videoStyles: VideoStyle[] = [
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Photorealistic characters with natural lighting',
    preview: '🎬',
    tags: ['Professional', 'Natural']
  },
  {
    id: 'anime',
    name: 'Anime Style',
    description: 'Vibrant animation with expressive characters',
    preview: '🎌',
    tags: ['Animated', 'Colorful']
  },
  {
    id: 'comic',
    name: 'Comic Book',
    description: 'Bold comic style with dramatic lighting',
    preview: '💥',
    tags: ['Bold', 'Dynamic']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon-lit environments',
    preview: '🌆',
    tags: ['Futuristic', 'Neon']
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magical worlds with mystical characters',
    preview: '🧙‍♂️',
    tags: ['Magical', 'Mystical']
  },
  {
    id: 'noir',
    name: 'Film Noir',
    description: 'Classic black and white with dramatic shadows',
    preview: '🕵️',
    tags: ['Classic', 'Dramatic']
  }
];

const VideoStyleSelectionScreen: React.FC<VideoStyleSelectionScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>('realistic');
  
  const { script = '', contentTheme = 'drama', segments = [] } = route?.params || {};

  const handleContinue = () => {
    if (!selectedVideoStyle) {
      return;
    }

    const combinedTheme = `${contentTheme}-${selectedVideoStyle}`;
    console.log('Selected video style:', selectedVideoStyle);
    console.log('Combined theme:', combinedTheme);
    
    // Check if we have segments (coming from end of flow) or not (coming from middle of flow)
    if (segments && segments.length > 0) {
      // Coming from end of flow - go to final video generation
      const allCharacters = segments.flatMap(segment => segment.characters || []);
      const allPhotos = segments.flatMap(segment => segment.photos || []);
      
      navigation.navigate('VideoGeneration', {
        script: script,
        theme: combinedTheme,
        characters: allCharacters,
        photos: allPhotos,
        videoStyle: selectedVideoStyle,
        contentTheme: contentTheme
      });
    } else {
      // Coming from middle of flow - go to character generation
      navigation.navigate('CharacterGeneration', {
        script: script,
        theme: combinedTheme,
        videoStyle: selectedVideoStyle,
        contentTheme: contentTheme
      });
    }
  };

  const canContinue = selectedVideoStyle;

  return (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {segments && segments.length > 0 ? "Final Step: Choose Video Style" : "Choose Video Style"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {segments && segments.length > 0 ? "Select how your final video will look" : "Select the visual style for your video"}
          </Text>
        </View>

        {/* Video Style Selection */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Visual Style</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Choose how your video will look
          </Text>
          
          <View style={styles.gridContainer}>
            {videoStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: selectedVideoStyle === style.id ? theme.colors.primary : theme.colors.border,
                    borderWidth: selectedVideoStyle === style.id ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedVideoStyle(style.id)}
              >
                <Text style={styles.stylePreview}>{style.preview}</Text>
                <Text style={[styles.styleName, { color: theme.colors.text }]}>{style.name}</Text>
                <Text style={[styles.styleDescription, { color: theme.colors.textSecondary }]}>
                  {style.description}
                </Text>
                <View style={styles.tagsContainer}>
                  {style.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}
                    >
                      <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={segments && segments.length > 0 ? "Generate Final Video" : "Continue to Character Creation"}
            onPress={handleContinue}
            variant="primary"
            disabled={!canContinue}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
    fontFamily: 'System',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'System',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    fontFamily: 'System',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 160,
  },
  stylePreview: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 6,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'System',
  },
  styleDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 14,
    fontFamily: 'System',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    margin: 1,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '500',
    fontFamily: 'System',
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  continueButton: {
    marginTop: 6,
  },
});

export default VideoStyleSelectionScreen; 