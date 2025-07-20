import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useEffect } from "react";
import images from "./images";

function Card({ id, db }) {
  const [tarotCardName, setTarotCardName] = useState("");

  // Function to fetch a record by primary key (updated for new SQLite API)
  async function fetchAndProcessRecord(db, column, primaryKeyValue) {
    try {
      if (!db) return null;

      const result = await db.getFirstAsync(
        "SELECT * FROM Tarot_meanings WHERE id = ?",
        [primaryKeyValue]
      );

      return result ? result[column] : null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  async function fetchTarotCardName() {
    try {
      if (!db) return;

      const cardName = await fetchAndProcessRecord(db, "card_name", id);
      setTarotCardName(cardName || `Card ${id}`);
    } catch (error) {
      console.error("Failed to fetch tarot card details", error);
      setTarotCardName(`Card ${id}`);
    }
  }

  useEffect(() => {
    if (db) {
      fetchTarotCardName();
    }
  }, [db, id]);

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={images[id]} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>{tarotCardName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: 15,
    flex: 1, // Take equal space
  },
  image: {
    width: 95,
    height: 155,
    marginBottom: 8,
  },
  textContainer: {
    width: 120, // Fixed wider width for text
    minHeight: 40, // Minimum height for text area
  },
  text: {
    fontSize: 13,
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
    lineHeight: 16,
    flexWrap: "wrap",
  },
});

export default Card;
