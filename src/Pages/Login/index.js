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
  Platform,
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            style={styles.logo}
            source={require("./../../../assets/Logo.png")}
            resizeMode="contain"
          />
        </View>
        <View style={styles.containerWhite}>
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
          </View>

          <TouchableOpacity onPress={handleLogin} style={styles.buttonLogin}>
            <Text style={styles.textButtonLogin}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#05419A",
  },
  containerLogo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  containerWhite: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    // flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    margin: 30,
    color: "#05419A",
    justifyContent: "center",
  },
  containerInput: {
    width: width(90),
    gap: 20,
    flexGrow: 1,
  },
  label: {
    borderWidth: 2,
    borderRadius: 15,
    fontSize: 28,
    padding: 20,
    height: 80,
  },
  buttonLogin: {
    width: "90%",
    backgroundColor: "#05419A",
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    marginTop: 50,
  },
  textButtonLogin: {
    color: "white",
    fontSize: 28,
  },
  link: {
    fontSize: 20,
    marginTop: 15,
    color: "blue",
  },
});
