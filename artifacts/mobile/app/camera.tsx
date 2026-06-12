import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useProjectViewModel } from "@/viewmodels/ProjectViewModel";

export default function CameraUploadView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { state, setPhotoUri, uploadAndAnalyze } = useProjectViewModel();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleMockCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotoUri("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800");
  };

  const handleUpload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const project = await uploadAndAnalyze();
    if (project) {
      router.push({ pathname: "/quiz", params: { projectId: project.id, roomType: project.roomType } });
    } else if (state.uploadError) {
      Alert.alert("Upload Failed", state.uploadError);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Upload Room</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Show us your room
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Take a photo or select one from your gallery. We'll analyze the space and suggest the perfect furniture.
        </Text>

        {state.photoUri ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: state.photoUri }}
              style={[styles.preview, { borderRadius: colors.radius ?? 14 }]}
              resizeMode="cover"
            />
            {!state.isUploading && (
              <Pressable
                style={[styles.changePhotoBtn, { backgroundColor: colors.overlay }]}
                onPress={handlePickImage}
              >
                <Feather name="camera" size={16} color="#FFF" />
                <Text style={styles.changePhotoText}>Change</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={[styles.cameraArea, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="aperture" size={48} color={colors.border} />
            <Text style={[styles.cameraLabel, { color: colors.mutedForeground }]}>
              No photo selected
            </Text>
          </View>
        )}

        {state.isUploading && (
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${state.uploadProgress}%`,
                },
              ]}
            />
          </View>
        )}

        {state.isUploading && (
          <View style={styles.uploadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.uploadingText, { color: colors.mutedForeground }]}>
              {state.uploadProgress < 40
                ? "Uploading photo..."
                : state.uploadProgress < 80
                ? "Analyzing room layout..."
                : "Saving your project..."}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        {!state.photoUri && (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { backgroundColor: colors.secondary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleMockCamera}
          >
            <Feather name="camera" size={20} color={colors.foreground} />
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
              Use Camera
            </Text>
          </Pressable>
        )}

        {!state.photoUri && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={handlePickImage}
          >
            <Feather name="image" size={20} color={colors.primaryForeground} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              Choose Photo
            </Text>
          </Pressable>
        )}

        {state.photoUri && !state.isUploading && (
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.fullWidth,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={handleUpload}
          >
            <Feather name="zap" size={20} color={colors.primaryForeground} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              Analyze with AI
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  cameraArea: {
    height: 240,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  cameraLabel: {
    fontSize: 14,
  },
  previewContainer: {
    position: "relative",
  },
  preview: {
    width: "100%",
    height: 240,
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadingText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  secondaryBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  fullWidth: {
    flex: 1,
  },
});
