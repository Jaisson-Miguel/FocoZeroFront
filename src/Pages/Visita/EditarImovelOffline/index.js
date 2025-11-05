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
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Cabecalho from "../../../Components/Cabecalho";
import { height, width, font } from "../../../utils/responsive";

const NENHUMA_OBSERVACAO = "Nenhuma observação.";

const mapearTipoImovel = (tipoAbreviado) => {
  const tipos = {
    r: "Residência",
    c: "Comércio",
    tb: "Terreno Baldio",
    pe: "Ponto Estratégico",
    out: "Outros",
  };
  const chave = tipoAbreviado ? String(tipoAbreviado).toLowerCase().trim() : "";
  return (
    tipos[chave] ||
    (tipoAbreviado ? String(tipoAbreviado).toUpperCase() : "NÃO ESPECIFICADO")
  );
};

export default function EditarImovelOffline({ route, navigation }) {
  const { imovel } = route.params;
  const insets = useSafeAreaInsets(); // 👈 obtém a área segura inferior

  const inicialObservacao =
    imovel.observacao && String(imovel.observacao).trim() !== NENHUMA_OBSERVACAO
      ? imovel.observacao
      : "";

  const [form, setForm] = useState({
    logradouro: imovel.logradouro || "",
    numero: String(imovel.numero || ""),
    tipo: imovel.tipo || "",
    qtdHabitantes: String(imovel.qtdHabitantes || ""),
    qtdCachorros: String(imovel.qtdCachorros || ""),
    qtdGatos: String(imovel.qtdGatos || ""),
    observacao: inicialObservacao,
    status: imovel.status || "Pendente",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    if (!form.logradouro || !form.numero || !form.tipo) {
      return Alert.alert("Erro", "Preencha os campos obrigatórios!");
    }

    setLoading(true);

    try {
      const raw = await AsyncStorage.getItem("dadosImoveis");
      let todos = raw ? JSON.parse(raw) : [];

      const atualizados = todos.map((item) => {
        if (item._id === imovel._id) {
          return {
            ...item,
            ...form,
            observacao: form.observacao || NENHUMA_OBSERVACAO,
            editado: true,
          };
        }
        return item;
      });

      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(atualizados));

      Alert.alert("Sucesso", "Imóvel atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log("Erro ao salvar imóvel offline:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  }

  const tipoOuComplemento = imovel.complemento || imovel.tipo;
  const tipoMapeadoDetalhado = mapearTipoImovel(tipoOuComplemento);

  // 👇 calcula a margem inferior com base na área segura
  const bottomMargin = insets.bottom > 0 ? insets.bottom : height(2);

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? height(8) : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.simpleTitleContainer}>
            <Text style={styles.simpleTitle}>Editar Imóvel</Text>
            <Text style={styles.simpleSubtitle}>
              Nº {imovel.numero} - {tipoMapeadoDetalhado}
            </Text>
          </View>

          <Text style={styles.inputLabel}>Logradouro</Text>
          <TextInput
            style={styles.input}
            placeholder="Logradouro"
            value={form.logradouro}
            onChangeText={(v) => handleChange("logradouro", v)}
          />

          <Text style={styles.inputLabel}>Número</Text>
          <TextInput
            style={styles.input}
            placeholder="Número"
            keyboardType="numeric"
            value={form.numero}
            onChangeText={(v) => handleChange("numero", v)}
          />

          <Text style={styles.inputLabel}>Tipo de Imóvel</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.tipo}
              style={styles.picker}
              onValueChange={(v) => handleChange("tipo", v)}
            >
              <Picker.Item label="Selecione o tipo" value="" />
              <Picker.Item label="Residência" value="r" />
              <Picker.Item label="Comércio" value="c" />
              <Picker.Item label="Terreno baldio" value="tb" />
              <Picker.Item label="Ponto estratégico" value="pe" />
              <Picker.Item label="Outro" value="out" />
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Habitantes</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a quantidade..."
            keyboardType="numeric"
            value={form.qtdHabitantes}
            onChangeText={(v) => handleChange("qtdHabitantes", v)}
          />

          <Text style={styles.inputLabel}>Cães</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a quantidade..."
            keyboardType="numeric"
            value={form.qtdCachorros}
            onChangeText={(v) => handleChange("qtdCachorros", v)}
          />

          <Text style={styles.inputLabel}>Gatos</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a quantidade..."
            keyboardType="numeric"
            value={form.qtdGatos}
            onChangeText={(v) => handleChange("qtdGatos", v)}
          />

          <Text style={styles.inputLabel}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={NENHUMA_OBSERVACAO}
            multiline
            numberOfLines={4}
            value={form.observacao}
            onChangeText={(v) => handleChange("observacao", v)}
          />

          {/* 👇 Botão ajustado com área segura */}
          <View style={[styles.buttonWrapper, { marginBottom: bottomMargin }]}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: width(3.75),
  },
  simpleTitleContainer: {
    alignItems: "center",
    paddingVertical: height(1.25),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(5, 65, 154, 0.6)",
    marginBottom: height(2.5),
  },
  simpleTitle: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textTransform: "uppercase",
  },
  simpleSubtitle: {
    fontSize: font(2.25),
    color: "#666",
    textTransform: "uppercase",
  },
  inputLabel: {
    fontSize: font(2.25),
    color: "#05419A",
    fontWeight: "bold",
    marginBottom: height(0.75),
    marginTop: height(1),
  },
  input: {
    backgroundColor: "#fff",
    padding: height(1.5),
    paddingHorizontal: width(3),
    borderRadius: 5,
    marginBottom: height(1),
    borderWidth: 1,
    borderColor: "#05419A",
    fontSize: font(2.25),
    color: "#333",
  },
  textArea: {
    height: height(10),
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#05419A",
    marginBottom: height(1),
    overflow: "hidden",
    height: height(6),
  },
  picker: {
    width: "100%",
    color: "#333",
  },
  buttonWrapper: {
    backgroundColor: "#fff",
    paddingTop: height(1),
  },
  button: {
    backgroundColor: "#05419A",
    padding: height(1.5),
    borderRadius: 5,
    marginTop: height(2),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font(2.5),
  },
});
