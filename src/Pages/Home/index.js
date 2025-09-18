import React from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";

export default function Home({ navigation }) {
  const handlePress = async () => {
    try {
      const response = await fetch("http://192.168.50.146:3333/test");
      const data = await response.json();
      Alert.alert("Resposta do backend", JSON.stringify(data));
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao App!</Text>
      <Button
        title="Ir para Login"
        onPress={() => navigation.navigate("Login")}
      />
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
});
