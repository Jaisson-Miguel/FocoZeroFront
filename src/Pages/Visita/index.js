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
import { getId } from "../../utils/tokenStorage.js";
import { API_URL } from "../../config/config.js";

export default function Visita({ route, navigation }) {
  const { imovel } = route.params;
  const [agenteId, setAgenteId] = useState(null);

  useEffect(() => {
    const fetchNome = async () => {
      const userId = await getId();
      if (userId) setAgenteId(userId);
    };
    fetchNome();
  }, []);

  const [form, setForm] = useState({
    depositosInspecionados: {
      a1: "",
      a2: "",
      b: "",
      c: "",
      d1: "",
      d2: "",
      e: "",
    },
    qtdDepEliminado: "",
    foco: "",
    qtdLarvicida: "",
    qtdDepTratado: "",
    // status: "visitado",
  });

  const handleChange = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleDepositoChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      depositosInspecionados: {
        ...prev.depositosInspecionados,
        [campo]: valor,
      },
    }));
  };

  const salvarVisita = async () => {
    if (!agenteId) {
      Alert.alert("Erro", "ID do agente não carregado ainda.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/cadastrarVisita`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idImovel: imovel._id,
          idAgente: agenteId,
          tipo: imovel.tipo,
          dataVisita: new Date(),
          depositosInspecionados: {
            a1: Number(form.depositosInspecionados.a1) || 0,
            a2: Number(form.depositosInspecionados.a2) || 0,
            b: Number(form.depositosInspecionados.b) || 0,
            c: Number(form.depositosInspecionados.c) || 0,
            d1: Number(form.depositosInspecionados.d1) || 0,
            d2: Number(form.depositosInspecionados.d2) || 0,
            e: Number(form.depositosInspecionados.e) || 0,
          },
          qtdDepEliminado: Number(form.qtdDepEliminado),
          foco: form.foco === "sim", // true se escrever "sim"
          qtdLarvicida: Number(form.qtdLarvicida),
          qtdDepTratado: Number(form.qtdDepTratado),
          sincronizado: undefined,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Erro",
          data.message || "Não foi possível registrar a visita"
        );
        return;
      }

      Alert.alert("Sucesso", "Visita registrada com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha de conexão com o servidor.");
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registrar Visita</Text>
      <Text style={styles.subtitulo}>
        Imóvel: {imovel.logradouro}, {imovel.numero}
      </Text>

      {["a1", "a2", "b", "c", "d1", "d2", "e"].map((campo) => (
        <TextInput
          key={campo}
          style={styles.input}
          placeholder={campo.toUpperCase()}
          keyboardType="numeric"
          value={form.depositosInspecionados[campo]}
          onChangeText={(v) => handleDepositoChange(campo, v)}
        />
      ))}

      <TextInput
        style={styles.input}
        placeholder="Qtd. Depósitos Eliminados"
        keyboardType="numeric"
        value={form.qtdDepEliminado}
        onChangeText={(v) => handleChange("qtdDepEliminado", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Houve foco? (sim/não)"
        value={form.foco}
        onChangeText={(v) => handleChange("foco", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Qtd. de Larvicida"
        keyboardType="numeric"
        value={form.qtdLarvicida}
        onChangeText={(v) => handleChange("qtdLarvicida", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Qtd. Depósitos Tratados"
        keyboardType="numeric"
        value={form.qtdDepTratado}
        onChangeText={(v) => handleChange("qtdDepTratado", v)}
      />

      <TouchableOpacity style={styles.botao} onPress={salvarVisita}>
        <Text style={styles.textoBotao}>Salvar Visita</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  botao: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
