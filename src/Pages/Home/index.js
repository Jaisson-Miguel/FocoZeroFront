import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { height, width, font } from "../../utils/responsive.js";
import { getFuncao, getNome, getId } from "../../utils/tokenStorage.js";
import Cabecalho from "../../Components/Cabecalho.js";

const MenuItem = ({ iconName, iconColor, bgColor, text, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItemWrapper}>
    <View style={[styles.menuIconContainer, { backgroundColor: bgColor }]}>
      <Icon name={iconName} size={font(8)} color={iconColor} />
    </View>
    <Text style={styles.menuText}>{text}</Text>
  </TouchableOpacity>
);

export default function Home({ navigation }) {
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [funcao, setFuncao] = useState(false);
  const [idUsuario, setIdUsuario] = useState("");

  useEffect(() => {
    const fetchNome = async () => {
      const nome = await getNome();
      const userFuncao = await getFuncao();
      const userId = await getId();
      if (nome) setNomeUsuario(nome);
      if (userFuncao) setFuncao(userFuncao);
      if (userId) setIdUsuario(userId);
    };
    fetchNome();
  }, []);

  const menuItems = (funcao) => {
    if (funcao === "agente") {
      return [
        {
          text: "REALIZAR VISITAS",
          onPress: () => navigation.navigate("QuarteiraoOffline"),
          bgColor: "#2CA856",
          iconName: "home-outline",
          iconColor: "#333",
        },
        {
          text: "MINHA ÁREA",
          onPress: () =>
            navigation.navigate("ListarAreas", {
              modo: "visualizar",
              idUsuario,
              modoI: "Editar",
            }),
          bgColor: "#CEC931",
          iconName: "map-outline",
          iconColor: "#333",
        },
        {
          text: "ÁREAS DO MUNICÍPIO",
          onPress: () =>
            navigation.navigate("ListarAreas", {
              modo: "visualizar",
              modoI: "Visualizar",
            }),
          bgColor: "#D38B17",
          iconName: "map-sharp",
          iconColor: "#333",
        },
        {
          text: "DIÁRIOS",
          onPress: () =>
            navigation.navigate("ListarDiario", { modo: "visualizar", idAgente: idUsuario }),
          bgColor: "#8ABDE0",
          iconName: "timer-outline",
          iconColor: "#333",
        },
      ];
    }

    if (funcao === "adm" || funcao === "fiscal") {
      return [
        {
          text: "ÁREAS",
          onPress: () =>
            navigation.navigate("ListarAreas", {
              modo: "visualizar",
              modoI: funcao === "fiscal" ? "detalhes" : "Editar",
            }),
          bgColor: "#CEC931",
          iconName: "map-outline",
          iconColor: "#333",
        },
        {
          text: "EQUIPE",
          onPress: () => navigation.navigate("ListarAgentes", { funcao }),
          bgColor: "#D38B17",
          iconName: "people-outline",
          iconColor: "#333",
        },
        {
          text: "DEFINIR QUARTEIRÕES",
          onPress: () => navigation.navigate("AgenteQuarteirao", { funcao }),
          bgColor: "#2CA856",
          iconName: "grid-outline",
          iconColor: "#333",
        },
        {
          text: "RESUMO CICLO",
          onPress: () => navigation.navigate("ResumoCiclo"),
          bgColor: "#d3175fff",
          iconName: "analytics-outline",
          iconColor: "#333",
        },
      ];
    }

    return [];
  };

  const menu = menuItems(funcao);

  return (
    <View style={styles.container}>
      <Cabecalho usuario={nomeUsuario} navigation={navigation} />

      <View style={styles.containerBotoes}>
        {menu.map((item, index) => (
          <MenuItem
            key={index}
            iconName={item.iconName}
            iconColor={item.iconColor}
            bgColor={item.bgColor}
            text={item.text}
            onPress={item.onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  containerBotoes: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignContent: "center",
    paddingHorizontal: width(5),
    gap: width(5),
  },

  menuItemWrapper: {
    width: width(40),
    alignItems: "center",
    marginBottom: height(2),
  },

  menuIconContainer: {
    width: width(40),
    height: width(40),
    borderRadius: width(5),
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  menuText: {
    fontSize: font(2.5),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: height(1),
    color: "#333",
  },
});
