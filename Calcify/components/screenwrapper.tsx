import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StyleProp, ImageBackground } from 'react-native';


type ScreenWrapperProps = {
  children: ReactNode;                  
  style?: StyleProp<ViewStyle>;       
};

const backgroundImage = require('../assets/images/bg.jpg');

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style }) => {
  return (
    <ImageBackground source={backgroundImage} style={[styles.container, style]}>
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
  },
});

export default ScreenWrapper;
