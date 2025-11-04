import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";

export default function ResumoCiclo({ navigation }) {
  const [resumo, setResumo] = useState([]);
  const [totalVisitados, setTotalVisitados] = useState(0);
  const [totalNaoVisitados, setTotalNaoVisitados] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);
  const [percentualNaoVisitados, setPercentualNaoVisitados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const id = await getId();
        const response = await fetch(`${API_URL}/resumoCiclo/${id}`);
        const data = await response.json();

        if (response.ok) {
          setResumo(data.resumo || []);
          setTotalVisitados(data.totalVisitados || 0);
          setTotalNaoVisitados(data.totalNaoVisitados || 0);
          setTotalGeral(data.totalGeral || 0);
          setPercentualNaoVisitados(data.percentualNaoVisitados || 0);
        } else {
          Alert.alert("Erro", data.message || "Falha ao carregar resumo.");
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

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Resumo do Ciclo</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2CA856"
            style={{ marginTop: 20 }}
          />
        ) : (
          <>
            <View style={styles.box}>
              <Text style={styles.subtitulo}>Totais Gerais:</Text>
              <Text style={styles.item}>Visitados: {totalVisitados}</Text>
              <Text style={styles.item}>
                Não Visitados: {totalNaoVisitados}
              </Text>
              <Text style={styles.item}>Total: {totalGeral}</Text>
              <Text style={styles.item}>
                % Não Visitados: {percentualNaoVisitados}%
              </Text>
            </View>

            {resumo.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Nenhum imóvel encontrado.
              </Text>
            ) : (
              resumo.map((area) => {
                const totalArea = area.totalVisitados + area.totalNaoVisitados;
                const percentualArea =
                  totalArea > 0
                    ? ((area.totalNaoVisitados / totalArea) * 100).toFixed(2)
                    : 0;

                return (
                  <View key={area.idArea} style={styles.box}>
                    <Text style={styles.subtitulo}>
                      {area.nomeArea.toUpperCase()}
                    </Text>
                    <Text style={styles.item}>
                      Visitados: {area.totalVisitados}
                    </Text>
                    <Text style={styles.item}>
                      Não Visitados: {area.totalNaoVisitados}
                    </Text>
                    <Text style={styles.item}>Total: {totalArea}</Text>
                    <Text style={styles.item}>
                      % Não Visitados: {percentualArea}%
                    </Text>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
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
    marginBottom: 15,
  },
  subtitulo: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 5,
  },
  item: {
    fontSize: 15,
    marginTop: 2,
  },
});
