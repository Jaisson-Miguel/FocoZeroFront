import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { font, height, width } from "../utils/responsive";
import { logout } from "../utils/tokenStorage.js";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Cabecalho({ usuario, navigation }) {
  return (
    <View style={styles.header}>
      <View style={{ width: width(12.5) }}>
        {usuario ? (
          <TouchableOpacity onPress={() => logout(navigation)}>
            <MaterialIcons
              name="logout"
              size={height(4.7)}
              color="white"
              style={{ transform: [{ scaleX: -1 }] }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={height(4.7)} color="white" />
          </TouchableOpacity>
        )}
      </View>
      {usuario && <Text style={styles.headerText}>Olá, {usuario}</Text>}
      <Image
        source={require("../../assets/Logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: "#05419A",
    paddingVertical: height(1),
    paddingHorizontal: width(2),
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: height(11),
    width: width(100),
  },
  headerText: {
    color: "#fff",
    fontSize: font(3),
    fontWeight: "bold",
  },
  logo: {
    height: height(5),
    width: width(12.5),
  },
});
