import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Splash from "./src/Pages/Splash";
import Home from "./src/Pages/Home";
import Login from "./src/Pages/Login";
import Register from "./src/Pages/Register";
import CadastrarArea from "./src/Pages/Area/CadastrarArea";
import ListarAreas from "./src/Pages/Area/ListarAreas";
import CadastrarQuarteirao from "./src/Pages/Quarteirao/CadastrarQuarteirao";
import ListarQuarteirao from "./src/Pages/Quarteirao/ListarQuarteirao";
import CadastrarImovel from "./src/Pages/Imovel/CadastrarImovel";
import ListarImovel from "./src/Pages/Imovel/ListarImovel";
import EditarImovel from "./src/Pages/Imovel/EditarImovel";
import Visita from "./src/Pages/Visita/CadastrarVisita";
import ListarVisitas from "./src/Pages/Visita/ListarVisitas";
import DetalhesVisita from "./src/Pages/Visita/DetalhesVisita";
import ListarAgentes from "./src/Pages/Usuario/ListarAgentes";
import AtribuirQuarteirao from "./src/Pages/AtribuirQuarteiroes";
import ResumoDiario from "./src/Pages/Visita/ResumoDiario";

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
          name="ListarAreas"
          component={ListarAreas}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ListarQuarteirao"
          component={ListarQuarteirao}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ListarImovel"
          component={ListarImovel}
          options={{ headerShown: false }}
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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditarImovel"
          component={EditarImovel}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Visita"
          component={Visita}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ListarVisitas"
          component={ListarVisitas}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DetalhesVisita"
          component={DetalhesVisita}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ListarAgentes"
          component={ListarAgentes}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="AtribuirQuarteirao"
          component={AtribuirQuarteirao}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ResumoDiario"
          component={ResumoDiario}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
