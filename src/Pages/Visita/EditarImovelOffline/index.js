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
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cabecalho from "../../../Components/Cabecalho";
import { Picker } from "@react-native-picker/picker";

export default function EditarImovelOffline({ route, navigation }) {
  const { imovel } = route.params;

  const [form, setForm] = useState({
    logradouro: imovel.logradouro || "",
    numero: String(imovel.numero || ""),
    tipo: imovel.tipo || "",
    qtdHabitantes: String(imovel.qtdHabitantes || ""),
    qtdCachorros: String(imovel.qtdCachorros || ""),
    qtdGatos: String(imovel.qtdGatos || ""),
    observacao: imovel.observacao || "",
    status: imovel.status || "Pendente",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    try {
      const raw = await AsyncStorage.getItem("dadosImoveis");
      let imoveis = raw ? JSON.parse(raw) : [];

      const index = imoveis.findIndex(
        (i) => String(i._id) === String(imovel._id)
      );

      if (index !== -1) {
        imoveis[index] = { ...imoveis[index], ...form, editadoOffline: true };
      } else {
        imoveis.push({ ...imovel, ...form, editadoOffline: true });
      }

      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(imoveis));

      Alert.alert("Sucesso", "Imóvel atualizado offline!");
      navigation.goBack(); // volta pra lista
    } catch (err) {
      console.error("Erro ao salvar imóvel offline:", err);
      Alert.alert("Erro", "Não foi possível salvar o imóvel.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Editar Imóvel (Offline)</Text>

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

          <TouchableOpacity style={styles.button} onPress={handleSave}>
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
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
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
