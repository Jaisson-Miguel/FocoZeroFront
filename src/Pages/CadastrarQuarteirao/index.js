import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../config/config.js";

export default function CadastrarQuarteirao({ route, navigation }) {
  const { idArea, nomeArea } = route.params;

  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCadastrar() {
    if (!numero) {
      Alert.alert("Erro", "Digite o número do quarteirão.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cadastrarQuarteirao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idArea, numero: Number(numero) }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.message || "Não foi possível cadastrar.");
      } else {
        Alert.alert(
          "Sucesso",
          `Quarteirão cadastrado: ${data.quarteirao.numero}`
        );
        setNumero("");
        navigation.goBack(); // volta para a tela de quarteirões
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao cadastrar quarteirão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Quarteirão</Text>
      {nomeArea && <Text style={styles.subtitle}>Área: {nomeArea}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Número do quarteirão"
        keyboardType="numeric"
        value={numero}
        onChangeText={setNumero}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCadastrar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
