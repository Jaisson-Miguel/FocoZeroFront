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
      title: "RESUMO DO CICLO (PDF)",
      icon: "analytics-outline",
      bgColor: "#4CAF50",
    },
    {
      key: "FocosPorArea",
      title: "FOCOS POR ÁREA",
      icon: "timer-outline",
      bgColor: "#8ABDE0",
    },
    {
      key: "ListarAreas",
      title: "FOCOS POR QUARTEIRÃO",
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
            activeOpacity={0.7}
            style={[styles.menuItemWrapper, { backgroundColor: item.bgColor }]}
            onPress={() => navigation.navigate(item.key, { modo: "relatorio" })}
          >
            <View style={styles.menuIconContainer}>
              <Icon name={item.icon} size={font(5)} color="#fff" />
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
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: width(5),
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height(2),
    paddingHorizontal: width(4),
    borderRadius: width(4),

    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5.46,
    marginBottom: height(2),

    borderBottomWidth: 4,
    borderBottomColor: "rgba(255, 255, 255, 0.4)",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  menuIconContainer: {
    width: width(15),
    height: width(15),
    borderRadius: width(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: width(4),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  menuText: {
    flex: 1,
    fontSize: font(2.5),
    fontWeight: "700",
    color: "#fff",
    textAlign: "left",
  },
});