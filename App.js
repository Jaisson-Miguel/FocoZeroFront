import "react-native-gesture-handler";
import React, { useState, useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";

// Importações do Expo para gerenciar fontes e splash screen
import * as SplashScreen from 'expo-splash-screen'; 
import * as Font from 'expo-font';
import { FontAwesome } from '@expo/vector-icons'; // Importa a referência da fonte FontAwesome

// ⚠️ IMPORTANTE: Certifique-se de que estes pacotes estão instalados:
// npx expo install expo-splash-screen expo-font @expo/vector-icons

// Importações de Páginas (mantidas como estavam)
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
import QuarteiraoOffline from "./src/Pages/Visita/QuarteiraoOffline";
import ImovelOffline from "./src/Pages/Visita/ImovelOffline";
import EditarImovelOffline from "./src/Pages/Visita/EditarImovelOffline";
import ResumoCiclo from "./src/Pages/Fiscal/ResumoCiclo";
import AtualizarQuarteirao from "./src/Pages/Visita/AtualizarQuarteirao";

// --- CONFIGURAÇÃO DA SPLASH SCREEN E FONTES ---

// 1. Mantém a tela de splash visível até que o aplicativo esteja pronto para renderizar.
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // 2. Carrega as fontes do FontAwesome (necessário para os ícones)
                await Font.loadAsync({
                    // 'FontAwesome' é o nome da fonte que a biblioteca precisa
                    'FontAwesome': FontAwesome.font, 
                });
                
                // (Aqui você adicionaria qualquer outra lógica de carregamento inicial, se houver)

            } catch (e) {
                console.warn(e);
            } finally {
                // 3. Define que o app está pronto para renderizar
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    // 4. Callback para esconder a tela de splash quando a view principal for renderizada.
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    // 5. Enquanto o app não estiver pronto, retorna null (a splash screen continua visível)
    if (!appIsReady) {
        return null;
    }

    // 6. O App principal é renderizado dentro de uma View que chama onLayoutRootView
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