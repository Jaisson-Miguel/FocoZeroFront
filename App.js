import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Splash from "./src/Pages/Splash";
import Home from "./src/Pages/Home";
import Login from "./src/Pages/Login";
import Register from "./src/Pages/Register";
import ListarArea from "./src/Pages/ListarArea";
import ListarQuarteirao from "./src/Pages/ListarQuarteirao";
import ListarImovel from "./src/Pages/ListarImovel";
import CadastrarArea from "./src/Pages/CadastrarArea";
import CadastrarQuarteirao from "./src/Pages/CadastrarQuarteirao";
import CadastrarImovel from "./src/Pages/CadastrarImovel";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ListarArea"
          component={ListarArea}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ListarQuarteirao"
          component={ListarQuarteirao}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ListarImovel"
          component={ListarImovel}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="CadastrarArea"
          component={CadastrarArea}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="CadastrarQuarteirao"
          component={CadastrarQuarteirao}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="CadastrarImovel"
          component={CadastrarImovel}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
