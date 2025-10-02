import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";

export default function ListarVisitas({ navigation }) {
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    const carregarVisitas = async () => {
      try {
        const visitasSalvas = await AsyncStorage.getItem("visitas");
        if (visitasSalvas) {
          setVisitas(JSON.parse(visitasSalvas));
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar as visitas.");
        console.error(error);
      }
    };

    const unsubscribe = navigation.addListener("focus", carregarVisitas);
    return unsubscribe;
  }, [navigation]);

  // Agrupar por área e quarteirão
  const agrupadas = {};
  visitas.forEach((v) => {
    if (!agrupadas[v.nomeArea]) agrupadas[v.nomeArea] = {};
    if (!agrupadas[v.nomeArea][v.nomeQuarteirao])
      agrupadas[v.nomeArea][v.nomeQuarteirao] = [];
    agrupadas[v.nomeArea][v.nomeQuarteirao].push(v);
  });

  const limparVisitas = async () => {
    try {
      await AsyncStorage.removeItem("visitas");
      setVisitas([]);
      Alert.alert("Sucesso", "Visitas removidas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível limpar as visitas.");
      console.error(error);
    }
  };

  const finalizarDiario = async () => {
    const visitasSalvas = await AsyncStorage.getItem("visitas");
    const lista = visitasSalvas ? JSON.parse(visitasSalvas) : [];

    const pendentes = lista.filter((v) => !v.sincronizado);

    if (pendentes.length === 0) {
      Alert.alert("Aviso", "Nenhuma visita pendente para finalizar.");
      return;
    }

    // calculando resumo
    const totalVisitas = pendentes.length;

    const visitasPorTipo = {};
    const depositosTotais = {};
    let totalFocos = 0;

    pendentes.forEach((v) => {
      visitasPorTipo[v.tipo] = (visitasPorTipo[v.tipo] || 0) + 1;

      Object.entries(v.depositosInspecionados || {}).forEach(
        ([campo, valor]) => {
          depositosTotais[campo] =
            (depositosTotais[campo] || 0) + Number(valor);
        }
      );

      if (v.foco) totalFocos += 1;
    });

    navigation.navigate("ResumoDiario", {
      pendentes,
      resumo: { totalVisitas, visitasPorTipo, depositosTotais, totalFocos },
    });
  };

  return (
    <ScrollView style={styles.container}>
      {Object.keys(agrupadas).length === 0 ? (
        <Text style={styles.msg}>Nenhuma visita salva ainda.</Text>
      ) : (
        Object.keys(agrupadas).map((nomeArea) => (
          <View key={nomeArea} style={styles.areaBox}>
            <Text style={styles.areaTitulo}>{nomeArea}:</Text>
            {Object.keys(agrupadas[nomeArea]).map((nomeQuarteirao) => (
              <View key={nomeQuarteirao} style={styles.quarteiraoBox}>
                <Text style={styles.quarteiraoTitulo}>
                  Quarteirão {nomeQuarteirao}:
                </Text>
                {agrupadas[nomeArea][nomeQuarteirao].map((v, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() =>
                      navigation.navigate("DetalhesVisita", { visita: v })
                    }
                  >
                    <Text style={styles.logradouro}>
                      {v.logradouro}, {v.numero} ({v.tipo}){" "}
                      {v.sincronizado ? "✅" : "⏳"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        ))
      )}

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#2196F3" }]}
        onPress={finalizarDiario}
      >
        <Text style={styles.textoBotao}>Finalizar Diário</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#f44336" }]}
        onPress={limparVisitas}
      >
        <Text style={styles.textoBotao}>Limpar Visitas</Text>
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
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  areaBox: {
    marginBottom: 15,
  },
  areaTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  quarteiraoBox: {
    paddingLeft: 15,
    marginBottom: 10,
  },
  quarteiraoTitulo: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
  },
  logradouro: {
    paddingLeft: 15,
    fontSize: 14,
    marginBottom: 2,
  },
  msg: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
