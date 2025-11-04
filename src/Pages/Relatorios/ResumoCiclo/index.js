import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { getId } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { width, height, font } from "../../../utils/responsive.js";
import { API_URL } from "../../../config/config.js";

export default function ResumoCicloPDF({ navigation }) {
  const [resumoImoveis, setResumoImoveis] = useState([]);
  const [totais, setTotais] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const id = await getId();
        const response = await fetch(`${API_URL}/resumoCiclo/${id}`);
        const data = await response.json();

        if (response.ok) {
          setResumoImoveis(data.resumoImoveis || []);
          setTotais({
            totalVisitados: data.totalVisitados || 0,
            totalNaoVisitados: data.totalNaoVisitados || 0,
            totalGeral: data.totalGeral || 0,
            percentualNaoVisitados: data.percentualNaoVisitados || 0,
          });
        } else {
          Alert.alert("Erro", data.message || "Falha ao carregar resumo.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível carregar o resumo do ciclo.");
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  const gerarPDF = async () => {
    try {
      let html = `
        <h1 style="text-align:center;">Resumo do Ciclo</h1>
        <h2>Totais Gerais</h2>
        <p>Visitados: ${totais.totalVisitados}</p>
        <p>Não Visitados: ${totais.totalNaoVisitados}</p>
        <p>Total: ${totais.totalGeral}</p>
        <p>% Não Visitados: ${totais.percentualNaoVisitados}%</p>
        <h2>Resumo por Área</h2>
        ${resumoImoveis
          .map((area) => {
            const totalArea = area.totalVisitados + area.totalNaoVisitados;
            const percentualArea =
              totalArea > 0
                ? ((area.totalNaoVisitados / totalArea) * 100).toFixed(2)
                : 0;
            return `
            <h3>${area.nomeArea.toUpperCase()}</h3>
            <p>Visitados: ${area.totalVisitados}</p>
            <p>Não Visitados: ${area.totalNaoVisitados}</p>
            <p>Total: ${totalArea}</p>
            <p>% Não Visitados: ${percentualArea}%</p>
          `;
          })
          .join("")}
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível gerar o PDF.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2CA856" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Resumo do Ciclo</Text>

        <TouchableOpacity style={styles.botao} onPress={gerarPDF}>
          <Text style={styles.textoBotao}>Gerar PDF</Text>
        </TouchableOpacity>

        {resumoImoveis.map((area) => (
          <View key={area.idArea} style={styles.box}>
            <Text style={styles.subtitulo}>{area.nomeArea.toUpperCase()}</Text>
            <Text style={styles.item}>Visitados: {area.totalVisitados}</Text>
            <Text style={styles.item}>
              Não Visitados: {area.totalNaoVisitados}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  botao: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  box: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  subtitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  item: {
    fontSize: 14,
    marginTop: 2,
  },
});
