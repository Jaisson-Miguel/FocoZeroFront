import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { API_URL } from "./../../../config/config.js";
import { height, width, font } from "../../../utils/responsive.js";
import { Picker } from "@react-native-picker/picker";

export default function CadastrarArea({ navigation }) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [zona, setZona] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mapaUrl, setMapaUrl] = useState("");
  const [agentes, setAgentes] = useState([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState("");

  useEffect(() => {
    const fetchAgentes = async () => {
      try {
        const response = await fetch(`${API_URL}/listarUsuarios?funcao=agente`);
        const data = await response.json();

        if (!response.ok) {
          Alert.alert("Erro", data.message || "Falha ao carregar agentes");
          return;
        }

        setAgentes(data);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível conectar ao servidor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentes();
  }, []);

  const handleCadastrar = async () => {
    if (!nome || !codigo || !zona || !categoria || !mapaUrl) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cadastrarArea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          codigo,
          zona,
          categoria,
          mapaUrl,
          idResponsavel: agenteSelecionado,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.message || "Falha ao cadastrar");
        return;
      }

      Alert.alert("Sucesso", "Área cadastrada com sucesso!");
      navigation.goBack(); // volta para tela anterior
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Área</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Código"
        value={codigo}
        onChangeText={setCodigo}
      />

      <TextInput
        style={styles.input}
        placeholder="Zona"
        value={zona}
        onChangeText={setZona}
      />

      <Picker
        // selectedValue={form.categoria}
        style={styles.input}
        onValueChange={setCategoria}
      >
        <Picker.Item label="Selecione o tipo" value="" />
        <Picker.Item label="Bairro" value="Bairro" />
        <Picker.Item label="Povoado" value="Povoado" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="URL do mapa"
        value={mapaUrl}
        onChangeText={setMapaUrl}
      />
      <Text style={{ marginBottom: 5, fontSize: 16 }}>Agente Responsável:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={agenteSelecionado}
          onValueChange={(itemValue) => setAgenteSelecionado(itemValue)}
        >
          <Picker.Item label="Selecione um agente" value="" />
          {agentes.map((agente) => (
            <Picker.Item
              key={agente._id}
              label={agente.nome}
              value={agente._id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCadastrar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#05419A",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#05419A",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonsHome: {
    // backgroundColor: "green",
    width: width(20),
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
  },
});
