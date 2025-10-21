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
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";

export default function ResumoDiario({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [resumoPorArea, setResumoPorArea] = useState([]);
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [totais, setTotais] = useState({});

  useEffect(() => {
    const buscarResumo = async () => {
      try {
        setLoading(true);
        const hoje = new Date().toISOString().split("T")[0];
        const idAgente = await getId();

        const url = `${API_URL}/resumoDiario?idAgente=${idAgente}&data=${hoje}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          Alert.alert("Aviso", data.message || "Nenhum dado encontrado.");
          setResumoPorArea([]);
          setQuarteiroes([]);
        } else {
          // 🔹 Seta os dados
          setResumoPorArea(data.resumoPorArea || []);
          setQuarteiroes(data.quarteiroesTrabalhados || []);
          setTotais({
            totalVisitas: data.totalVisitas,
            totalQuarteiroes: data.totalQuarteiroesTrabalhados,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
        Alert.alert("Erro", "Não foi possível carregar o resumo diário.");
      } finally {
        setLoading(false);
      }
    };

    buscarResumo();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumo Diário</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2CA856" />
      ) : resumoPorArea.length === 0 && quarteiroes.length === 0 ? (
        <Text>Nenhum dado disponível para hoje.</Text>
      ) : (
        <>
          {/* 🔹 Totais Gerais */}
          <View style={styles.box}>
            <Text style={styles.subtitulo}>Totais do dia:</Text>
            <Text>Total de visitas: {totais.totalVisitas || 0}</Text>
            <Text>
              Total de quarteirões finalizados: {totais.totalQuarteiroes || 0}
            </Text>
          </View>

          {/* 🔹 Quarteirões Trabalhados */}
          {quarteiroes.length > 0 && (
            <View style={styles.box}>
              <Text style={styles.subtitulo}>Quarteirões trabalhados:</Text>
              {quarteiroes.map((q) => (
                <View key={q.id} style={{ marginBottom: 5 }}>
                  <Text style={{ fontWeight: "600" }}>{q.nome}</Text>
                  <Text>Área: {q.area}</Text>
                  <Text>
                    Data:{" "}
                    {new Date(q.dataTrabalho).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* 🔹 Resumo por Área */}
          {resumoPorArea.length > 0 &&
            resumoPorArea.map((area) => (
              <View key={area.idArea} style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeader}>{area.nomeArea}</Text>

                {/* 🔹 Visitas */}
                <View style={styles.box}>
                  <Text style={styles.subtitulo}>
                    Total de visitas: {area.totalVisitas}
                  </Text>
                </View>

                {/* 🔹 Tipo de imóvel */}
                <View style={styles.box}>
                  <Text style={styles.subtitulo}>Imóveis por tipo:</Text>
                  {Object.entries(area.totalPorTipoImovel).map(
                    ([tipo, qtd]) => {
                      const tiposMap = {
                        r: "Residencial",
                        c: "Comercial",
                        tb: "Terreno Baldio",
                        out: "Outros",
                        pe: "Ponto Estratégico",
                      };
                      return (
                        <Text key={tipo}>
                          {tiposMap[tipo] || tipo}: {qtd}
                        </Text>
                      );
                    }
                  )}
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

                {/* 🔹 Depósitos eliminados */}
                <View style={styles.box}>
                  <Text>Depósitos eliminados: {area.totalDepEliminados}</Text>
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

                {/* 🔹 Amostras */}
                <View style={styles.box}>
                  <Text>Total de amostras: {area.totalAmostras}</Text>
                </View>

                {/* 🔹 Focos */}
                <View style={styles.box}>
                  <Text>Imóveis com foco: {area.totalFocos}</Text>
                </View>
              </View>
            ))}
        </>
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
    borderRadius: 6,
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
