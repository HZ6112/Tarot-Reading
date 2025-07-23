import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ModeSelectionScreen from "./Screens/ModeSelectionScreen";
import QuestionScreen from "./Screens/QuestionScreen";
import AnswerScreen from "./Screens/AnswerScreen";

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ModeSelection"
        screenOptions={{
          headerShown: false, // Hide headers for a cleaner look
        }}
      >
        <Stack.Screen
          name="ModeSelection"
          component={ModeSelectionScreen}
          options={{
            title: "Choose Reading Type",
          }}
        />
        <Stack.Screen
          name="Question"
          component={QuestionScreen}
          options={{
            title: "Ask Your Question",
          }}
        />
        <Stack.Screen
          name="Answer"
          component={AnswerScreen}
          options={{
            title: "Your Reading",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
