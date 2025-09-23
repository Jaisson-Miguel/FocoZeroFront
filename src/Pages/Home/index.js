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
        <View style={styles.bloco}>
          <TouchableOpacity
            onPress={() => logout(navigation)}
            style={[styles.buttonsHome, { backgroundColor: "blue" }]}
          >
            <Text style={styles.textBotao}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.buttonsHome}
          >
            <Text style={styles.textBotao}>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bloco}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={[styles.buttonsHome, { backgroundColor: "red" }]}
          >
            <Text style={styles.textBotao}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ListarArea")}
            style={[styles.buttonsHome, { backgroundColor: "yellow" }]}
          >
            <Text style={styles.textBotao}>Visita</Text>
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
  containerBotoes: {
    flex: 1,
    justifyContent: "center",
    gap: width(5),
  },
  bloco: {
    flexDirection: "row",
    gap: width(5),
  },

  buttonsHome: {
    backgroundColor: "green",
    width: width(30),
    height: height(15),
    alignItems: "center",
    justifyContent: "center",
  },
  textBotao: {
    fontSize: font(3),
  },
});
