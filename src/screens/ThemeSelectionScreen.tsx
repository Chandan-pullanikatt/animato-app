import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';


type ThemeSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ThemeSelection'>;

interface ThemeSelectionScreenProps {
  navigation: ThemeSelectionScreenNavigationProp;
}

interface ContentTheme {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string[];
}

const contentThemes: ContentTheme[] = [
  { id: 'comedy', name: 'Comedy', description: 'Light-hearted', icon: '😄', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'drama', name: 'Drama', description: 'Emotional', icon: '🎭', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'action', name: 'Action', description: 'High-energy', icon: '⚡', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'romance', name: 'Romance', description: 'Love stories', icon: '💕', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'horror', name: 'Horror', description: 'Thrilling', icon: '👻', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'thriller', name: 'Thriller', description: 'Suspenseful', icon: '🔥', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'fantasy', name: 'Fantasy', description: 'Magical', icon: '🧙‍♂️', gradient: ['#fefefe', '#f9fafb'] },
  { id: 'scifi', name: 'Sci-Fi', description: 'Futuristic', icon: '🚀', gradient: ['#fefefe', '#f9fafb'] }
];

const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [selectedContentTheme, setSelectedContentTheme] = useState<string>('');

  const handleContinue = () => {
    if (!selectedContentTheme) {
      return;
    }

    console.log('Selected content theme:', selectedContentTheme);
    
    navigation.navigate('ScriptSelection', {
      contentTheme: selectedContentTheme
    });
  };

  const canContinue = selectedContentTheme;

  return (
    <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Choose Your Genre</Text>
            </View>
          </View>

          {/* Content Theme Selection */}
          <View style={styles.sectionContainer}>
            
            <View style={styles.themeGrid}>
              {contentThemes.map((contentTheme) => (
                <TouchableOpacity
                  key={contentTheme.id}
                  style={[
                    styles.themeCard,
                    selectedContentTheme === contentTheme.id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedContentTheme(contentTheme.id)}
                >
                  <View style={styles.themeGradient}>
                    <Text style={styles.themeIcon}>{contentTheme.icon}</Text>
                    <Text style={styles.themeName}>{contentTheme.name}</Text>
                    <Text style={styles.themeDescription}>
                      {contentTheme.description}
                    </Text>
                    {selectedContentTheme === contentTheme.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.continueButton, !canContinue && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!canContinue}
            >
              <View
                style={[styles.continueGradient, { backgroundColor: canContinue ? '#3b82f6' : '#9ca3af' }]}
              >
                <Text style={styles.continueText}>
                  {selectedContentTheme ? 'Continue' : 'Select a Theme'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'System',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
    fontFamily: 'System',
    color: '#475569',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'System',
    color: '#1e293b',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'System',
    color: '#64748b',
    textAlign: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowOpacity: 0.4,
  },
  themeGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fefefe',
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'System',
    color: '#1e293b',
  },
  themeDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'System',
    color: '#475569',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default ThemeSelectionScreen;