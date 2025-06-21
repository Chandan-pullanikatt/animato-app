import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = 'md',
  backgroundColor,
}) => {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'xs':
        return theme.spacing.xs;
      case 'sm':
        return theme.spacing.sm;
      case 'lg':
        return theme.spacing.lg;
      case 'xl':
        return theme.spacing.xl;
      case 'md':
      default:
        return theme.spacing.md;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { padding: getPadding(), backgroundColor },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
};
