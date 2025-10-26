import React, { useState } from "react";
import {
    View,
    TextInput,
    Button,
    StyleSheet,
    Image,
    Text,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { API_URL } from "../../config/config.js";
import { salvarToken } from "../../utils/tokenStorage.js";
import { height, width, font } from "../../utils/responsive.js";

export default function Login({ navigation }) {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");

    const handleLogin = async () => {
        if (!cpf || !senha) {
            Alert.alert("Erro", "Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ cpf, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Erro", data.message || "Falha no login");
                return;
            }

            await salvarToken(data.token);

            navigation.navigate("Home");
        } catch (error) {
            Alert.alert("Erro", "Não foi possível conectar ao servidor");
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.containerLogo}>
                <Image
                    style={styles.logo}
                    source={require("./../../../assets/Logo.png")}
                    resizeMode="contain"
                />
            </View>
            <KeyboardAvoidingView
                style={{
                    flex: 1,
                }}
                behavior="padding"
            >
                <View style={styles.containerWhite}>
                    <ScrollView
                        contentContainerStyle={
                            {
                            }
                        }
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.title}>Login</Text>

                        <View style={styles.containerInput}>
                            <TextInput
                                placeholder="CPF..."
                                value={cpf}
                                onChangeText={setCpf}
                                style={styles.label}
                            />

                            <TextInput
                                placeholder="Senha..."
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                                style={styles.label}
                            />
                            <TouchableOpacity
                                onPress={handleLogin}
                                style={styles.buttonLogin}
                            >
                                <Text style={styles.textButtonLogin}>Entrar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
        width: width(100),
    },
    logo: {
    },
    containerLogo: {
        width: width(100),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#05419A",
        height: height(40),
        borderEndEndRadius: 20,
        borderStartEndRadius: 20,
    },
    containerWhite: {
        width: width(100),
        backgroundColor: "white",
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
        height: height(60),
    },
    title: {
        fontSize: 50,
        fontWeight: "bold",
        margin: 25,
        color: "#05419A",
        justifyContent: "center",
    },
    containerInput: {
        width: width(90),
        gap: 20,
    },
    label: {
        borderWidth: 2,
        borderRadius: 15,
        fontSize: 28,
        padding: 20,
        height: 80,
    },
    buttonLogin: {
        width: width(90),
        backgroundColor: "#05419A",
        height: 65,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        marginTop: 10,
    },
    textButtonLogin: {
        color: "white",
        fontSize: 28,
    },
});