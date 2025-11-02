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
    // width: width(100), // Removido: flex: 1 já cobre a largura total
  },
  logo: {
    // Adicionado um tamanho padrão para a logo se ela não estiver definida em outro lugar
    // Exemplo: 60% da largura e 60% da altura do containerLogo
    width: width(70),
    height: height(22), // Ajustado para ser responsivo dentro do containerLogo de 40% da altura
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
    justifyContent: "flex-end", // Com ScrollView, talvez 'flex-start' seja mais adequado, mas mantive o original.
    // height: height(60), // Removido: flex: 1 + KeyboardAvoidingView já definem a altura
  },
  title: {
    fontSize: font(5), // Converte 50 para font(5) - Exemplo: 10 * 5 = 50
    fontWeight: "bold",
    margin: height(2), // Converte 25 para altura responsiva
    color: "#05419A",
    alignSelf: "center",
  },
  containerInput: {
    width: width(90),
    gap: height(2), // Converte 20 para altura responsiva
  },
  label: {
    borderWidth: 2,
    borderColor: "#05419A",
    borderRadius: 15,
    fontSize: font(4), // Converte 28 para font(2.5) - Exemplo: 10 * 2.5 = 25 (ajuste fino pode ser necessário)
    padding: height(2), // Converte 20 para altura responsiva
    height: height(10), // Converte 80 para altura responsiva - Exemplo: 8% da altura da tela
    marginBottom: height(0.5)
  },
  buttonLogin: {
    width: width(90),
    backgroundColor: "#05419A",
    height: height(10), // Converte 65 para altura responsiva - Exemplo: 6.5% da altura da tela
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    // marginTop: height(1), // Converte 10 para altura responsiva
  },
  textButtonLogin: {
    color: "white",
    fontWeight: "bold",
    fontSize: font(4), // Converte 28 para font(2.5) - Usando o tamanho padrão
  },
});