import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { height, width, font } from "../../utils/responsive.js";
import { getFuncao, getNome, logout } from "../../utils/tokenStorage.js";

export default function Home({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [funcao, setFuncao] = useState(false);

  useEffect(() => {
    const fetchNome = async () => {
      const nome = await getNome();
      const userFuncao = await getFuncao();
      if (nome) setNomeUsuario(nome);
      if (userFuncao) setFuncao(userFuncao);
    };
    fetchNome();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{nomeUsuario}</Text>
      <View style={styles.containerBotoes}>
        <View style={styles.bloco1}>
          <TouchableOpacity
            onPress={() => logout(navigation)}
            style={[styles.buttonsHome, { backgroundColor: "blue" }]}
          >
            <Text>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.buttonsHome}
          >
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bloco1}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={[styles.buttonsHome, { backgroundColor: "red" }]}
          >
            <Text>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Visita")}
            style={[styles.buttonsHome, { backgroundColor: "yellow" }]}
          >
            <Text>Visita</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* {funcao === "adm" && (
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonsHome: {
    backgroundColor: "green",
    width: width(20),
  },
});
