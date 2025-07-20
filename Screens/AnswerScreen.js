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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

function AnswerScreen({ navigation, route }) {
  const { submitTime, question, number1, number2, number3 } = route.params;
  const qLength = question.length;
  const n1 = parseInt(number1);
  const n2 = parseInt(number2);
  const n3 = parseInt(number3);
  const Tarot_VALUE = 156;

  const randomNumber = (number, counter) => {
    const result = (number * submitTime * qLength + counter) % Tarot_VALUE;
    return result;
  };

  let Counter = 1;
  let r1, r2, r3;
  r1 = randomNumber(n1, Counter++);

  do {
    r2 = randomNumber(n2, Counter++);
  } while (r2 === r1);

  do {
    r3 = randomNumber(n3, Counter++);
  } while (r3 === r1 || r3 === r2);

  const [db, setDb] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  async function openDatabase() {
    try {
      // Create SQLite directory if it doesn't exist
      const sqliteDir = FileSystem.documentDirectory + "SQLite/";
      const dirInfo = await FileSystem.getInfoAsync(sqliteDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
      }

      // Get the database asset
      const dbAsset = Asset.fromModule(require("../assets/TAROT.db"));
      await dbAsset.downloadAsync();

      // Copy to SQLite directory
      const dbPath = sqliteDir + "TAROT.db";
      await FileSystem.copyAsync({
        from: dbAsset.localUri,
        to: dbPath,
      });

      // Open the database
      return await SQLite.openDatabaseAsync("TAROT.db");
    } catch (error) {
      console.error("Error opening database:", error);
      throw error;
    }
  }

  // Function to fetch card name from database
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

  // Function to generate AI analysis using card names from database
  async function generateAIAnalysis(question, db, cardIds) {
    try {
      setIsLoadingAnalysis(true);

      // Check if API key is available
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error(
          "OpenAI API key not found. Please check your .env file."
        );
      }

      // Fetch card names from database
      const card1Name = await fetchCardName(db, cardIds.card1);
      const card2Name = await fetchCardName(db, cardIds.card2);
      const card3Name = await fetchCardName(db, cardIds.card3);

      const prompt = `You are an experienced and intuitive tarot reader. Please provide a thoughtful tarot reading for this situation.

Question: "${question}"

Three tarot cards have been drawn:
- Past/Foundation: ${card1Name}
- Present/Current: ${card2Name}
- Future/Outcome: ${card3Name}

Please provide a comprehensive reading that:
- Addresses the specific question asked
- Answer in the same language as the question
- Interprets each card's meaning in its position context
- Explains how the three cards work together to tell a story
- Offers practical guidance and insights
- Maintains an encouraging and supportive tone
- Uses your deep knowledge of these specific tarot cards and their traditional meanings

The reading should be between 250-350 words and feel personal and meaningful.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
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
        max_tokens: 500,
        temperature: 0.7,
      });

      setAiAnalysis(response.choices[0].message.content);
    } catch (error) {
      console.error("Error generating AI analysis:", error);

      if (error.message.includes("API key")) {
        setAiAnalysis(
          "Please check your OpenAI API key configuration. Make sure you have a valid API key set in your .env file."
        );
      } else if (error.message.includes("401")) {
        setAiAnalysis(
          "Invalid API key. Please verify your OpenAI API key is correct and has sufficient credits."
        );
      } else {
        setAiAnalysis(
          "I apologize, but I'm unable to generate an analysis at this moment. The cosmic energies seem to be temporarily disrupted. Please try again later, and trust that the universe will provide the guidance you seek."
        );
      }
    } finally {
      setIsLoadingAnalysis(false);
    }
  }

  useEffect(() => {
    async function initializeDb() {
      try {
        const database = await openDatabase();
        setDb(database);

        // Generate AI analysis with card IDs (will fetch names from database)
        const cardIds = {
          card1: r1,
          card2: r2,
          card3: r3,
        };

        await generateAIAnalysis(question, database, cardIds);
      } catch (error) {
        console.error("Error initializing database:", error);
        // If database fails, still generate analysis with card numbers
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
    // Reset navigation stack to Question screen without back button
    navigation.reset({
      index: 0,
      routes: [{ name: "Question" }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.questionText}>Your Question: "{question}"</Text>

        <View style={styles.cardsContainer}>
          <View style={styles.cardWrapper}>
            <Text style={styles.positionLabel}>Past/Foundation</Text>
            <Card id={r1} db={db} />
          </View>
          <View style={styles.cardWrapper}>
            <Text style={styles.positionLabel}>Present/Current</Text>
            <Card id={r2} db={db} />
          </View>
          <View style={styles.cardWrapper}>
            <Text style={styles.positionLabel}>Future/Outcome</Text>
            <Card id={r3} db={db} />
          </View>
        </View>

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
    padding: 10, // Reduced padding for more space
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
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
    paddingHorizontal: 0, // Remove padding to give more space
    minHeight: 240, // More height for better text display
  },
  cardWrapper: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2, // Small margins between cards
  },
  positionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#f45c65",
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 5,
  },
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
