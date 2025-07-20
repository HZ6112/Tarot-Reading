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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
    <ImageBackground
      onLoad={() => isLoading(false)}
      source={require("../assets/background.jpg")}
      style={styles.backgroundContainer}
      defaultSource={require("../assets/splash.png")}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Formik
              initialValues={{
                question: "",
                number1: "",
                number2: "",
                number3: "",
              }}
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
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  keyboardShouldPersistTaps="handled"
                  automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
                >
                  <View style={styles.questionContainer}>
                    {!loading && (
                      <Text style={styles.text}>
                        Type in the question you want to ask in any language:
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
                        placeholderTextColor="#999"
                        placeholder="What would you like to know?"
                        returnKeyType="done"
                        blurOnSubmit={true}
                      />
                    )}
                    {!loading && touched.question && errors.question && (
                      <Text style={styles.error}>{errors.question}</Text>
                    )}
                  </View>

                  <View style={styles.numbersInputContainer}>
                    {!loading && (
                      <Text style={styles.text}>
                        Enter three different numbers to start your Tarot Cards
                        Draw!
                      </Text>
                    )}
                    {!loading && (
                      <TextInput
                        style={styles.textInput}
                        onBlur={() => setFieldTouched("number1")}
                        placeholderTextColor="#999"
                        placeholder="First number (1-100000)"
                        value={values.number1}
                        onChangeText={(text) => setFieldValue("number1", text)}
                        keyboardType="numeric"
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          // Focus next input if available
                          if (values.number1) {
                            // You can add ref focusing here if needed
                          }
                        }}
                      />
                    )}
                    {!loading && touched.number1 && errors.number1 && (
                      <Text style={styles.error}>{errors.number1}</Text>
                    )}
                    {!loading && (
                      <TextInput
                        style={styles.textInput}
                        onBlur={() => setFieldTouched("number2")}
                        placeholderTextColor="#999"
                        placeholder="Second number (1-100000)"
                        value={values.number2}
                        onChangeText={(text) => setFieldValue("number2", text)}
                        keyboardType="numeric"
                        returnKeyType="next"
                      />
                    )}
                    {!loading && touched.number2 && errors.number2 && (
                      <Text style={styles.error}>{errors.number2}</Text>
                    )}
                    {!loading && (
                      <TextInput
                        style={styles.textInput}
                        onBlur={() => setFieldTouched("number3")}
                        placeholderTextColor="#999"
                        placeholder="Third number (1-100000)"
                        value={values.number3}
                        onChangeText={(text) => setFieldValue("number3", text)}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                      />
                    )}
                    {!loading && touched.number3 && errors.number3 && (
                      <Text style={styles.error}>{errors.number3}</Text>
                    )}
                  </View>

                  {!loading && (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSubmit();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonText}>Draw Tarot Cards</Text>
                    </TouchableOpacity>
                  )}

                  {/* Add extra bottom padding for keyboard */}
                  <View style={styles.bottomSpacing} />
                </ScrollView>
              )}
            </Formik>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <StatusBar style="auto" />
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    fontWeight: "600",
  },
  text: {
    color: "white",
    textShadowColor: "black",
    textShadowRadius: 5,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
  },
  question: {
    color: "black",
    fontSize: 16,
    textAlign: "left",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(244, 92, 101, 0.3)",
  },
  textInput: {
    color: "black",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    minHeight: 50,
    borderWidth: 1,
    borderColor: "rgba(244, 92, 101, 0.3)",
  },
  numbersInputContainer: {
    marginTop: 30,
    width: "100%",
  },
  questionContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: "#f45c65",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    width: "100%",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 100, // Extra space at bottom for keyboard
  },
});

export default QuestionScreen;
