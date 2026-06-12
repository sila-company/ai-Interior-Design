import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export default function WelcomeView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/camera");
  };

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200" }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
    >
      <View style={[styles.overlay, StyleSheet.absoluteFill]} />

      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
      >
        <View style={styles.top}>
          <View style={[styles.badge, { backgroundColor: "rgba(200,169,110,0.25)", borderColor: "rgba(200,169,110,0.5)" }]}>
            <Text style={styles.badgeText}>AI Interior Design</Text>
          </View>
        </View>

        <View style={styles.middle}>
          <Text style={styles.headline}>Design the{"\n"}room you{"\n"}deserve.</Text>
          <Text style={styles.subheadline}>
            Upload a photo. Answer a few questions. Get a curated furniture list tailored to your style.
          </Text>
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            No account needed · Free to try
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(18, 14, 10, 0.55)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  top: {
    paddingTop: 16,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    color: "#C9A96E",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  middle: {
    gap: 16,
  },
  headline: {
    fontSize: 52,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 58,
    letterSpacing: -2,
  },
  subheadline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 24,
    maxWidth: 320,
  },
  bottom: {
    gap: 16,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    height: 58,
    borderRadius: 18,
    backgroundColor: "#C9A96E",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.2,
  },
});
