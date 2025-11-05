import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "../../config/config.js";
import { height, width, font } from "../../utils/responsive.js";
import Cabecalho from "../../Components/Cabecalho.js";

export default function Cadastro({ navigation, route }) {
  const { funcaoUsuario } = route.params;
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [funcao, setFuncao] = useState(
    funcaoUsuario === "fiscal" ? "agente" : ""
  );
  const [isEditable, setIsEditable] = useState(funcaoUsuario !== "fiscal");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !cpf || !senha) {
      Alert.alert("Erro", "Nome, CPF e Senha são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cadastrarUsuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cpf,
          senha,
          funcao: funcao || "agente",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.message || "Falha ao cadastrar");
        return;
      }

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!", [
        { text: "Ok", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isPickerDisabled = !isEditable;
  const pickerContainerStyle = [
    styles.pickerContainer,
    isPickerDisabled && styles.disabledContainer,
  ];
  const pickerItemStyle = Platform.OS === "ios" ? styles.iosPickerItem : {};

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
            <Text style={styles.simpleTitle}>Novo Cadastro</Text>
          </View>

          <Text style={styles.inputLabel}>Nome Completo</Text>
          <TextInput
            placeholder="Digite o nome"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.inputLabel}>Código</Text>
          <TextInput
            placeholder="Digite o código"
            value={cpf}
            onChangeText={setCpf}
            style={styles.input}
            keyboardType="numeric"
            editable={!loading}
          />

          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput
            placeholder="Digite a senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.inputLabel}>Função</Text>
          <View style={pickerContainerStyle}>
            <Picker
              selectedValue={funcao}
              enabled={isEditable && !loading}
              onValueChange={(itemValue) => setFuncao(itemValue)}
              style={styles.picker}
              itemStyle={pickerItemStyle}
            >
              <Picker.Item label="Agente" value="agente" />
              <Picker.Item label="Fiscal" value="fiscal" />
              <Picker.Item label="Administrador" value="adm" />
            </Picker>
          </View>

          <TouchableOpacity
            onPress={handleCadastro}
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar Agente</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
    padding: width(3.75),
    paddingBottom: height(3),
  },
  simpleTitleContainer: {
    paddingHorizontal: width(3.75),
    alignItems: "center",
    paddingVertical: height(1.25),
    backgroundColor: "#fff",
    marginHorizontal: -width(3.75),
    marginBottom: height(1),
  },
  simpleTitle: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textTransform: "uppercase",
  },
  inputLabel: {
    fontSize: font(2.5),
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
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#05419A",
    marginBottom: height(1),
    overflow: "hidden",
    height: height(6),
    justifyContent: "center",
  },
  disabledContainer: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  picker: {
    width: "100%",
    color: "#333",
  },
  iosPickerItem: {
    height: height(6),
    lineHeight: height(6) * 1.25,
    paddingVertical: height(0.5),
  },
  button: {
    backgroundColor: "#05419A",
    padding: height(1.5),
    borderRadius: 5,
    marginTop: height(3),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font(2.5),
  },
});
