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

export default function Home({ navigation }) {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!cpf || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch("http://192.168.10.4:3333/login", {
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

      console.log("Usuário logado:", data.usuario);
      console.log("Token:", data.token);

      navigation.navigate("Home", { usuario: data.usuario });
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

      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>
          Login
        </Text>

        <TextInput
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            width: 300,
          }}
        />

        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 20,
            borderRadius: 5,
          }}
        />

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: "blue",
            padding: 15,
            borderRadius: 5,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            Entrar
          </Text>
        </TouchableOpacity>
      </View>
      <Button
        title="Ir para Register"
        onPress={() => navigation.navigate("Register")}
      />
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    width: "80%",
    borderWidth: 2,
    borderRadius: 8,
  },
});
