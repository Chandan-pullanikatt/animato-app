import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';
import ThemeSelectionScreen from '../screens/ThemeSelectionScreen';
import ScriptSelectionScreen from '../screens/ScriptSelectionScreen';
import ScriptSegmentationScreen from '../screens/ScriptSegmentationScreen';
import DirectPhotoGenerationScreen from '../screens/DirectPhotoGenerationScreen';
import VideoCompilationScreen from '../screens/VideoCompilationScreen';
import CharacterGenerationScreen from '../screens/CharacterGenerationScreen';
import PhotoGenerationScreen from '../screens/PhotoGenerationScreen';
import VideoGenerationScreen from '../screens/VideoGenerationScreen';
import SegmentVideoGenerationScreen from '../screens/SegmentVideoGenerationScreen';
import SegmentVideoScreen from '../screens/SegmentVideoScreen';
import NavigationConnectorScreen from '../screens/NavigationConnectorScreen';
import APITestScreen from '../screens/APITestScreen';
import AITestScreen from '../screens/AITestScreen';
import SegmentProcessingScreen from '../screens/SegmentProcessingScreen';
import VideoGenerationStepScreen from '../screens/VideoGenerationStepScreen';
import VideoStyleSelectionScreen from '../screens/VideoStyleSelectionScreen';
import StreamlinedCreationScreen from '../screens/StreamlinedCreationScreen';

export type RootStackParamList = {
  Landing: undefined;
  ThemeSelection: undefined;
  ScriptSelection: {
    contentTheme?: string;
  };
  ScriptSegmentation: {
    script: string;
    theme: string;
    videoStyle?: string;
    contentTheme?: string;
  };
  VideoStyleSelection: {
    script?: string;
    contentTheme?: string;
    segments?: any[];
  };
  StreamlinedCreation: {
    script: string;
    theme: string;
    videoStyle: string;
    contentTheme: string;
  };
  SegmentProcessing: {
    script: string;
    theme: string;
    segments: any[];
    currentSegmentIndex: number;
    processedSegments: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  VideoGenerationStep: {
    script: string;
    theme: string;
    segments: any[];
    currentSegmentIndex: number;
    processedSegments: any[];
    currentSegment: any;
    segmentCharacters: any[];
    segmentPhotos: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  VideoCompilation: {
    script: string;
    theme: string;
    processedSegments: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  NavigationConnector: {
    script: string;
    theme: string;
    nextScreen: keyof RootStackParamList;
    videoStyle?: string;
    contentTheme?: string;
  };
  CharacterGeneration: {
    script: string;
    theme: string;
    videoStyle: string;
    contentTheme: string;
    segmentCharacters?: any[];
  };
  PhotoGeneration: {
    script: string;
    theme: string;
    characters: any[];
    segments?: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  SegmentVideoGeneration: {
    videoTheme: string;
    segments: any[];
    characters: any[];
    characterPhotos: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  SegmentVideo: {
    segments: any[];
    theme: string;
    characters?: any[];
    photos?: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  VideoGeneration: {
    script: string;
    theme: string;
    characters: any[];
    photos: any[];
    compiledVideoUrl?: string;
    segmentVideos?: any[];
    videoStyle?: string;
    contentTheme?: string;
  };
  APITest: undefined;
  AITest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ThemeSelection" 
          component={ThemeSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ScriptSelection" 
          component={ScriptSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ScriptSegmentation" 
          component={ScriptSegmentationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VideoStyleSelection" 
          component={VideoStyleSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SegmentProcessing" 
          component={SegmentProcessingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VideoGenerationStep" 
          component={VideoGenerationStepScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VideoCompilation" 
          component={VideoCompilationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CharacterGeneration" 
          component={CharacterGenerationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PhotoGeneration" 
          component={PhotoGenerationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SegmentVideoGeneration" 
          component={SegmentVideoGenerationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SegmentVideo" 
          component={SegmentVideoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VideoGeneration" 
          component={VideoGenerationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="NavigationConnector" 
          component={NavigationConnectorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="APITest" 
          component={APITestScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AITest" 
          component={AITestScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="StreamlinedCreation" 
          component={StreamlinedCreationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;