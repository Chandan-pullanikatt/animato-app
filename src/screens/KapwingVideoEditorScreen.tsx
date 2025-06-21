import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  BackHandler
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type KapwingVideoEditorScreenProps = NativeStackScreenProps<RootStackParamList, 'KapwingVideoEditor'>;

const KapwingVideoEditorScreen: React.FC<KapwingVideoEditorScreenProps> = ({ route, navigation }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const webViewRef = useRef<WebView>(null);
  
  const { 
    script, 
    theme: videoTheme, 
    characters, 
    photos,
    mode = 'ai-generator' // 'ai-generator', 'script-to-video', or 'full-editor'
  } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prepare data for Kapwing
  const characterDescriptions = characters?.map(char => char.description || char.name).join(', ') || '';
  const fullPrompt = `${script}\n\nCharacters: ${characterDescriptions}\nTheme: ${videoTheme}`;

  // Determine Kapwing URL based on mode
  const getKapwingUrl = () => {
    const baseUrl = 'https://kapwing.com';
    
    switch (mode) {
      case 'ai-generator':
        return `${baseUrl}/ai/video-generator`;
      case 'script-to-video':
        return `${baseUrl}/ai/script-to-video`;
      case 'full-editor':
        return `${baseUrl}/studio/editor`;
      default:
        return `${baseUrl}/ai`;
    }
  };

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  // WebView navigation handlers
  const handleNavigationStateChange = (navState: any) => {
    setCurrentUrl(navState.url);
    setCanGoBack(navState.canGoBack);
    
    // Check if user has exported a video (simplified detection)
    if (navState.url.includes('export') || navState.url.includes('download')) {
      // Could potentially capture the exported video URL here
      console.log('Video export detected:', navState.url);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.error('WebView error:', error);
    setError('Failed to load Kapwing. Please check your internet connection.');
    setIsLoading(false);
  };

  // Inject script to pre-fill data (if possible)
  const injectedJavaScript = `
    try {
      // Try to pre-fill text areas with our script content
      setTimeout(() => {
        const textAreas = document.querySelectorAll('textarea, input[type="text"]');
        const prompt = "${fullPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
        
        textAreas.forEach((element, index) => {
          if (element.placeholder && element.placeholder.toLowerCase().includes('prompt')) {
            element.value = prompt;
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }, 3000);
    } catch (e) {
      console.log('Could not pre-fill data:', e);
    }
    true;
  `;

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleOpenInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(currentUrl);
      if (supported) {
        await Linking.openURL(currentUrl);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open URL in browser');
    }
  };

  const handleFinish = () => {
    Alert.alert(
      'Video Creation Complete',
      'Have you finished creating your video in Kapwing? You can download it from Kapwing and then return to the app.',
      [
        {
          text: 'Continue Editing',
          style: 'cancel'
        },
        {
          text: 'Finish & Return',
          onPress: () => {
            navigation.navigate('VideoGeneration', {
              script,
              theme: videoTheme,
              characters,
              photos,
              // Could pass back video URL if captured
            });
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
        Kapwing AI Video Editor
      </Text>
      
      <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
        <Ionicons name="refresh" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <TouchableOpacity 
        onPress={handleBackPress} 
        disabled={!canGoBack}
        style={[styles.toolbarButton, !canGoBack && styles.toolbarButtonDisabled]}
      >
        <Ionicons 
          name="arrow-back" 
          size={20} 
          color={canGoBack ? theme.colors.primary : theme.colors.textSecondary} 
        />
      </TouchableOpacity>
      
      <Text style={[styles.urlText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
        {currentUrl}
      </Text>
      
      <TouchableOpacity onPress={handleOpenInBrowser} style={styles.toolbarButton}>
        <Ionicons name="open-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-off" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Connection Error
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            {error}
          </Text>
          <Button 
            title="Try Again" 
            onPress={handleRefresh} 
            variant="primary"
            style={styles.retryButton}
          />
          <Button 
            title="Go Back" 
            onPress={() => navigation.goBack()} 
            variant="outline"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderToolbar()}
      
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: getKapwingUrl() }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsBackForwardNavigationGestures={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Loading Kapwing AI Video Editor...
              </Text>
            </View>
          )}
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading Kapwing...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomToolbar}>
        <Button
          title="Finish Video Creation"
          onPress={handleFinish}
          variant="primary"
          style={styles.finishButton}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  toolbarButtonDisabled: {
    opacity: 0.3,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    marginHorizontal: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    marginVertical: 8,
    minWidth: 120,
  },
  bottomToolbar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  finishButton: {
    width: '100%',
  },
});

export default KapwingVideoEditorScreen; 