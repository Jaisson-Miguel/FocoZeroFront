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
            contentContainerStyle={{}}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Login</Text>

            <View style={styles.containerInput}>
              <TextInput
                placeholder="CPF..."
                value={cpf}
                placeholderTextColor="#666"
                onChangeText={setCpf}
                style={styles.label}
              />

              <TextInput
                placeholder="Senha..."
                value={senha}
                onChangeText={setSenha}
                placeholderTextColor="#666"
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
  },
  logo: {
    width: width(70),
    height: height(22),
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
  },
  title: {
    fontSize: font(5),
    fontWeight: "bold",
    margin: height(2),
    color: "#05419A",
    alignSelf: "center",
  },
  containerInput: {
    width: width(90),
    gap: height(2),
  },
  label: {
    borderWidth: 2,
    borderColor: "#05419A",
    borderRadius: 15,
    fontSize: font(4),
    padding: height(2),
    height: height(10),
    marginBottom: height(0.5),
    color: "#000"
  },
  buttonLogin: {
    width: width(90),
    backgroundColor: "#05419A",
    height: height(10),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  textButtonLogin: {
    color: "white",
    fontWeight: "bold",
    fontSize: font(4),
  },
});