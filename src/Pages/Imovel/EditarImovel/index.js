import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { API_URL } from "./../../../config/config.js";
import { Picker } from "@react-native-picker/picker";
import Cabecalho from "../../../Components/Cabecalho.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditarImovel({ route, navigation }) {
  const { imovel, offline } = route.params; // imóvel vindo da lista

  const [form, setForm] = useState({
    logradouro: imovel.logradouro || "",
    numero: imovel.numero || "",
    tipo: imovel.tipo || "",
    qtdHabitantes: String(imovel.qtdHabitantes || ""),
    qtdCachorros: String(imovel.qtdCachorros || ""),
    qtdGatos: String(imovel.qtdGatos || ""),
    observacao: imovel.observacao || "",
    status: imovel.status || "Pendente",
  });

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    try {
      if (offline) {
        // ---- SALVAR LOCALMENTE NO ASYNCSTORAGE ----
        const raw = await AsyncStorage.getItem("dadosQuarteiroes");
        if (raw) {
          let quarteiroes = JSON.parse(raw);

          quarteiroes = quarteiroes.map((q) => {
            if (q._id === imovel.idQuarteirao) {
              q.imoveis = q.imoveis.map((i) =>
                i._id === imovel._id
                  ? { ...i, ...form, editadoOffline: true }
                  : i
              );
            }
            return q;
          });

          await AsyncStorage.setItem(
            "dadosQuarteiroes",
            JSON.stringify(quarteiroes)
          );
        }

        Alert.alert("Sucesso", "Imóvel atualizado offline!");
        navigation.goBack();
      } else {
        // ---- SALVAR DIRETO NO BACKEND ----
        const response = await fetch(`${API_URL}/editarImovel/${imovel._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          return Alert.alert("Erro", data.message || "Falha ao editar imóvel.");
        }

        Alert.alert("Sucesso", "Imóvel editado no servidor!");
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível editar o imóvel.");
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Editar Imóvel</Text>

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
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
