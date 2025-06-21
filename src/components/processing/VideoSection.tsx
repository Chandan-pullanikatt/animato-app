import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { ThemeColors } from '../../types/segment';

interface VideoSectionProps {
  videoUrl: string | null;
  isLoading: boolean;
  regenerateVideo: () => void;
  themeColors: ThemeColors;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  videoUrl,
  isLoading, 
  regenerateVideo, 
  themeColors 
}) => {
  return (
    <View style={styles.componentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Video</Text>
        <Text 
          style={[
            styles.sectionStatus, 
            { color: videoUrl ? themeColors.success : themeColors.muted }
          ]}
        >
          {videoUrl ? 'Generated' : 'Pending'}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Generating video for this segment...
          </Text>
        </View>
      ) : videoUrl ? (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: videoUrl }}
            style={{ width: '100%', height: 180, borderRadius: 8 }}
            useNativeControls
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={[styles.regenerateButton, { borderColor: themeColors.border, marginTop: 12 }]} 
            onPress={regenerateVideo}
          >
            <Text style={{ color: themeColors.primary }}>Regenerate Video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.videoContainer}>
          <View style={[styles.videoPlaceholder, { backgroundColor: themeColors.secondaryBackground }]}>
            <Text style={[styles.videoPlaceholderText, { color: themeColors.textSecondary }]}>
              No video generated yet
            </Text>
          </View>
          <Text style={[styles.videoStatus, { color: themeColors.textSecondary }]}>
            Complete photo generation to proceed with video creation
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
  videoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoPlaceholderText: {
    fontSize: 16,
  },
  videoStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  regenerateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  }
});

export default VideoSection;
