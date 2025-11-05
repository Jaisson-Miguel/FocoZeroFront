import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; // Ícones originais do Ionicons
import Cabecalho from "../../../Components/Cabecalho.js";
import { width, height, font } from "../../../utils/responsive.js"; // Funções de responsividade originais

export default function ListarOpcoes({ navigation }) {
  // Retornando aos ícones originais do Ionicons
  const reports = [
    {
      key: "ResumoCicloPDF",
      title: "RESUMO DO CICLO (PDF)",
      icon: "analytics-outline",
      bgColor: "#4CAF50", // Verde
    },
    {
      key: "FocosPorArea",
      title: "FOCOS POR ÁREA",
      icon: "timer-outline",
      bgColor: "#8ABDE0", // Azul claro
    },
    {
      key: "ListarAreas",
      title: "Focos por Quarteirao",
      icon: "map-outline",
      bgColor: "#D38B17", // Laranja/Marrom
    },
  ];

  return (
    <View style={styles.safeArea}>
      {/* Assumindo que Cabecalho é um componente válido no seu projeto */}
      <Cabecalho navigation={navigation} />

      {/* O container agora foca em uma lista vertical com bom espaçamento */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Relatórios</Text>

        {reports.map((item) => (
          <TouchableOpacity
            key={item.key}
            // Adicionado activeOpacity para melhor feedback visual em apps mobile
            activeOpacity={0.7}
            style={[styles.menuItemWrapper, { backgroundColor: item.bgColor }]}
            onPress={() => navigation.navigate(item.key, { modo: "relatorio" })}
          >
            {/* Contêiner do Ícone - Mantendo o estilo visual aprimorado (círculo com borda) */}
            <View style={styles.menuIconContainer}>
              <Icon name={item.icon} size={font(5)} color="#fff" />
            </View>

            {/* Texto do Menu - Alinhado à esquerda */}
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Fundo mais suave
  },
  container: {
    padding: width(5),
    // Removido flexWrap e justifyContent para forçar o layout vertical (um item por linha)
  },
  titulo: {
    fontSize: font(4.5),
    fontWeight: "800",
    marginBottom: height(3),
    textAlign: "center",
    color: "#05419A",
    width: "100%",
  },
  menuItemWrapper: {
    width: "100%", // Largura total
    flexDirection: "row", // Alinhamento horizontal de ícone e texto
    alignItems: "center",
    paddingVertical: height(2), // Altura ligeiramente reduzida
    paddingHorizontal: width(4),
    borderRadius: width(4),

    // Sombra aprimorada (React Native uses elevation for Android and shadow props for iOS)
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
    marginBottom: height(2), // Espaçamento entre os botões

    // Borda sutil para dar o efeito "lift" (elevação)
    borderBottomWidth: 4,
    borderBottomColor: "rgba(255, 255, 255, 0.4)",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  menuIconContainer: {
    width: width(15),
    height: width(15),
    borderRadius: width(8), // Perfeitamente circular
    alignItems: "center",
    justifyContent: "center",
    marginRight: width(4), // Espaçamento entre o ícone e o texto
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  menuText: {
    // flex: 1 para ocupar o restante do espaço e forçar alinhamento à esquerda
    flex: 1,
    fontSize: font(2.5),
    fontWeight: "700",
    color: "#fff",
    textAlign: "left", // Alinhamento do texto
  },
});
