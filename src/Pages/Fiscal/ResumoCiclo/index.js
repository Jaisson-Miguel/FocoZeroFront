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
import Cabecalho from "../../../Components/Cabecalho.js";

export default function ResumoCiclo({ navigation }) {
  const [resumoImoveis, setResumoImoveis] = useState([]);
  const [resumoSemana, setResumoSemana] = useState([]);
  const [totais, setTotais] = useState({
    totalVisitados: 0,
    totalNaoVisitados: 0,
    totalGeral: 0,
    percentualNaoVisitados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reseting, setReseting] = useState(false);

  // Controle de expansão por área
  const [expandido, setExpandido] = useState({});

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        const id = await getId();
        const response = await fetch(`${API_URL}/resumoCiclo/${id}`);
        const data = await response.json();

        if (response.ok) {
          setResumoImoveis(data.resumoImoveis || []);
          setResumoSemana(data.resumoSemanaisPorArea || []);
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
        console.error("Erro ao carregar resumo:", error);
        Alert.alert("Erro", "Não foi possível carregar o resumo do ciclo.");
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  const toggleExpandido = (idArea) => {
    setExpandido((prev) => ({ ...prev, [idArea]: !prev[idArea] }));
  };

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

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <Cabecalho navigation={navigation} />
        <ActivityIndicator
          size="large"
          color="#2CA856"
          style={{ marginTop: 50 }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Resumo do Ciclo</Text>

        {/* Totais Gerais */}
        <View style={styles.box}>
          <Text style={styles.subtitulo}>Totais Gerais:</Text>
          <Text style={styles.item}>Visitados: {totais.totalVisitados}</Text>
          <Text style={styles.item}>
            Não Visitados: {totais.totalNaoVisitados}
          </Text>
          <Text style={styles.item}>Total: {totais.totalGeral}</Text>
          <Text style={styles.item}>
            % Não Visitados: {totais.percentualNaoVisitados}%
          </Text>
        </View>

        {/* Resumo de imóveis por área com menu expansível */}
        {resumoImoveis.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 10 }}>
            Nenhum imóvel encontrado.
          </Text>
        ) : (
          resumoImoveis.map((area) => {
            const totalArea = area.totalVisitados + area.totalNaoVisitados;
            const percentualArea =
              totalArea > 0
                ? ((area.totalNaoVisitados / totalArea) * 100).toFixed(2)
                : 0;

            const semana = resumoSemana.find((s) => s.idArea === area.idArea);

            return (
              <View key={area.idArea} style={styles.box}>
                {/* Informações básicas de imóveis */}
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

                {/* Botão para expandir semanais */}
                {semana && (
                  <>
                    <TouchableOpacity
                      style={styles.botaoExpandir}
                      onPress={() => toggleExpandido(area.idArea)}
                    >
                      <Text style={styles.textoBotaoExpandir}>
                        {expandido[area.idArea]
                          ? "Ocultar Resumo"
                          : "Mostrar Resumo"}
                      </Text>
                    </TouchableOpacity>

                    {expandido[area.idArea] && (
                      <View style={styles.semanaisBox}>
                        <Text style={styles.item}>
                          Total Quarteirões Trabalhados:{" "}
                          {semana.totalQuarteiroesTrabalhados}
                        </Text>
                        <Text style={styles.item}>
                          Total Visitas: {semana.totalVisitas}
                        </Text>
                        <Text style={styles.item}>
                          Total Depósitos Eliminados:{" "}
                          {semana.totalDepEliminados}
                        </Text>
                        <Text style={styles.item}>
                          Imóveis com Foco: {semana.imoveisComFoco}
                        </Text>
                        <Text style={styles.item}>
                          Total Focos: {semana.totalFocos}
                        </Text>
                        <Text style={styles.item}>
                          Total Imóveis Larvicida:{" "}
                          {semana.totalImoveisLarvicida}
                        </Text>
                        <Text style={styles.item}>
                          Total Qtd Larvicida: {semana.totalQtdLarvicida}
                        </Text>
                        <Text style={styles.item}>
                          Total Dep Larvicida: {semana.totalDepLarvicida}
                        </Text>
                        <Text style={styles.item}>
                          Tipos de Visita: R:{semana.totalVisitasTipo.r} C:
                          {semana.totalVisitasTipo.c} TB:
                          {semana.totalVisitasTipo.tb} PE:
                          {semana.totalVisitasTipo.pe} OUT:
                          {semana.totalVisitasTipo.out}
                        </Text>
                        <Text style={styles.item}>
                          Depósitos Inspecionados: A1:
                          {semana.totalDepInspecionados.a1} A2:
                          {semana.totalDepInspecionados.a2} B:
                          {semana.totalDepInspecionados.b} C:
                          {semana.totalDepInspecionados.c} D1:
                          {semana.totalDepInspecionados.d1} D2:
                          {semana.totalDepInspecionados.d2} E:
                          {semana.totalDepInspecionados.e}
                        </Text>
                        <Text style={styles.item}>
                          Quarteirões Trabalhados:{" "}
                          {semana.quarteiroesTrabalhados || "-"}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })
        )}

        {/* Botões */}
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#4CAF50" }]}
          onPress={resetarCiclo}
          disabled={reseting || totais.totalVisitados === 0}
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
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoExpandir: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#888",
    borderRadius: 5,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  textoBotaoExpandir: {
    color: "#fff",
    fontWeight: "bold",
  },
  semanaisBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#c8e6c9",
    borderRadius: 5,
  },
});
