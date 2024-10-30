import React from 'react';
import { useColorScheme, ColorSchemeName, StyleProp, TextStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { MaterialIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

// Define a helper function to get styles based on the theme
const getColorSchemeStyle = (colorScheme: ColorSchemeName): StyleProp<TextStyle> => ({
  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
});

// Define type for icon props with style support, constraining T to 'string'
type CustomIconProps<T extends string> = IconProps<T> & {
  style?: StyleProp<TextStyle>;
};

// Icon components with conditional styling
export function TabBarIcon({ style, ...rest }: CustomIconProps<React.ComponentProps<typeof Ionicons>['name']>) {
  const colorScheme = useColorScheme();
  return <Ionicons size={28} style={[{ marginBottom: -3 }, style, getColorSchemeStyle(colorScheme)]} {...rest} />;
}

export function TabCreateIcon({ style, ...rest }: CustomIconProps<React.ComponentProps<typeof AntDesign>['name']>) {
  const colorScheme = useColorScheme();
  return <AntDesign size={28} style={[{ marginBottom: -3 }, style, getColorSchemeStyle(colorScheme)]} {...rest} />;
}

export function TabTaskIcon({ style, ...rest }: CustomIconProps<React.ComponentProps<typeof MaterialIcons>['name']>) {
  const colorScheme = useColorScheme();
  return <MaterialIcons size={28} style={[{ marginBottom: -3 }, style, getColorSchemeStyle(colorScheme)]} {...rest} />;
}

export function TabProfileIcon({ style, ...rest }: CustomIconProps<React.ComponentProps<typeof FontAwesome5>['name']>) {
  const colorScheme = useColorScheme();
  return <FontAwesome5 size={28} style={[{ marginBottom: -3 }, style, getColorSchemeStyle(colorScheme)]} {...rest} />;
}

export function TabFontAwesomenew({ style, ...rest }: CustomIconProps<React.ComponentProps<typeof FontAwesome6>['name']>) {
  const colorScheme = useColorScheme();
  return <FontAwesome6 size={28} style={[{ marginBottom: -3 }, style, getColorSchemeStyle(colorScheme)]} {...rest} />;
}
