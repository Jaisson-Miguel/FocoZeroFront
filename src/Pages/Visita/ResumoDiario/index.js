import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";

export default function ResumoDiario({ route, navigation }) {
  const { pendentes, resumo } = route.params;
  const [loading, setLoading] = useState(false);
  const [visitas, setVisitas] = useState(pendentes);

  const sincronizarVisitas = async () => {
    if (visitas.length === 0) {
      Alert.alert("Aviso", "Nenhuma visita pendente para sincronizar.");
      return;
    }

    setLoading(true);

    let listaAtualizada = [...visitas];

    for (let visita of listaAtualizada) {
      try {
        // Remove campo local 'sincronizado' antes de enviar
        const { sincronizado, ...dadosParaEnviar } = visita;

        const response = await fetch(`${API_URL}/cadastrarVisita`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosParaEnviar),
        });

        if (response.ok) {
          visita.sincronizado = true; // marca localmente
        } else {
          console.log("Erro no servidor:", await response.text());
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      }
    }

    // Atualiza AsyncStorage
    try {
      const todasVisitasSalvas = await AsyncStorage.getItem("visitas");
      const listaTotal = todasVisitasSalvas
        ? JSON.parse(todasVisitasSalvas)
        : [];

      // atualiza apenas as visitas pendentes no armazenamento
      const atualizadas = listaTotal.map((v) => {
        const encontrada = listaAtualizada.find(
          (p) => p.idImovel === v.idImovel
        );
        return encontrada ? encontrada : v;
      });

      await AsyncStorage.setItem("visitas", JSON.stringify(atualizadas));
      setVisitas(listaAtualizada);

      navigation.goBack();

      Alert.alert("Sucesso", "Todas as visitas pendentes foram sincronizadas!");
    } catch (err) {
      console.error("Erro ao atualizar AsyncStorage:", err);
      Alert.alert("Erro", "Não foi possível atualizar o armazenamento local.");
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumo Diário</Text>

      <Text style={styles.item}>
        Total de visitas pendentes: {resumo.totalVisitas}
      </Text>

      <View style={styles.box}>
        <Text style={styles.subtitulo}>Visitas por tipo:</Text>
        {Object.entries(resumo.visitasPorTipo).map(([tipo, qtd]) => (
          <Text key={tipo}>
            {tipo.toUpperCase()}: {qtd}
          </Text>
        ))}
      </View>

      <View style={styles.box}>
        <Text style={styles.subtitulo}>
          Depósitos inspecionados (total por tipo):
        </Text>
        {Object.entries(resumo.depositosTotais).map(([campo, qtd]) => (
          <Text key={campo}>
            {campo.toUpperCase()}: {qtd}
          </Text>
        ))}
      </View>

      <Text style={styles.item}>Total de focos: {resumo.totalFocos}</Text>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#2196F3" }]}
        onPress={sincronizarVisitas}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Sincronizar Visitas</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#4CAF50" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoBotao}>Voltar</Text>
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
    marginBottom: 15,
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
  },
  box: {
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 15,
  },
  subtitulo: {
    fontWeight: "600",
    marginBottom: 5,
  },
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
