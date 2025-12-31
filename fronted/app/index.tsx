import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Itim_400Regular } from "@expo-google-fonts/itim";
import LottieView from "lottie-react-native";
import ItimText from "../components/Itimtext";

const { height: screenHeight } = Dimensions.get("window");
const BRAND = "#197FF4";

import Logo from "../assets/logos/logo blue.png";

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Itim_400Regular });

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Circle animations
  const circle1Scale = useRef(new Animated.Value(0)).current;
  const circle2Scale = useRef(new Animated.Value(0)).current;
  const circle3Scale = useRef(new Animated.Value(0)).current;
  const circle1Opacity = useRef(new Animated.Value(0)).current;
  const circle2Opacity = useRef(new Animated.Value(0)).current;
  const circle3Opacity = useRef(new Animated.Value(0)).current;

  // Entrance animation sequence
  useEffect(() => {
    // Circles fade in
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(circle1Scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(circle1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(circle2Scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(circle2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(circle3Scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(circle3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Text animations with delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Tagline animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // Loader fade in
    setTimeout(() => {
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Start pulse animation after entrance
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);
  }, []);

  // Navigate after splash
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.container}>
        {/* Decorative Circles */}
        <Animated.View
          style={[
            styles.decorCircle1,
            {
              opacity: circle1Opacity,
              transform: [{ scale: circle1Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.decorCircle2,
            {
              opacity: circle2Opacity,
              transform: [{ scale: circle2Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.decorCircle3,
            {
              opacity: circle3Opacity,
              transform: [{ scale: circle3Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.decorCircle4,
            {
              opacity: circle1Opacity,
              transform: [{ scale: circle1Scale }],
            },
          ]}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Container */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnim) },
                ],
              },
            ]}
          >
            <Animated.Image source={Logo} style={styles.logo} />
          </Animated.View>

          {/* App Name */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            }}
          >
            <ItimText size={44} weight="bold" color={BRAND} fontFamily='Itim_400Regular' style={styles.appName}>
              WiseBuy
            </ItimText>
          </Animated.View>

          {/* Taglines */}
          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
              },
            ]}
          >
            <ItimText size={18} color="#4b5563" weight="600">
              Shop smart. Stock right.
            </ItimText>
            <ItimText
              size={20}
              color={BRAND}
              weight="bold"
              style={{ marginTop: 4 }}
            >
              Save big.
            </ItimText>
          </Animated.View>

          {/* Loading Animation */}
          <Animated.View style={[styles.loaderContainer, { opacity: loaderOpacity }]}>
            <LottieView
              source={require("../assets/animations/loading.json")}
              autoPlay
              loop
              style={styles.lottie}
              colorFilters={[
                {
                  keypath: "**",
                  color: BRAND,
                },
              ]}
            />
          </Animated.View>
        </View>

        {/* Bottom Branding */}
        <Animated.View style={[styles.bottomBrand, { opacity: taglineOpacity }]}>
          <View style={styles.brandDot} />
          <ItimText size={12} color="#9ca3af">
            Smart Shopping Made Simple
          </ItimText>
          <View style={styles.brandDot} />
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  // Decorative circles
  decorCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(25, 127, 244, 0.08)",
  },
  decorCircle2: {
    position: "absolute",
    top: screenHeight * 0.25,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(25, 127, 244, 0.06)",
  },
  decorCircle3: {
    position: "absolute",
    bottom: screenHeight * 0.15,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(25, 127, 244, 0.07)",
  },
  decorCircle4: {
    position: "absolute",
    bottom: -80,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(25, 127, 244, 0.05)",
  },
  // Content
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 50,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
  appName: {
    letterSpacing: 2,
    textAlign: "center",
  },
  taglineContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  loaderContainer: {
    marginTop: 40,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  // Bottom branding
  bottomBrand: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginHorizontal: 10,
  },
});
