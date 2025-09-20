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
} from "react-native";
import { API_URL } from "../../config/config.js";
import { salvarToken } from "../../utils/tokenStorage.js";

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
      <View style={styles.conteinerLogo}>
        <Image
          style={styles.logo}
          source={require("../../../assets/Logo.png")}
          resizeMode="contain"
        />
      </View>

      <Button
        title="Ir para Register"
        onPress={() => navigation.navigate("Register")}
      />

      <View style={styles.containerWhite}>
        <View style={styles.containerInput}>
          <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>
            Login
          </Text>

          <TextInput
            placeholder="CPF"
            value={cpf}
            onChangeText={setCpf}
            style={styles.label}
          />

          <TextInput
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={styles.label}
          />

          <TouchableOpacity onPress={handleLogin} style={styles.buttonLogin}>
            <Text style={styles.textButtonLogin}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#05419A",
  },
  containerLogo: {
    // border,
  },

  containerWhite: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  containerInput: {
    width: "80%",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  buttonLogin: {
    backgroundColor: "#05419A",
    flex: 1,
    alignItems: "center",
  },
  textButtonLogin: {
    color: "white",
  },
});
