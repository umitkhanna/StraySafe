import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../config/constants';

const DoublePawLogo = ({ size = 60, color = COLORS.primary }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
      >
        {/* Left Paw */}
        <Path
          d="M25 45C25 41.686 27.686 39 31 39C34.314 39 37 41.686 37 45C37 48.314 34.314 51 31 51C27.686 51 25 48.314 25 45Z"
          fill={color}
        />
        <Path
          d="M15 35C15 32.239 17.239 30 20 30C22.761 30 25 32.239 25 35C25 37.761 22.761 40 20 40C17.239 40 15 37.761 15 35Z"
          fill={color}
        />
        <Path
          d="M35 35C35 32.239 37.239 30 40 30C42.761 30 45 32.239 45 35C45 37.761 42.761 40 40 40C37.239 40 35 37.761 35 35Z"
          fill={color}
        />
        <Path
          d="M12 48C12 45.791 13.791 44 16 44C18.209 44 20 45.791 20 48C20 50.209 18.209 52 16 52C13.791 52 12 50.209 12 48Z"
          fill={color}
        />
        <Path
          d="M40 48C40 45.791 41.791 44 44 44C46.209 44 48 45.791 48 48C48 50.209 46.209 52 44 52C41.791 52 40 50.209 40 48Z"
          fill={color}
        />
        <Path
          d="M20 55C17.239 55 15 57.239 15 60C15 64.418 18.582 68 23 68H37C41.418 68 45 64.418 45 60C45 57.239 42.761 55 40 55H20Z"
          fill={color}
        />

        {/* Right Paw */}
        <Path
          d="M63 45C63 41.686 65.686 39 69 39C72.314 39 75 41.686 75 45C75 48.314 72.314 51 69 51C65.686 51 63 48.314 63 45Z"
          fill={color}
        />
        <Path
          d="M53 35C53 32.239 55.239 30 58 30C60.761 30 63 32.239 63 35C63 37.761 60.761 40 58 40C55.239 40 53 37.761 53 35Z"
          fill={color}
        />
        <Path
          d="M73 35C73 32.239 75.239 30 78 30C80.761 30 83 32.239 83 35C83 37.761 80.761 40 78 40C75.239 40 73 37.761 73 35Z"
          fill={color}
        />
        <Path
          d="M50 48C50 45.791 51.791 44 54 44C56.209 44 58 45.791 58 48C58 50.209 56.209 52 54 52C51.791 52 50 50.209 50 48Z"
          fill={color}
        />
        <Path
          d="M78 48C78 45.791 79.791 44 82 44C84.209 44 86 45.791 86 48C86 50.209 84.209 52 82 52C79.791 52 78 50.209 78 48Z"
          fill={color}
        />
        <Path
          d="M58 55C55.239 55 53 57.239 53 60C53 64.418 56.582 68 61 68H75C79.418 68 83 64.418 83 60C83 57.239 80.761 55 78 55H58Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DoublePawLogo;
