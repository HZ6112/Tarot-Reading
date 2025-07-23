import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";
import { useState, useEffect } from "react";
import OpenAI from "openai";
import Constants from "expo-constants";
import Card from "../Card";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Default mode for backward compatibility
const DEFAULT_MODE = {
  id: "three-card",
  title: "🔮 Three Card Reading",
  cardCount: 3,
};

function AnswerScreen({ navigation, route }) {
  // Handle both old format (number1, number2, number3) and new format (numbers array)
  const {
    submitTime,
    question,
    number1,
    number2,
    number3,
    numbers,
    mode = DEFAULT_MODE,
    option1Description,
    option2Description,
  } = route.params;

  const qLength = question.length;
  const Tarot_VALUE = 156;

  // Convert to numbers array for backward compatibility
  const getNumbers = () => {
    if (numbers && Array.isArray(numbers)) {
      // New format: numbers array
      return numbers.map((n) => parseInt(n));
    } else if (number1 && number2 && number3) {
      // Old format: individual number1, number2, number3
      return [parseInt(number1), parseInt(number2), parseInt(number3)];
    } else {
      // Fallback: generate some default numbers
      return [123, 456, 789];
    }
  };

  const numbersArray = getNumbers();

  const randomNumber = (number, counter) => {
    const result = (number * submitTime * qLength + counter) % Tarot_VALUE;
    return result;
  };

  // Generate cards based on mode and available numbers
  const generateCards = () => {
    const cards = [];
    let counter = 1;

    for (let i = 0; i < mode.cardCount; i++) {
      let newCard;
      do {
        // Use available numbers, cycling through them if needed
        const baseNumber = numbersArray[i % numbersArray.length];
        newCard = randomNumber(baseNumber, counter++);
      } while (cards.includes(newCard));
      cards.push(newCard);
    }

    return cards;
  };

  const cards = generateCards();
  const [db, setDb] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Your existing database functions remain the same
  async function openDatabase() {
    try {
      const sqliteDir = FileSystem.documentDirectory + "SQLite/";
      const dirInfo = await FileSystem.getInfoAsync(sqliteDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
      }

      const dbAsset = Asset.fromModule(require("../assets/TAROT.db"));
      await dbAsset.downloadAsync();

      const dbPath = sqliteDir + "TAROT.db";
      await FileSystem.copyAsync({
        from: dbAsset.localUri,
        to: dbPath,
      });

      return await SQLite.openDatabaseAsync("TAROT.db");
    } catch (error) {
      console.error("Error opening database:", error);
      throw error;
    }
  }

  async function fetchCardName(db, cardId) {
    try {
      if (!db) return `Card ${cardId}`;

      const result = await db.getFirstAsync(
        "SELECT card_name FROM Tarot_meanings WHERE id = ?",
        [cardId]
      );

      return result ? result.card_name : `Card ${cardId}`;
    } catch (error) {
      console.error("Database query error:", error);
      return `Card ${cardId}`;
    }
  }

  // Updated AI analysis with mode-specific prompts
  async function generateAIAnalysis(question, db, cards, mode) {
    try {
      setIsLoadingAnalysis(true);

      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error(
          "OpenAI API key not found. Please check your .env file."
        );
      }

      // Fetch card names
      const cardNames = await Promise.all(
        cards.map((cardId) => fetchCardName(db, cardId))
      );

      const prompt = generatePromptForMode(mode, question, cardNames);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fixed model name
        messages: [
          {
            role: "system",
            content:
              "You are a wise, empathetic, and experienced tarot reader with deep knowledge of tarot symbolism, card meanings, and spiritual guidance. You provide thoughtful, nuanced readings that help people gain insight into their situations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      setAiAnalysis(response.choices[0].message.content);
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      // Your existing error handling
      setAiAnalysis(
        "I apologize, but I'm unable to generate an analysis at this moment. The cosmic energies seem to be temporarily disrupted. Please try again later, and trust that the universe will provide the guidance you seek."
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  }

  // Generate prompts based on mode
  const generatePromptForMode = (mode, question, cardNames) => {
    switch (mode.id) {
      case "three-card":
        return `You are an experienced tarot reader. Please provide a thoughtful reading for:

Question: "${question}"

Three cards drawn:
- Past/Foundation: ${cardNames[0]}
- Present/Current: ${cardNames[1]}
- Future/Outcome: ${cardNames[2]}

Provide a comprehensive reading addressing the question, interpreting each card in context, and explaining how they work together. Answer in the same language as the question. (250-350 words)`;

      case "decision":
        const option1 = option1Description || "Option A";
        const option2 = option2Description || "Option B";
        return `You are an experienced tarot reader helping with a decision. Please analyze:

Question: "${question}"

Option 1: "${option1}"
Card drawn: ${cardNames[0]}

Option 2: "${option2}"
Card drawn: ${cardNames[1]}

Compare these options, explaining what each card reveals about the potential path. Provide clear guidance on which option the cards favor and why. Answer in the same language as the question. (200-300 words)`;

      case "relationship":
        return `You are an experienced tarot reader specializing in relationships. Please provide insights for:

Question: "${question}"

Five cards in cross formation:
- Past Situation: ${cardNames[0]}
- Your Current Feelings: ${cardNames[1]}
- Present Relationship Dynamic: ${cardNames[2]}
- Their Current Feelings: ${cardNames[3]}
- Future Development: ${cardNames[4]}

Provide a detailed relationship reading exploring emotional dynamics, current challenges or strengths, and future potential. Answer in the same language as the question. (300-400 words)`;

      default:
        return `You are an experienced tarot reader. Please provide guidance for: "${question}"`;
    }
  };

  // Render cards based on mode
  const renderCards = () => {
    switch (mode.id) {
      case "three-card":
        return renderThreeCardLayout();
      case "decision":
        return renderDecisionLayout();
      case "relationship":
        return renderRelationshipLayout();
      default:
        return renderThreeCardLayout();
    }
  };

  const renderThreeCardLayout = () => (
    <View style={styles.cardsContainer}>
      <View style={styles.cardWrapper}>
        <Text style={styles.positionLabel}>Past/Foundation</Text>
        <Card id={cards[0]} db={db} />
      </View>
      <View style={styles.cardWrapper}>
        <Text style={styles.positionLabel}>Present/Current</Text>
        <Card id={cards[1]} db={db} />
      </View>
      <View style={styles.cardWrapper}>
        <Text style={styles.positionLabel}>Future/Outcome</Text>
        <Card id={cards[2]} db={db} />
      </View>
    </View>
  );

  const renderDecisionLayout = () => (
    <View style={styles.decisionContainer}>
      <View style={styles.decisionCardWrapper}>
        <View style={styles.optionDescriptionContainer}>
          <Text style={styles.optionLabel}>Option 1</Text>
          <Text style={styles.optionDescription}>
            {option1Description || "First Choice"}
          </Text>
        </View>
        <Card id={cards[0]} db={db} />
      </View>

      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>VS</Text>
      </View>

      <View style={styles.decisionCardWrapper}>
        <View style={styles.optionDescriptionContainer}>
          <Text style={styles.optionLabel}>Option 2</Text>
          <Text style={styles.optionDescription}>
            {option2Description || "Second Choice"}
          </Text>
        </View>
        <Card id={cards[1]} db={db} />
      </View>
    </View>
  );

  const renderRelationshipLayout = () => (
    <View style={styles.relationshipContainer}>
      {/* Top card - Past */}
      <View style={styles.relationshipCardWrapper}>
        <Text style={styles.positionLabel}>Past Situation</Text>
        <View style={styles.relationshipCardContainer}>
          <Card id={cards[0]} db={db} />
        </View>
      </View>

      {/* Middle row - Left, Center, Right */}
      <View style={styles.middleRow}>
        <View style={styles.relationshipCardWrapper}>
          <Text style={styles.positionLabel}>Your Feelings</Text>
          <View style={styles.relationshipCardContainer}>
            <Card id={cards[1]} db={db} />
          </View>
        </View>

        <View style={styles.relationshipCardWrapper}>
          <Text style={styles.positionLabel}>Current Situation</Text>
          <View style={styles.relationshipCardContainer}>
            <Card id={cards[2]} db={db} />
          </View>
        </View>

        <View style={styles.relationshipCardWrapper}>
          <Text style={styles.positionLabel}>Their Feelings</Text>
          <View style={styles.relationshipCardContainer}>
            <Card id={cards[3]} db={db} />
          </View>
        </View>
      </View>

      {/* Bottom card - Future */}
      <View style={styles.relationshipCardWrapper}>
        <Text style={styles.positionLabel}>Future Development</Text>
        <View style={styles.relationshipCardContainer}>
          <Card id={cards[4]} db={db} />
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    async function initializeDb() {
      try {
        const database = await openDatabase();
        setDb(database);
        await generateAIAnalysis(question, database, cards, mode);
      } catch (error) {
        console.error("Error initializing database:", error);
        setAiAnalysis(
          "Unable to load card details from database, but the cosmic energy of your drawn cards still speaks. Please try restarting the app to access the full reading experience."
        );
      }
    }
    initializeDb();
  }, []);

  const handleSubmit = async () => {
    if (db) {
      try {
        await db.closeAsync();
      } catch (error) {
        console.error("Error closing the database", error);
      }
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "ModeSelection" }], // Go back to mode selection
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.modeTitle}>{mode.title}</Text>
        <Text style={styles.questionText}>Your Question: "{question}"</Text>

        {renderCards()}

        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>✨ Your Tarot Reading ✨</Text>
          {isLoadingAnalysis ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f45c65" />
              <Text style={styles.loadingText}>
                The cards are speaking... Generating your personalized
                reading...
              </Text>
            </View>
          ) : (
            <Text style={styles.analysisText}>{aiAnalysis}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Ask a new question</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f4f4",
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    paddingTop: Constants.statusBarHeight,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 10,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f45c65",
    textAlign: "center",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
    fontStyle: "italic",
    paddingHorizontal: 10,
  },

  // THREE CARD LAYOUT (horizontal row)
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
    paddingHorizontal: 0,
    minHeight: 240,
  },
  cardWrapper: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },

  // DECISION LAYOUT (two cards side by side with VS)
  decisionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  decisionCardWrapper: {
    alignItems: "center",
    flex: 1,
    maxWidth: "42%",
  },
  optionDescriptionContainer: {
    backgroundColor: "rgba(244, 92, 101, 0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(244, 92, 101, 0.3)",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f45c65",
    textAlign: "center",
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    lineHeight: 16,
  },
  vsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.16,
    paddingVertical: 20,
  },
  vsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f45c65",
    textAlign: "center",
  },

  // RELATIONSHIP LAYOUT (cross formation) - IMPROVED
  relationshipContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
    paddingHorizontal: 0,
  },
  relationshipCardWrapper: {
    alignItems: "center",
    marginBottom: 15,
  },
  relationshipCardContainer: {
    width: 80, // Fixed width to ensure cards are not too wide
    height: 140, // Fixed height to maintain aspect ratio
    alignItems: "center",
    justifyContent: "center",
  },
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  // SHARED CARD STYLES
  positionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f45c65",
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 2,
    minHeight: 30, // Ensure consistent height for labels
    textAlignVertical: "center",
  },

  // ANALYSIS SECTION
  analysisContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: "#f45c65",
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#f45c65",
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
    color: "#333",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },

  // BUTTON
  button: {
    backgroundColor: "#f45c65",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    width: "100%",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});

export default AnswerScreen;
