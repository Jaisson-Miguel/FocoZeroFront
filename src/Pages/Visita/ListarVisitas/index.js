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
    try {
      console.log("Iniciando Finalizar Diário...");

      const visitasSalvas = await AsyncStorage.getItem("visitas");
      console.log("Visitas salvas brutas:", visitasSalvas);

      let lista = visitasSalvas ? JSON.parse(visitasSalvas) : [];
      console.log("Lista parseada:", lista);

      // pega só as não sincronizadas
      const pendentes = lista.filter((v) => !v.sincronizado);
      console.log("Pendentes:", pendentes);

      if (pendentes.length === 0) {
        Alert.alert("Aviso", "Nenhuma visita pendente para finalizar.");
        return;
      }

      for (let visita of pendentes) {
        console.log("Enviando visita:", visita);

        try {
          const { sincronizado, ...dadosParaEnviar } = visita;

          const response = await fetch(`${API_URL}/cadastrarVisita`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosParaEnviar),
          });

          console.log("Resposta status:", response.status);

          if (response.ok) {
            console.log("Visita enviada com sucesso:", visita.idImovel);
            visita.sincronizado = true;
          } else {
            console.log("Erro no servidor:", await response.text());
          }
        } catch (err) {
          console.error("Erro de rede:", err);
        }
      }

      console.log("Atualizando AsyncStorage com lista:", lista);
      await AsyncStorage.setItem("visitas", JSON.stringify(lista));
      setVisitas(lista);

      Alert.alert(
        "Sucesso",
        "Finalização concluída! Todas as visitas pendentes foram enviadas."
      );
    } catch (error) {
      console.error("Erro no finalizarDiario:", error);
      Alert.alert("Erro", "Não foi possível finalizar o diário.");
    }
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
