import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Cabecalho from "../../../Components/Cabecalho.js";
import { width, height, font } from "../../../utils/responsive.js";

export default function ListarOpcoes({ navigation }) {
  const reports = [
    {
      key: "ResumoCicloPDF",
      title: "Resumo Ciclo (PDF)",
      icon: "analytics-outline",
      bgColor: "#4CAF50",
    },
    {
      key: "ResumoDiario",
      title: "Resumo Diário (PDF)",
      icon: "timer-outline",
      bgColor: "#8ABDE0",
    },
    {
      key: "ResumoArea",
      title: "Resumo por Área (PDF)",
      icon: "map-outline",
      bgColor: "#D38B17",
    },
  ];

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Relatórios</Text>

        {reports.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.menuItemWrapper, { backgroundColor: item.bgColor }]}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={styles.menuIconContainer}>
              <Icon name={item.icon} size={font(6)} color="#fff" />
            </View>
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
    backgroundColor: "#fff",
  },
  container: {
    padding: width(5),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: height(2),
  },
  titulo: {
    fontSize: font(4),
    fontWeight: "bold",
    marginBottom: height(3),
    textAlign: "center",
    color: "#05419A",
    width: "100%",
  },
  menuItemWrapper: {
    width: width(40),
    alignItems: "center",
    paddingVertical: height(2.5),
    borderRadius: width(3),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: height(2),
  },
  menuIconContainer: {
    width: width(20),
    height: width(20),
    borderRadius: width(5),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height(1.5),
  },
  menuText: {
    fontSize: font(2.8),
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
