import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import {
  useQuizViewModel,
  type StylePreference,
  type ColorPalette,
  type BudgetRange,
} from "@/viewmodels/QuizViewModel";

const STYLE_OPTIONS: { value: StylePreference; icon: string; desc: string }[] = [
  { value: "Modern", icon: "grid", desc: "Clean lines, sleek surfaces" },
  { value: "Scandinavian", icon: "sun", desc: "Light, functional, natural" },
  { value: "Industrial", icon: "tool", desc: "Raw, edgy, urban textures" },
  { value: "Bohemian", icon: "feather", desc: "Eclectic, warm, layered" },
  { value: "Traditional", icon: "home", desc: "Classic, elegant, timeless" },
  { value: "Minimalist", icon: "minus-circle", desc: "Less is more" },
];

const PALETTE_OPTIONS: { value: ColorPalette; swatch: string; label: string }[] = [
  { value: "Neutral", swatch: "#C8BFB4", label: "Neutral" },
  { value: "Warm", swatch: "#D4956A", label: "Warm" },
  { value: "Cool", swatch: "#7EA8C4", label: "Cool" },
  { value: "Bold", swatch: "#2D2D5E", label: "Bold" },
  { value: "Earth", swatch: "#8B7355", label: "Earth" },
  { value: "Monochrome", swatch: "#4A4A4A", label: "Mono" },
];

const BUDGET_OPTIONS: BudgetRange[] = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
];

export default function StyleQuizView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { projectId, roomType } = useLocalSearchParams<{ projectId: string; roomType: string }>();
  const {
    state,
    isComplete,
    setStylePreference,
    setColorPalette,
    setBudgetRange,
    saveProfile,
  } = useQuizViewModel(projectId ?? "");

  const handleGenerate = async () => {
    if (!isComplete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const profile = await saveProfile();
    if (profile) {
      router.push({
        pathname: "/results",
        params: {
          projectId: projectId ?? "",
          stylePreference: state.stylePreference!,
        },
      });
    } else if (state.saveError) {
      Alert.alert("Error", state.saveError);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Style Quiz</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Define your taste
          </Text>
          {roomType ? (
            <View style={[styles.roomBadge, { backgroundColor: colors.goldLight }]}>
              <Feather name="home" size={13} color={colors.primary} />
              <Text style={[styles.roomBadgeText, { color: colors.primary }]}>
                {roomType}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Help us understand your aesthetic so we can recommend the perfect pieces.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Interior Style
          </Text>
          <View style={styles.styleGrid}>
            {STYLE_OPTIONS.map((opt) => {
              const selected = state.stylePreference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={({ pressed }) => [
                    styles.styleCard,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setStylePreference(opt.value);
                  }}
                >
                  <Feather
                    name={opt.icon as any}
                    size={22}
                    color={selected ? colors.primaryForeground : colors.primary}
                  />
                  <Text
                    style={[
                      styles.styleCardTitle,
                      { color: selected ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {opt.value}
                  </Text>
                  <Text
                    style={[
                      styles.styleCardDesc,
                      { color: selected ? "rgba(255,255,255,0.75)" : colors.mutedForeground },
                    ]}
                    numberOfLines={1}
                  >
                    {opt.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Color Palette
          </Text>
          <View style={styles.paletteRow}>
            {PALETTE_OPTIONS.map((opt) => {
              const selected = state.colorPalette === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={({ pressed }) => [
                    styles.paletteItem,
                    {
                      borderColor: selected ? colors.primary : "transparent",
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setColorPalette(opt.value);
                  }}
                >
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: opt.swatch,
                        borderWidth: selected ? 3 : 0,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    {selected && <Feather name="check" size={14} color="#FFF" />}
                  </View>
                  <Text
                    style={[
                      styles.swatchLabel,
                      {
                        color: selected ? colors.primary : colors.mutedForeground,
                        fontWeight: selected ? "700" : "400",
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
            Budget
          </Text>
          <View style={styles.budgetList}>
            {BUDGET_OPTIONS.map((opt) => {
              const selected = state.budgetRange === opt;
              return (
                <Pressable
                  key={opt}
                  style={({ pressed }) => [
                    styles.budgetRow,
                    {
                      backgroundColor: selected ? colors.goldLight : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setBudgetRange(opt);
                  }}
                >
                  <View
                    style={[
                      styles.budgetRadio,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primary : "transparent",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.budgetText,
                      {
                        color: selected ? colors.primary : colors.foreground,
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: bottomPadding,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.generateBtn,
            {
              backgroundColor: isComplete ? colors.primary : colors.muted,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={handleGenerate}
          disabled={!isComplete || state.isSaving}
        >
          {state.isSaving ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Feather
                name="zap"
                size={20}
                color={isComplete ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.generateBtnText,
                  { color: isComplete ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                Generate My Design
              </Text>
            </>
          )}
        </Pressable>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 28,
  },
  intro: {
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roomBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  styleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  styleCard: {
    width: "47%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  styleCardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  styleCardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  paletteRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  paletteItem: {
    alignItems: "center",
    gap: 6,
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  budgetList: {
    gap: 10,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  budgetRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  budgetText: {
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  generateBtn: {
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
