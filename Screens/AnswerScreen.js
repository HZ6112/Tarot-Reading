import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Button,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";
import { useState, useEffect } from "react";

import Constants from "expo-constants";
import Card from "../Card";

function AnswerScreen({ navigation, route }) {
  const { submitTime, question, number1, number2, number3 } = route.params;
  const qLength = question.length;
  const n1 = parseInt(number1);
  const n2 = parseInt(number2);
  const n3 = parseInt(number3);
  const Tarot_VALUE = 156; // Use a descriptive constant for the modulus

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

  async function openDatabase() {
    if (
      !(await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite"))
        .exists
    ) {
      await FileSystem.makeDirectoryAsync(
        FileSystem.documentDirectory + "SQLite"
      );
    }
    await FileSystem.downloadAsync(
      Asset.fromModule(require("../assets/TAROT.db")).uri,
      FileSystem.documentDirectory + "SQLite/TAROT.db"
    );
    return SQLite.openDatabase("TAROT.db");
  }

  const [db, setDb] = useState(null);
  useEffect(() => {
    async function initializeDb() {
      const database = await openDatabase();
      setDb(database);
    }
    initializeDb();
  }, []);
  const handleSubmit = async () => {
    // Check if the database instance is available
    if (db) {
      try {
        await db.closeAsync();
      } catch (error) {
        console.error("Error closing the database", error);
      }
      navigation.navigate("Question");
    } else {
      console.log("Database was not initialized");
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <Card style={styles.card} id={r1} db={db} />
        <Card style={styles.card} id={r2} db={db} />
        <Card style={styles.card} id={r3} db={db} />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.text}>Ask a new question</Text>
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
    flexGrow: 1, // This ensures that the ScrollView itself will fill the parent
  },
  card: {
    marginHorizontal: 20,
  },
  container: {
    paddingTop: Constants.statusBarHeight,
    alignItems: "center",
    justifyContent: "center",
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
  text: {
    color: "white",
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});
export default AnswerScreen;
