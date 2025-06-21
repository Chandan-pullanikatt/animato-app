import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Character, ThemeColors } from '../../types/segment';

interface CharactersSectionProps {
  characters: Character[];
  isLoading: boolean;
  regenerateCharacters: () => void;
  themeColors: ThemeColors;
}

const CharactersSection: React.FC<CharactersSectionProps> = ({ 
  characters, 
  isLoading, 
  regenerateCharacters, 
  themeColors 
}) => {
  return (
    <View style={styles.componentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Characters</Text>
        <Text 
          style={[
            styles.sectionStatus, 
            { color: characters.length > 0 ? themeColors.success : themeColors.muted }
          ]}
        >
          {characters.length > 0 ? 'Generated' : 'Pending'}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Generating characters based on your script...
          </Text>
        </View>
      ) : characters.length > 0 ? (
        <>
          <View style={styles.characterList}>
            {characters.map((character, index) => (
              <View 
                key={character.id || index} 
                style={[styles.characterCard, { borderColor: themeColors.border }]}
              >
                <Text style={[styles.characterName, { color: themeColors.text }]}>
                  {character.name}
                </Text>
                <Text style={[styles.characterDescription, { color: themeColors.textSecondary }]}>
                  {character.description}
                </Text>
                <View style={styles.traitsContainer}>
                  {character.traits.map((trait, i) => (
                    <View 
                      key={i} 
                      style={[styles.traitBadge, { backgroundColor: themeColors.secondaryBackground }]}
                    >
                      <Text style={[styles.traitText, { color: themeColors.textSecondary }]}>
                        {trait}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.regenerateButton, { borderColor: themeColors.border }]} 
            onPress={regenerateCharacters}
          >
            <Text style={{ color: themeColors.primary }}>Regenerate Characters</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
            No characters generated yet
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
  characterList: {
    marginBottom: 16,
  },
  characterCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  characterDescription: {
    fontSize: 14,
    marginBottom: 8,
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

export default CharactersSection;
