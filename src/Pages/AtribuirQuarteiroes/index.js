import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../config/config.js";

export default function AtribuirQuarteirao({ route, navigation }) {
  const { idArea, nomeArea, idAgente } = route.params;
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log();

  // Buscar quarteirões da área
  useEffect(() => {
    const fetchQuarteiroes = async () => {
      try {
        const response = await fetch(`${API_URL}/listarQuarteiroes/${idArea}`);
        const data = await response.json();

        if (!response.ok) {
          Alert.alert("Erro", data.message || "Falha ao carregar quarteirões");
          return;
        }

        const semResponsavel = data.filter((q) => !q.idResponsavel);
        setQuarteiroes(semResponsavel);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível conectar ao servidor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuarteiroes();
  }, []);

  // Marcar/desmarcar quarteirão
  const toggleSelecionado = (id) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((q) => q !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  // Confirmar atribuição
  const confirmarAtribuicao = async () => {
    if (selecionados.length === 0) {
      Alert.alert("Aviso", "Selecione pelo menos um quarteirão");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/atribuirQuarteiroes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAgente,
          quarteiroes: selecionados,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Erro ao atribuir");

      Alert.alert("Sucesso", "Quarteirões atribuídos com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05419A" />
        <Text>Carregando quarteirões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atribuir quarteirões - {nomeArea}</Text>

      <FlatList
        data={quarteiroes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.quarteiraoItem,
              selecionados.includes(item._id) && styles.selecionado,
            ]}
            onPress={() => toggleSelecionado(item._id)}
          >
            <Text style={styles.quarteiraoNome}>{item.numero}</Text>
            <Text style={styles.quarteiraoInfo}>
              Imóveis: {item.totalImoveis || 0}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.btnConfirmar}
        onPress={confirmarAtribuicao}
      >
        <Text style={styles.btnText}>Confirmar Atribuição</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#05419A",
  },
  quarteiraoItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 5,
  },
  selecionado: {
    backgroundColor: "#cce5ff",
  },
  quarteiraoNome: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quarteiraoInfo: {
    fontSize: 14,
    color: "gray",
  },
  btnConfirmar: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
