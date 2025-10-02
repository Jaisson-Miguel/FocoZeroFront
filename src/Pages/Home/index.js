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
import Cabecalho from "../../Components/Cabecalho.js";

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
      <Cabecalho usuario={nomeUsuario} navigation={navigation} />
      <View style={styles.containerBotoes}>
        <View style={styles.bloco}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ListarArea", { modo: "visualizar" })
            }
            style={[styles.buttonsHome, { backgroundColor: "yellow" }]}
          >
            <Text style={styles.textBotao}>Visita</Text>
          </TouchableOpacity>
          {funcao === "agente" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ListarVisitas")}
              style={[styles.buttonsHome, { backgroundColor: "green" }]}
            >
              <Text style={styles.textBotao}>Visitas Offline</Text>
            </TouchableOpacity>
          )}
          {funcao === "adm" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ListarAgentes")}
              style={[styles.buttonsHome, { backgroundColor: "green" }]}
            >
              <Text style={styles.textBotao}>Definir Quarteirões</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bloco}>
          {funcao === "adm" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={[styles.buttonsHome, { backgroundColor: "#D38B17" }]}
            >
              <Text style={styles.textBotao}>Equipe</Text>
            </TouchableOpacity>
          )}
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
    borderRadius: 20,
  },
  textBotao: {
    fontSize: font(3),
  },
});
