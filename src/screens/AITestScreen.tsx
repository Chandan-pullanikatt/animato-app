import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { generateImage, generateVideo, generateCharacterImages } from '../utils/api';
import { Video } from 'expo-av';

const AITestScreen = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testImageGeneration = async () => {
    setIsLoading(true);
    addResult('Starting image generation test...');
    
    try {
      const prompt = 'A digital portrait of a content creator with a smartphone, vibrant colors, futuristic style';
      const result = await generateImage(prompt, 'futuristic');
      setImageUrl(result);
      addResult(`✅ Image generated successfully: ${result}`);
    } catch (error) {
      console.error('Error in image test:', error);
      addResult(`❌ Image generation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCharacterImageGeneration = async () => {
    setIsLoading(true);
    addResult('Starting character image generation test...');
    
    try {
      const characters = [
        {
          name: 'Alex',
          description: 'A tech enthusiast and content creator',
          traits: ['Creative', 'Tech-savvy', 'Enthusiastic']
        }
      ];
      
      const results = await generateCharacterImages(characters, 'modern');
      addResult(`✅ Character images generated: ${results.length} images`);
      if (results.length > 0) {
        setImageUrl(results[0].imageUrl);
      }
    } catch (error) {
      console.error('Error in character image test:', error);
      addResult(`❌ Character image generation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVideoGeneration = async () => {
    setIsLoading(true);
    addResult('Starting video generation test...');
    
    try {
      const script = 'SCENE 1: [Modern office setting]\n[Alex]: Today we\'re going to create amazing content with AI!\n\nSCENE 2: [Close-up of smartphone]\n[Alex]: Just a few taps and your video is ready to share.';
      
      const characters = [
        {
          name: 'Alex',
          imageUrl: imageUrl || 'https://picsum.photos/seed/123/200/200'
        }
      ];
      
      const result = await generateVideo(
        script,
        [{ title: 'AI Content Creation', content: script }],
        characters,
        'modern tech'
      );
      
      setVideoUrl(result);
      addResult(`✅ Video generated successfully: ${result}`);
    } catch (error) {
      console.error('Error in video test:', error);
      addResult(`❌ Video generation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>AI Integration Test</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Verify that all AI features are working correctly
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Test Image Generation" 
            onPress={testImageGeneration} 
            disabled={isLoading}
          />
          <Button 
            title="Test Character Images" 
            onPress={testCharacterImageGeneration} 
            disabled={isLoading}
            style={{ marginTop: 10 }}
          />
          <Button 
            title="Test Video Generation" 
            onPress={testVideoGeneration} 
            disabled={isLoading || !imageUrl}
            style={{ marginTop: 10 }}
          />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Processing AI request...
            </Text>
          </View>
        )}

        {imageUrl && (
          <View style={styles.mediaContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Generated Image</Text>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="contain"
            />
          </View>
        )}

        {videoUrl && (
          <View style={styles.mediaContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Generated Video</Text>
            <Video
              source={{ uri: videoUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay={false}
              isLooping={false}
              useNativeControls
              style={styles.video}
            />
          </View>
        )}

        <View style={styles.resultsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Test Results</Text>
          {testResults.map((result, index) => (
            <Text 
              key={index} 
              style={[
                styles.resultText, 
                { 
                  color: result.includes('✅') ? '#28a745' : 
                         result.includes('❌') ? '#dc3545' : 
                         theme.colors.text 
                }
              ]}
            >
              {result}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  mediaContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  }
});

export default AITestScreen;
