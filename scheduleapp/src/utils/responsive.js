import { useWindowDimensions } from 'react-native';

// Base design width (360dp = standard small phone)
const BASE_WIDTH = 360;

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const scale = width / BASE_WIDTH;

  const s = (size) => Math.round(size * scale);
  const fs = (size) => Math.round(size * Math.min(scale, 1.4)); // font scale capped

  return { width, height, scale, s, fs };
};
