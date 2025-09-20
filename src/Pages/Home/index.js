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
import { getNome, logout } from "../../utils/tokenStorage.js";

export default function Home({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    const fetchNome = async () => {
      const nome = await getNome();
      if (nome) setNomeUsuario(nome);
    };
    fetchNome();
  }, []);

  return (
    <View style={styles.container}>
      <Text>{nomeUsuario}</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("Login")}
        style={styles.buttonsHome}
      >
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => logout(navigation)}
        style={[styles.buttonsHome, { backgroundColor: "blue" }]}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
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
