import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";

const TAROT_MODES = [
  {
    id: "three-card",
    title: "🔮 Normal Reading",
    subtitle: "Past • Present • Future",
    description:
      "Classic three-card spread for general guidance and life insights",
    cardCount: 3,
  },
  {
    id: "decision",
    title: "⚖️ Decision Reading",
    subtitle: "Option A vs Option B",
    description: "Compare two choices to help make important decisions",
    cardCount: 2,
  },
  {
    id: "relationship",
    title: "💕 Relationship Reading",
    subtitle: "Love & Connection Cross",
    description: "Five-card cross spread for deep relationship insights",
    cardCount: 5,
  },
];

function ModeSelectionScreen({ navigation }) {
  const handleModeSelect = (mode) => {
    navigation.navigate("Question", { mode });
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
        >
          <Text style={styles.title}>Choose Your Reading</Text>
          <Text style={styles.subtitle}>
            Select the type of guidance you seek
          </Text>

          {TAROT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleModeSelect(mode)}
              activeOpacity={0.8}
            >
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
              <Text style={styles.modeDescription}>{mode.description}</Text>
              <Text style={styles.cardCount}>{mode.cardCount} Cards</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "black",
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "black",
    textShadowRadius: 3,
  },
  modeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#f45c65",
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  modeSubtitle: {
    fontSize: 16,
    color: "#f45c65",
    fontWeight: "600",
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 10,
  },
  cardCount: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
export default ModeSelectionScreen;
