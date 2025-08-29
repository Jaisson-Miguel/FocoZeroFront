import React from "react";
import { View, TextInput, Button, StyleSheet, Image } from "react-native";

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.conteinerLogo}>
        <Image
          style={styles.logo}
          source={require("../../../assets/Logo.png")}
          resizeMode="contain"
        />
      </View>

      <TextInput style={styles.label}></TextInput>
      <Button
        title="Ir para Register"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4329d5ff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    width: "80%",
    borderWidth: 2,
    borderRadius: 8,
  },
});
