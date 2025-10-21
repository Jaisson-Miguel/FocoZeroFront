import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";

export default function ResumoDiario({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [loadingDados, setLoadingDados] = useState(true);
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [resumoPorArea, setResumoPorArea] = useState([]);

  // 🔹 Carrega dados offline (quarteirões e imóveis)
  useEffect(() => {
    const carregarDadosOffline = async () => {
      try {
        const rawQ = await AsyncStorage.getItem("dadosQuarteiroes");
        const rawI = await AsyncStorage.getItem("dadosImoveis");
        setQuarteiroes(rawQ ? JSON.parse(rawQ) : []);
        setImoveis(rawI ? JSON.parse(rawI) : []);
      } catch (err) {
        console.error("Erro ao carregar dados offline:", err);
      } finally {
        setLoadingDados(false);
      }
    };
    carregarDadosOffline();
  }, []);

  // 🔹 Busca visitas da data atual
  useEffect(() => {
    const buscarVisitas = async () => {
      try {
        const hoje = new Date().toISOString().split("T")[0];
        const url = `${API_URL}/visitasPorData?data=${hoje}`;
        const res = await fetch(url);
        const data = await res.json();
        setVisitas(data.visitas || []);
      } catch (err) {
        console.error("Erro ao buscar visitas:", err);
        Alert.alert("Erro", "Não foi possível carregar visitas.");
      } finally {
        setLoading(false);
      }
    };

    buscarVisitas();
  }, []);

  // 🔹 Calcula resumo diário por área
  useEffect(() => {
    if (!loading && !loadingDados) {
      const areasMap = {};

      quarteiroes.forEach((q) => {
        const areaId = q.idArea || "semArea";
        if (!areasMap[areaId]) {
          areasMap[areaId] = {
            nomeArea: q.nomeArea || "Sem Área",
            totalPorTipoImovel: {},
            totalDepositosInspecionados: {},
            totalFocos: 0,
            totalImoveisLarvicida: 0,
            totalLarvicidaAplicada: 0,
            depositosTratadosComLarvicida: 0,
          };
        }

        // Imóveis do quarteirão
        const imoveisQ = imoveis.filter((i) => i.idQuarteirao === q._id);

        imoveisQ.forEach((i) => {
          // Procura a visita correspondente
          const visita = visitas.find(
            (v) =>
              v.idImovel &&
              ((typeof v.idImovel === "object" && v.idImovel._id === i._id) ||
                v.idImovel === i._id)
          );
          if (!visita) return;

          // Total por tipo de imóvel
          if (visita.tipo) {
            areasMap[areaId].totalPorTipoImovel[visita.tipo] =
              (areasMap[areaId].totalPorTipoImovel[visita.tipo] || 0) + 1;
          }

          // Depósitos inspecionados
          const depositos = visita.depositosInspecionados || {};
          Object.entries(depositos).forEach(([key, value]) => {
            areasMap[areaId].totalDepositosInspecionados[key] =
              (areasMap[areaId].totalDepositosInspecionados[key] || 0) +
              (value || 0);
          });

          // Focos
          if (visita.foco) areasMap[areaId].totalFocos += 1;

          // Larvicida
          if (visita.qtdLarvicida && visita.qtdLarvicida > 0)
            areasMap[areaId].totalImoveisLarvicida += 1;
          areasMap[areaId].totalLarvicidaAplicada += visita.qtdLarvicida || 0;
          areasMap[areaId].depositosTratadosComLarvicida +=
            visita.qtdDepTratado || 0;
        });
      });

      setResumoPorArea(Object.values(areasMap));
    }
  }, [loading, loadingDados, quarteiroes, imoveis, visitas]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumo Diário por Área</Text>

      {loading || loadingDados ? (
        <ActivityIndicator size="large" color="#2CA856" />
      ) : resumoPorArea.length === 0 ? (
        <Text>Nenhum dado disponível para hoje.</Text>
      ) : (
        resumoPorArea.map((area) => (
          <View key={area.nomeArea} style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeader}>{area.nomeArea}</Text>

            {/* 🔹 Tipo de imóvel */}
            <View style={styles.box}>
              <Text style={styles.subtitulo}>Total de imóveis por tipo:</Text>
              {Object.entries(area.totalPorTipoImovel).map(([tipo, qtd]) => (
                <Text key={tipo}>
                  {tipo.toUpperCase()}: {qtd}
                </Text>
              ))}
            </View>

            {/* 🔹 Depósitos inspecionados */}
            <View style={styles.box}>
              <Text style={styles.subtitulo}>Depósitos inspecionados:</Text>
              {Object.entries(area.totalDepositosInspecionados).map(
                ([tipo, qtd]) => (
                  <Text key={tipo}>
                    {tipo.toUpperCase()}: {qtd}
                  </Text>
                )
              )}
            </View>

            {/* 🔹 Imóveis com foco */}
            <View style={styles.box}>
              <Text>Imóveis com foco: {area.totalFocos}</Text>
            </View>

            {/* 🔹 Larvicida */}
            <View style={styles.box}>
              <Text>
                Imóveis tratados com larvicida: {area.totalImoveisLarvicida}
              </Text>
              <Text>
                Total de larvicida aplicada: {area.totalLarvicidaAplicada}
              </Text>
              <Text>
                Depósitos tratados com larvicida:{" "}
                {area.depositosTratadosComLarvicida}
              </Text>
            </View>
          </View>
        ))
      )}

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
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: "#eee",
    padding: 8,
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
