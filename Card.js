import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useState, useEffect } from "react";
import images from "./images";

function Card({ id, db }) {
  // Function to fetch a record by primary key
  async function fetchAndProcessRecord(db, column, primaryKeyValue) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM Tarot_meanings WHERE id = ?;",
          [primaryKeyValue],
          (_, result) => {
            if (result.rows.length > 0) {
              const record = result.rows._array[0];
              resolve(record[column]); // Process and return the specific column value
            } else {
              resolve(null); // No record found
            }
          },
          (_, error) => {
            reject(error); // Error handling
          }
        );
      });
    });
  }

  const [tarotCardName, setTarotCardName] = useState("");
  const [tarotCardMeaning, setTarotCardMeaning] = useState("");

  async function fetchTarotCardName() {
    try {
      const cardName = await fetchAndProcessRecord(db, "card_name", id);
      const cardMeaning = await fetchAndProcessRecord(db, "card_meaning", id);
      setTarotCardName(cardName);
      setTarotCardMeaning(cardMeaning);
    } catch (error) {
      console.error("Failed to fetch tarot card details", error);
    }
  }
  if (db) {
    fetchTarotCardName();
  } // Added `id` as a dependency
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={images[id]} />
      <Text style={styles.text}>Card Name: {tarotCardName}</Text>
      <Text style={styles.text}>Card Meaning: {tarotCardMeaning}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "50%",
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  image: {
    width: 100,
    height: 180,
    paddingBottom: 15,
  },
  text: {
    paddingVertical: 5,
    textAlign: "center",
  },
});

export default Card;
