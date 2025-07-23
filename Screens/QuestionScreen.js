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

// Default mode if none selected (for backward compatibility)
const DEFAULT_MODE = {
  id: "three-card",
  title: "🔮 Three Card Reading",
  subtitle: "Past • Present • Future",
  description:
    "Classic three-card spread for general guidance and life insights",
  cardCount: 3,
};

function QuestionScreen({ navigation, route }) {
  // Get mode from navigation params, or use default
  const mode = route.params?.mode || DEFAULT_MODE;

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

    // Collect the required number of numbers based on mode
    const numbers = [];
    for (let i = 1; i <= mode.cardCount; i++) {
      numbers.push(values[`number${i}`]);
    }

    // For decision mode, also pass the option descriptions
    const navigationParams = {
      submitTime: dateNumber,
      question: values.question,
      numbers: numbers,
      mode: mode,
    };

    // Add option descriptions for decision mode
    if (mode.id === "decision") {
      navigationParams.option1Description = values.option1;
      navigationParams.option2Description = values.option2;
    }

    navigation.navigate("Answer", navigationParams);
    resetForm();
  };

  const [loading, isLoading] = useState(true);

  // Dynamic validation schema based on mode
  const getValidationSchema = (mode) => {
    const schema = {
      question: Yup.string().required().label("Question"),
    };

    // Add validation for each number input based on card count
    for (let i = 1; i <= mode.cardCount; i++) {
      schema[`number${i}`] = Yup.number()
        .required()
        .min(1)
        .max(100000)
        .label(`Number${i}`);
    }

    // Add option validation for decision mode
    if (mode.id === "decision") {
      schema.option1 = Yup.string().required().label("Option1");
      schema.option2 = Yup.string().required().label("Option2");
    }

    return Yup.object().shape(schema);
  };

  const validationSchema = getValidationSchema(mode);

  // Dynamic initial values based on mode
  const getInitialValues = (mode) => {
    const values = { question: "" };
    for (let i = 1; i <= mode.cardCount; i++) {
      values[`number${i}`] = "";
    }
    // Add option fields for decision mode
    if (mode.id === "decision") {
      values.option1 = "";
      values.option2 = "";
    }
    return values;
  };

  // Helper functions for mode-specific content
  const getPromptForMode = (mode) => {
    switch (mode.id) {
      case "three-card":
        return "Type in the question you want to ask in any language:";
      case "decision":
        return "What decision are you trying to make?";
      case "relationship":
        return "What would you like to know about your relationship?";
      default:
        return "Type in the question you want to ask in any language:";
    }
  };

  const getPlaceholderForMode = (mode) => {
    switch (mode.id) {
      case "three-card":
        return "What would you like to know?";
      case "decision":
        return "What decision are you trying to make?";
      case "relationship":
        return "How does my partner feel about me? What is our future together?";
      default:
        return "What would you like to know?";
    }
  };

  const getButtonText = (mode) => {
    return `Draw ${mode.cardCount} Tarot Cards`;
  };

  const getNumbersPromptText = (mode) => {
    switch (mode.id) {
      case "decision":
        return "Choose numbers for your decision reading:";
      case "three-card":
        return "Enter three different numbers to start your Tarot Cards Draw!";
      case "relationship":
        return "Enter five different numbers for your relationship reading:";
      default:
        return `Enter ${mode.cardCount} different numbers for your reading:`;
    }
  };

  const getNumberPlaceholder = (index, mode) => {
    switch (mode.id) {
      case "three-card":
        const threeCardLabels = ["Past", "Present", "Future"];
        return `${threeCardLabels[index - 1]} (1-100000)`;
      case "decision":
        const decisionLabels = ["Option 1", "Option 2"];
        return `${decisionLabels[index - 1]} (1-100000)`;
      case "relationship":
        const relationshipLabels = [
          "My feeling",
          "His/Her feeling",
          "Past situation",
          "Present situation",
          "Future situation",
        ];
        return `${relationshipLabels[index - 1]} (1-100000)`;
      default:
        const ordinals = ["First", "Second", "Third", "Fourth", "Fifth"];
        return `${ordinals[index - 1]} number (1-100000)`;
    }
  };

  // Render option inputs for decision mode
  const renderOptionInputs = (
    mode,
    values,
    setFieldValue,
    setFieldTouched,
    touched,
    errors
  ) => {
    if (mode.id !== "decision") return null;

    return (
      <View style={styles.optionsContainer}>
        {!loading && (
          <Text style={styles.text}>Describe your two options:</Text>
        )}
        {!loading && (
          <TextInput
            style={styles.optionInput}
            onBlur={() => setFieldTouched("option1")}
            placeholderTextColor="#999"
            placeholder="Option 1: What is this choice?"
            value={values.option1}
            onChangeText={(text) => setFieldValue("option1", text)}
            multiline
            numberOfLines={2}
          />
        )}
        {!loading && touched.option1 && errors.option1 && (
          <Text style={styles.error}>{errors.option1}</Text>
        )}
        {!loading && (
          <TextInput
            style={styles.optionInput}
            onBlur={() => setFieldTouched("option2")}
            placeholderTextColor="#999"
            placeholder="Option 2: What is this choice?"
            value={values.option2}
            onChangeText={(text) => setFieldValue("option2", text)}
            multiline
            numberOfLines={2}
          />
        )}
        {!loading && touched.option2 && errors.option2 && (
          <Text style={styles.error}>{errors.option2}</Text>
        )}
      </View>
    );
  };

  // Render number inputs dynamically
  const renderNumberInputs = (
    mode,
    values,
    setFieldValue,
    setFieldTouched,
    touched,
    errors
  ) => {
    const inputs = [];

    for (let i = 1; i <= mode.cardCount; i++) {
      inputs.push(
        <View key={i}>
          {!loading && (
            <TextInput
              style={styles.textInput}
              onBlur={() => setFieldTouched(`number${i}`)}
              placeholderTextColor="#999"
              placeholder={getNumberPlaceholder(i, mode)}
              value={values[`number${i}`]}
              onChangeText={(text) => setFieldValue(`number${i}`, text)}
              keyboardType="numeric"
              returnKeyType={i === mode.cardCount ? "done" : "next"}
              onSubmitEditing={
                i === mode.cardCount ? Keyboard.dismiss : undefined
              }
            />
          )}
          {!loading && touched[`number${i}`] && errors[`number${i}`] && (
            <Text style={styles.error}>{errors[`number${i}`]}</Text>
          )}
        </View>
      );
    }

    return inputs;
  };

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
              initialValues={getInitialValues(mode)}
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
                  {/* Mode display section */}
                  {!loading && (
                    <View style={styles.modeDisplay}>
                      <Text style={styles.modeTitle}>{mode.title}</Text>
                      <Text style={styles.modeDescription}>
                        {mode.description}
                      </Text>
                      <TouchableOpacity
                        style={styles.changeModeButton}
                        onPress={() => navigation.navigate("ModeSelection")}
                      >
                        <Text style={styles.changeModeText}>
                          Change Reading Type
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.questionContainer}>
                    {!loading && (
                      <Text style={styles.text}>{getPromptForMode(mode)}</Text>
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
                        placeholder={getPlaceholderForMode(mode)}
                        returnKeyType="done"
                        blurOnSubmit={true}
                      />
                    )}
                    {!loading && touched.question && errors.question && (
                      <Text style={styles.error}>{errors.question}</Text>
                    )}
                  </View>

                  {/* Option inputs for decision mode */}
                  {renderOptionInputs(
                    mode,
                    values,
                    setFieldValue,
                    setFieldTouched,
                    touched,
                    errors
                  )}

                  <View style={styles.numbersInputContainer}>
                    {!loading && (
                      <Text style={styles.text}>
                        {getNumbersPromptText(mode)}
                      </Text>
                    )}

                    {/* Dynamic number inputs */}
                    {renderNumberInputs(
                      mode,
                      values,
                      setFieldValue,
                      setFieldTouched,
                      touched,
                      errors
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
                      <Text style={styles.buttonText}>
                        {getButtonText(mode)}
                      </Text>
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
  // NEW: Options container for decision mode
  optionsContainer: {
    marginTop: 20,
    width: "100%",
  },
  optionInput: {
    color: "black",
    fontSize: 16,
    textAlign: "left",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(244, 92, 101, 0.3)",
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
    height: 100,
  },
  // Mode display styles
  modeDisplay: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f45c65",
    marginBottom: 5,
  },
  modeDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  changeModeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f45c65",
    borderRadius: 20,
  },
  changeModeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default QuestionScreen;
