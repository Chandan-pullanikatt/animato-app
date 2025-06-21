import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Character, ThemeColors } from '../../types/segment';

interface PhotosSectionProps {
  characters: Character[];
  photos: any[];
  isLoading: boolean;
  regeneratePhotos: () => void;
  themeColors: ThemeColors;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ 
  characters,
  photos,
  isLoading, 
  regeneratePhotos, 
  themeColors 
}) => {
  return (
    <View style={styles.componentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text 
          style={[
            styles.sectionStatus, 
            { color: photos.length > 0 ? themeColors.success : themeColors.muted }
          ]}
        >
          {photos.length > 0 ? 'Generated' : 'Pending'}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Generating photos for your characters...
          </Text>
        </View>
      ) : photos.length > 0 ? (
        <>
          <View style={styles.photoList}>
            {characters.map((character, index) => (
              <View 
                key={character.id || index} 
                style={[styles.photoCard, { borderColor: themeColors.border }]}
              >
                <Text style={[styles.photoName, { color: themeColors.text }]}>
                  {character.name}
                </Text>
                {character.imageUrl ? (
                  <Image 
                    source={{ uri: character.imageUrl }} 
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: themeColors.secondaryBackground }]}>
                    <Text style={[styles.photoPlaceholderText, { color: themeColors.textSecondary }]}>
                      No image generated
                    </Text>
                  </View>
                )}
                <Text style={[styles.photoPrompt, { color: themeColors.textSecondary }]}>
                  {character.description}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.regenerateButton, { borderColor: themeColors.border }]} 
            onPress={regeneratePhotos}
          >
            <Text style={{ color: themeColors.primary }}>Regenerate Photos</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
            No photos generated yet
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  componentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
  photoList: {
    marginBottom: 16,
  },
  photoCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  photoName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
  },
  photoPrompt: {
    fontSize: 14,
    marginTop: 4,
  },
  regenerateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
  }
});

export default PhotosSection;
