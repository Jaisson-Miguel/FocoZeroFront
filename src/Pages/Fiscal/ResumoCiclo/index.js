import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";

export default function ResumoCiclo({ navigation }) {
  const [resumo, setResumo] = useState({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reseting, setReseting] = useState(false);

  // 🔹 Carrega o resumo do ciclo ao abrir
  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const id = await getId();
        const response = await fetch(`${API_URL}/resumoCiclo/${id}`);
        const data = await response.json();

        if (response.ok) {
          setResumo(data.resumo || {});
          setTotal(data.totalVisitados || 0);
        } else {
          Alert.alert("Erro", data.message || "Falha ao obter o resumo.");
        }
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
        Alert.alert("Erro", "Não foi possível carregar o resumo do ciclo.");
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  // 🔹 Função para resetar o ciclo
  const resetarCiclo = async () => {
    Alert.alert(
      "Confirmar ação",
      "Tem certeza que deseja fechar todos os imóveis visitados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setReseting(true);
              const id = await getId();
              const response = await fetch(`${API_URL}/resetarCiclo/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              const data = await response.json();

              if (response.ok) {
                Alert.alert("Sucesso", data.message);
                navigation.goBack();
              } else {
                Alert.alert("Erro", data.message || "Falha ao resetar ciclo.");
              }
            } catch (err) {
              console.error("Erro ao resetar ciclo:", err);
              Alert.alert("Erro", "Não foi possível resetar o ciclo.");
            } finally {
              setReseting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumo do Ciclo</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2CA856"
          style={{ marginTop: 20 }}
        />
      ) : total === 0 ? (
        <Text style={{ fontSize: 16, textAlign: "center", marginTop: 20 }}>
          Nenhum imóvel visitado encontrado.
        </Text>
      ) : (
        <View style={styles.box}>
          <Text style={styles.subtitulo}>Total de imóveis visitados:</Text>
          <Text style={styles.total}>{total}</Text>

          <Text style={[styles.subtitulo, { marginTop: 10 }]}>
            Distribuição por tipo:
          </Text>
          {Object.entries(resumo).map(([tipo, qtd]) => (
            <Text key={tipo} style={styles.item}>
              {tipo.toUpperCase()}: {qtd}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#4CAF50" }]}
        onPress={resetarCiclo}
        disabled={reseting || total === 0}
      >
        {reseting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Fechar Ciclo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#2196F3" }]}
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
    marginBottom: 20,
    textAlign: "center",
  },
  box: {
    padding: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 20,
  },
  subtitulo: {
    fontWeight: "600",
    fontSize: 16,
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  item: {
    fontSize: 15,
    marginTop: 4,
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
