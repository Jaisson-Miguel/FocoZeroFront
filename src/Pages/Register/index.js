import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // precisa instalar: npm i @react-native-picker/picker
import { API_URL } from "../../config/config.js";

export default function Cadastro({ navigation, route }) {
  const { funcaoUsuario } = route.params; // vem da tela anterior
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [funcao, setFuncao] = useState(
    funcaoUsuario === "fiscal" ? "agente" : ""
  );
  const [isEditable, setIsEditable] = useState(funcaoUsuario !== "fiscal");

  const handleCadastro = async () => {
    if (!nome || !cpf || !senha) {
      Alert.alert("Erro", "Nome, CPF e Senha são obrigatórios!");
      return;
    }

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

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      {/* Outros campos de Nome, CPF e Senha */}
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      {/* Picker para função */}
      <View
        style={[
          styles.pickerContainer,
          !isEditable && { backgroundColor: "#eee" },
        ]}
      >
        <Picker
          selectedValue={funcao}
          enabled={isEditable}
          onValueChange={(itemValue) => setFuncao(itemValue)}
        >
          <Picker.Item label="Agente" value="agente" />
          <Picker.Item label="Fiscal" value="fiscal" />
          <Picker.Item label="Administrador" value="adm" />
        </Picker>
      </View>

      <TouchableOpacity onPress={handleCadastro} style={styles.button}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Já tem conta? Faça login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: { textAlign: "center", marginTop: 15, color: "blue" },
});
