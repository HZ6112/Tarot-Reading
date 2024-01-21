import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";

function QuestionScreen({ navigation }) {
  const submit = (values, { resetForm }) => {
    // Construct the date number as needed
    const date = new Date();
    const dateNumber =
      date.getFullYear() +
      (date.getMonth() + 1) +
      date.getDate() +
      date.getHours() +
      date.getMinutes() +
      date.getSeconds();

    // Use React Navigation to navigate to the Answer screen with the form values
    navigation.navigate("Answer", {
      submitTime: dateNumber, // Pass the submitTime
      question: values.question, // Pass the question from form values
      number1: values.number1, // Pass number1 from form values
      number2: values.number2, // Pass number2 from form values
      number3: values.number3, // Pass number3 from form values
    });
    resetForm();
  };
  const [loading, isLoading] = useState(true);
  const validationSchema = Yup.object().shape({
    question: Yup.string().required().label("Question"),
    number1: Yup.number().required().min(1).max(100000).label("Number1"),
    number2: Yup.number().required().min(1).max(100000).label("Number2"),
    number3: Yup.number().required().min(1).max(100000).label("Number3"),
  });

  return (
    <Formik
      initialValues={{ question: "", number1: "", number2: "", number3: "" }}
      onSubmit={submit}
      validationSchema={validationSchema}
    >
      {({
        handleSubmit,
        setFieldValue,
        errors,
        setFieldTouched,
        touched,
        values,
      }) => (
        <>
          <View style={styles.container}>
            <ImageBackground
              onLoad={() => isLoading(false)}
              source={require("../assets/background.jpg")}
              style={styles.background}
              defaultSource={require("../assets/splash.png")}
            >
              <View style={styles.questionContainer}>
                {!loading && (
                  <Text style={styles.text}>
                    Type in the question you want to ask:
                  </Text>
                )}
                {!loading && (
                  <TextInput
                    style={styles.question}
                    onBlur={() => setFieldTouched("question")}
                    multiline
                    numberOfLines={3}
                    value={values.question}
                    onChangeText={(text) => setFieldValue("question", text)}
                    placeholderTextColor="white"
                  />
                )}
                {!loading && touched.question && (
                  <Text style={styles.error}>{errors.question}</Text>
                )}
              </View>
              <View style={styles.numbersInputContainer}>
                {!loading && (
                  <Text style={styles.text}>
                    Enter three Different numbers to start your Tarot Cards
                    Draw!
                  </Text>
                )}
                {!loading && (
                  <TextInput
                    style={styles.textInput}
                    onBlur={() => setFieldTouched("number1")}
                    placeholderTextColor="white"
                    value={values.number1}
                    onChangeText={(text) => setFieldValue("number1", text)}
                    keyboardType="numeric"
                  />
                )}
                {!loading && touched.number1 && (
                  <Text style={styles.error}>{errors.number1}</Text>
                )}
                {!loading && (
                  <TextInput
                    style={styles.textInput}
                    onBlur={() => setFieldTouched("number2")}
                    placeholderTextColor="white"
                    value={values.number2}
                    onChangeText={(text) => setFieldValue("number2", text)}
                    keyboardType="numeric"
                  />
                )}
                {!loading && touched.number2 && (
                  <Text style={styles.error}>{errors.number2}</Text>
                )}
                {!loading && (
                  <TextInput
                    style={styles.textInput}
                    onBlur={() => setFieldTouched("number3")}
                    placeholderTextColor="white"
                    value={values.number3}
                    onChangeText={(text) => setFieldValue("number3", text)}
                    keyboardType="numeric"
                  />
                )}
                {!loading && touched.number3 && (
                  <Text style={styles.error}>{errors.number3}</Text>
                )}
              </View>
              {!loading && (
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.text}>Draw Tarot Cards</Text>
                </TouchableOpacity>
              )}
              <StatusBar style="auto" />
            </ImageBackground>
          </View>
        </>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "red",
    fontSize: 20,
    textAlign: "center",
  },
  text: {
    color: "white",
    textShadowColor: "black",
    textShadowRadius: 5,
    fontSize: 25,
    textAlign: "center",
  },
  question: {
    color: "black",
    fontSize: 25,
    textAlign: "center",
    backgroundColor: "white",
    marginTop: 10,
    borderRadius: 20,
  },
  textInput: {
    color: "black",
    fontSize: 25,
    marginTop: 10,
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: 20,
  },
  numbersInputContainer: {
    marginTop: 50,
  },
  questionContainer: {},
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

export default QuestionScreen;
