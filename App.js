import "react-native-gesture-handler";
import React, { useState, useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import * as SplashScreen from 'expo-splash-screen'; 
import * as Font from 'expo-font';
import { FontAwesome } from '@expo/vector-icons'; 
import Splash from "./src/Pages/Splash";
import Home from "./src/Pages/Home";
import Login from "./src/Pages/Login";
import Register from "./src/Pages/Register";
import CadastrarArea from "./src/Pages/Area/CadastrarArea";
import ListarAreas from "./src/Pages/Area/ListarAreas";
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
import QuarteiraoOffline from "./src/Pages/Visita/QuarteiraoOffline";
import ImovelOffline from "./src/Pages/Visita/ImovelOffline";
import EditarImovelOffline from "./src/Pages/Visita/EditarImovelOffline";
import ResumoCiclo from "./src/Pages/Fiscal/ResumoCiclo";
import AtualizarQuarteirao from "./src/Pages/Visita/AtualizarQuarteirao";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync({
                    'FontAwesome': FontAwesome.font, 
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
                        options={{ headerShown: false }}
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
                        options={{ headerShown: false }}
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
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="QuarteiraoOffline"
                        component={QuarteiraoOffline}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ImovelOffline"
                        component={ImovelOffline}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="EditarImovelOffline"
                        component={EditarImovelOffline}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ResumoCiclo"
                        component={ResumoCiclo}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AtualizarQuarteirao"
                        component={AtualizarQuarteirao}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
}