import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Easing,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_SCREEN_WIDTH = 360;
const DEFAULT_SCREEN_HEIGHT = 640;

interface ThemeTransitionProps {
  isVisible: boolean;
  fromPosition: { x: number; y: number };
  newThemeColor: string;
  oldThemeColor: string;
  onAnimationComplete: () => void;
}

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({
  isVisible,
  fromPosition,
  newThemeColor,
  oldThemeColor,
  onAnimationComplete,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const fallbackWindow = typeof Dimensions.get === 'function' ? Dimensions.get('window') : undefined;
  const screenWidth =
    windowWidth && windowWidth > 0
      ? windowWidth
      : fallbackWindow && typeof fallbackWindow.width === 'number' && fallbackWindow.width > 0
      ? fallbackWindow.width
      : 360;
  const screenHeight =
    windowHeight && windowHeight > 0
      ? windowHeight
      : fallbackWindow && typeof fallbackWindow.height === 'number' && fallbackWindow.height > 0
      ? fallbackWindow.height
      : 640;
  // Core animation values
  const mainRippleScale = useRef(new Animated.Value(0)).current;
  const secondaryRippleScale = useRef(new Animated.Value(0)).current;
  const tertiaryRippleScale = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const colorProgress = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  // Particle system
  const particles = Array.from({ length: 12 }, () => useRef(new Animated.Value(0)).current);
  const sparkles = Array.from({ length: 8 }, () => useRef(new Animated.Value(0)).current);
  
  // Wave effects
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  
  // Calculate maximum radius with extra padding
  const maxRadius = Math.sqrt(
    Math.max(
      Math.pow(fromPosition.x, 2) + Math.pow(fromPosition.y, 2),
      Math.pow(screenWidth - fromPosition.x, 2) + Math.pow(fromPosition.y, 2),
      Math.pow(fromPosition.x, 2) + Math.pow(screenHeight - fromPosition.y, 2),
      Math.pow(screenWidth - fromPosition.x, 2) + Math.pow(screenHeight - fromPosition.y, 2)
    )
  ) + 150;

  useEffect(() => {
    if (isVisible) {
      // Note: Haptic feedback is now handled by the toggle buttons
      
      // Reset all animations
      const allAnims = [
        mainRippleScale, secondaryRippleScale, tertiaryRippleScale,
        glowScale, fadeOpacity, colorProgress, rotationAnim, pulseAnim,
        wave1, wave2, wave3, ...particles, ...sparkles
      ];
      allAnims.forEach(anim => anim.setValue(0));
      
      // Complex animation orchestration
      Animated.parallel([
        // Anticipation phase
        Animated.sequence([
          Animated.timing(mainRippleScale, {
            toValue: -0.15,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(mainRippleScale, {
            toValue: 1.1,
            duration: 900,
            easing: Easing.out(Easing.bezier(0.25, 0.46, 0.45, 0.94)),
            useNativeDriver: false,
          }),
          Animated.timing(mainRippleScale, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        
        // Secondary ripples with perfect timing
        Animated.sequence([
          Animated.delay(180),
          Animated.timing(secondaryRippleScale, {
            toValue: 1,
            duration: 750,
            easing: Easing.out(Easing.bezier(0.4, 0.0, 0.2, 1)),
            useNativeDriver: false,
          }),
        ]),
        
        Animated.sequence([
          Animated.delay(320),
          Animated.timing(tertiaryRippleScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
        
        // Wave effects for fluid motion
        Animated.stagger(150, [
          Animated.timing(wave1, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(wave2, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(wave3, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
        
        // Enhanced glow with pulsing
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.parallel([
            Animated.loop(
              Animated.sequence([
                Animated.timing(pulseAnim, {
                  toValue: 1,
                  duration: 400,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: false,
                }),
                Animated.timing(pulseAnim, {
                  toValue: 0,
                  duration: 400,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: false,
                }),
              ]),
              { iterations: 2 }
            ),
            Animated.timing(glowScale, {
              toValue: 0,
              duration: 800,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: false,
            }),
          ]),
        ]),
        
        // Smooth color transition with S-curve
        Animated.timing(colorProgress, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        
        // Dynamic rotation with overshoot
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: false,
        }),
        
        // Particle burst system
        Animated.stagger(80, particles.map((particle, index) => 
          Animated.timing(particle, {
            toValue: 1,
            duration: 1000 + (index * 50),
            easing: Easing.out(Easing.back(1.5 - (index * 0.1))),
            useNativeDriver: false,
          })
        )),
        
        // Sparkle effects
        Animated.stagger(120, sparkles.map((sparkle, index) => 
          Animated.sequence([
            Animated.delay(200 + (index * 50)),
            Animated.timing(sparkle, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.elastic(1.2)),
              useNativeDriver: false,
            }),
          ])
        )),
        
        // Final fade with perfect timing
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(fadeOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(fadeOpacity, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => {
        // Light haptic confirmation on completion
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAnimationComplete();
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const createEnhancedRipple = (
    scaleAnim: Animated.Value, 
    size: number, 
    opacity: number,
    color: string,
    withGradient?: boolean,
    blur?: boolean
  ) => (
    <Animated.View
      style={[
        styles.ripple,
        {
          left: fromPosition.x - maxRadius,
          top: fromPosition.y - maxRadius,
          width: maxRadius * 2,
          height: maxRadius * 2,
          borderRadius: maxRadius,
          backgroundColor: withGradient ? 'transparent' : color,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [-0.15, 0, 1, 1.1],
                outputRange: [0.7, 0.1, size, size * 1.05],
                extrapolate: 'clamp',
              }),
            },
            {
              rotate: rotationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          opacity: fadeOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [opacity, 0],
            extrapolate: 'clamp',
          }),
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: blur ? 0.6 : 0,
          shadowRadius: blur ? 25 : 0,
          elevation: blur ? 15 : 0,
        },
      ]}
    >
      {withGradient && (
        <LinearGradient
          colors={[
            `${color}40`,
            `${color}80`,
            `${color}FF`,
            `${color}80`,
            `${color}40`,
          ]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
    </Animated.View>
  );

  const createWave = (waveAnim: Animated.Value, delay: number, size: number) => (
    <Animated.View
      style={[
        styles.wave,
        {
          left: fromPosition.x - maxRadius * size,
          top: fromPosition.y - maxRadius * size,
          width: maxRadius * 2 * size,
          height: maxRadius * 2 * size,
          borderRadius: maxRadius * size,
          borderWidth: 2,
          borderColor: newThemeColor,
          transform: [
            {
              scale: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ],
          opacity: waveAnim.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0.8, 0.6, 0.3, 0],
          }),
        },
      ]}
    />
  );

  const createParticle = (anim: Animated.Value, index: number) => {
    const angle = (index / particles.length) * Math.PI * 2;
    const distance = 100 + (index % 3) * 30;
    const x = fromPosition.x + Math.cos(angle) * distance;
    const y = fromPosition.y + Math.sin(angle) * distance;

    return (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            left: x,
            top: y,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 0.3, 0.7, 1],
                  outputRange: [0, 2, 1.5, 0],
                }),
              },
              {
                translateX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.cos(angle) * 150],
                }),
              },
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(angle) * 150],
                }),
              },
              {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${360 + (index * 30)}deg`],
                }),
              },
            ],
            opacity: anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 1, 1, 0],
            }),
            backgroundColor: newThemeColor,
          },
        ]}
      />
    );
  };

  const createSparkle = (anim: Animated.Value, index: number) => {
    const angle = (index / sparkles.length) * Math.PI * 2 + Math.PI / 4;
    const distance = 60;
    const x = fromPosition.x + Math.cos(angle) * distance;
    const y = fromPosition.y + Math.sin(angle) * distance;

    return (
      <Animated.View
        key={index}
        style={[
          styles.sparkle,
          {
            left: x,
            top: y,
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.8, 0],
                }),
              },
              {
                rotate: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '720deg'],
                }),
              },
            ],
            opacity: anim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      />
    );
  };

  const interpolatedColor = colorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [oldThemeColor, newThemeColor],
  });

  return (
    <View
      style={[styles.container, { width: screenWidth, height: screenHeight }]}
      pointerEvents="none"
    >
      {/* Smooth background transition */}
      <Animated.View
        style={[
          styles.background,
          {
            width: screenWidth,
            height: screenHeight,
            backgroundColor: interpolatedColor,
            opacity: colorProgress.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 0.3, 0.9, 1],
            }),
          },
        ]}
      />
      
      {/* Wave effects */}
      {createWave(wave1, 0, 1.5)}
      {createWave(wave2, 150, 1.8)}
      {createWave(wave3, 300, 2.1)}
      
      {/* Enhanced ripples */}
      {createEnhancedRipple(mainRippleScale, 2.4, 0.9, newThemeColor, true, true)}
      {createEnhancedRipple(secondaryRippleScale, 2.1, 0.7, newThemeColor, false, true)}
      {createEnhancedRipple(tertiaryRippleScale, 1.9, 0.5, newThemeColor)}
      
      {/* Pulsing glow */}
      <Animated.View
        style={[
          styles.glow,
          {
            left: fromPosition.x - 75,
            top: fromPosition.y - 75,
            transform: [
              {
                scale: glowScale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
              },
            ],
            opacity: Animated.multiply(
              glowScale.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
              pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              })
            ),
          },
        ]}
      />
      
      {/* Particle system */}
      {particles.map((particle, index) => createParticle(particle, index))}
      
      {/* Sparkle effects */}
      {sparkles.map((sparkle, index) => createSparkle(sparkle, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DEFAULT_SCREEN_WIDTH,
    height: DEFAULT_SCREEN_HEIGHT,
    zIndex: 9999,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DEFAULT_SCREEN_WIDTH,
    height: DEFAULT_SCREEN_HEIGHT,
  },
  ripple: {
    position: 'absolute',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
});
