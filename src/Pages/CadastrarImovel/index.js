import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { API_URL } from "../../config/config.js";
import { Picker } from "@react-native-picker/picker";

export default function CadastrarImovel({ route, navigation }) {
  const { idQuarteirao, numeroQuarteirao } = route.params;
  const [form, setForm] = useState({
    idQuarteirao: idQuarteirao || "",
    logradouro: "",
    numero: "",
    tipo: "",
    qtdHabitantes: "",
    qtdCachorros: "",
    qtdGatos: "",
    observacao: "",
    status: "",
  });

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    try {
      const response = await fetch(`${API_URL}/cadastrarImovel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert(
          "Erro",
          data.message || "Falha ao cadastrar imóvel."
        );
      }

      Alert.alert("Sucesso", "Imóvel cadastrado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível cadastrar o imóvel.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Imóvel</Text>

      {/* <TextInput
        style={styles.input}
        placeholder="ID do Quarteirão"
        value={form.idQuarteirao}
        onChangeText={(v) => handleChange("idQuarteirao", v)}
      /> */}
      <Text>Quarteirão: {numeroQuarteirao}</Text>
      <TextInput
        style={styles.input}
        placeholder="Logradouro"
        value={form.logradouro}
        onChangeText={(v) => handleChange("logradouro", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Número"
        keyboardType="numeric"
        value={form.numero}
        onChangeText={(v) => handleChange("numero", v)}
      />
      <Picker
        selectedValue={form.tipo}
        style={styles.input}
        onValueChange={(v) => handleChange("tipo", v)}
      >
        <Picker.Item label="Selecione o tipo" value="" />
        <Picker.Item label="Residencial" value="r" />
        <Picker.Item label="Comércio" value="c" />
        <Picker.Item label="Terreno baldio" value="tb" />
        <Picker.Item label="Ponto estratégico" value="pe" />
        <Picker.Item label="Outro" value="out" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Qtd. Habitantes"
        keyboardType="numeric"
        value={form.qtdHabitantes}
        onChangeText={(v) => handleChange("qtdHabitantes", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Qtd. Cachorros"
        keyboardType="numeric"
        value={form.qtdCachorros}
        onChangeText={(v) => handleChange("qtdCachorros", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Qtd. Gatos"
        keyboardType="numeric"
        value={form.qtdGatos}
        onChangeText={(v) => handleChange("qtdGatos", v)}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Observação"
        multiline
        value={form.observacao}
        onChangeText={(v) => handleChange("observacao", v)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#05419A",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#05419A",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
