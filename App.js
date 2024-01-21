import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QuestionScreen from "./Screens/QuestionScreen";
import AnswerScreen from "./Screens/AnswerScreen";
export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Question" component={QuestionScreen} />
        <Stack.Screen name="Answer" component={AnswerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
