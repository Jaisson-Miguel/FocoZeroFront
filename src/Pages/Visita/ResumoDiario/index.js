import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";

export default function ResumoDiario({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [resumoPorArea, setResumoPorArea] = useState([]);
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [totais, setTotais] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [semana, setSemana] = useState("");
  const [atividade, setAtividade] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState(null);

  // 🔹 Busca o resumo diário ao montar a tela
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

  // 🔹 Envia fechamento do diário para o backend
  const handleFecharDiario = async (idArea, atividade) => {
    try {
      const idAgente = await getId();
      const hoje = new Date().toISOString().split("T")[0];

      const areaSelecionadaObj = resumoPorArea.find(
        (area) => area.idArea === idArea
      );

      if (!areaSelecionadaObj) {
        Alert.alert("Erro", "Resumo da área não encontrado.");
        return;
      }

      const resumoParaEnvio = {
        totalVisitas: areaSelecionadaObj.totalVisitas,
        totalVisitasTipo: areaSelecionadaObj.totalPorTipoImovel,
        totalDepInspecionados: areaSelecionadaObj.totalDepositosInspecionados,
        totalDepEliminados: areaSelecionadaObj.totalDepEliminados,
        totalImoveisLarvicida: areaSelecionadaObj.totalImoveisLarvicida,
        totalQtdLarvicida: areaSelecionadaObj.totalLarvicidaAplicada,
        totalDepLarvicida: areaSelecionadaObj.depositosTratadosComLarvicida,
        imoveisComFoco: areaSelecionadaObj.totalFocos,
        quarteiroes: areaSelecionadaObj.quarteiroes || [], // adiciona os números
        totalQuarteiroes: areaSelecionadaObj.totalQuarteiroes || 0,
      };

      const res = await fetch(`${API_URL}/cadastrarDiario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idAgente,
          idArea,
          data: hoje,
          atividade: atividade || 4,
          resumo: resumoParaEnvio,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Sucesso", "Diário da área cadastrado!");
      } else {
        Alert.alert("Erro", data.message || "Falha ao cadastrar diário.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível cadastrar o diário.");
    }
  };

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

          {/* 🔹 Resumo por Área */}
          {resumoPorArea.map((area) => (
            <View key={area.idArea} style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>{area.nomeArea}</Text>

              <View style={styles.box}>
                <Text style={styles.subtitulo}>
                  Total de visitas: {area.totalVisitas}
                </Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.subtitulo}>Imóveis por tipo:</Text>
                {Object.entries(area.totalPorTipoImovel).map(([tipo, qtd]) => {
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
                })}
              </View>

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

              <View style={styles.box}>
                <Text>Depósitos eliminados: {area.totalDepEliminados}</Text>
              </View>

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

              <View style={styles.box}>
                <Text>Total de amostras: {area.totalAmostras}</Text>
              </View>

              <View style={styles.box}>
                <Text>Imóveis com foco: {area.totalFocos}</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.subtitulo}>Quarteirões finalizados:</Text>
                <Text>
                  {(area.quarteiroes || []).length > 0
                    ? (area.quarteiroes || []).join(", ")
                    : "Nenhum finalizado"}
                </Text>
                <Text>Total de quarteirões: {area.totalQuarteiroes || 0}</Text>
              </View>

              {/* 🔹 Botão Fechar Diário */}
              <TouchableOpacity
                style={styles.botaoFechar}
                onPress={() => {
                  setAreaSelecionada(area.idArea);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.textoBotao}>Fechar Diário</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* 🔹 Modal para preencher semana e atividade */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Fechar Diário</Text>

            <TextInput
              style={styles.input}
              placeholder="Semana"
              keyboardType="numeric"
              value={semana}
              onChangeText={setSemana}
            />
            <TextInput
              style={styles.input}
              placeholder="Atividade (1 a 6)"
              keyboardType="numeric"
              value={atividade}
              onChangeText={setAtividade}
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: "#4CAF50" }]}
                onPress={() => {
                  handleFecharDiario(areaSelecionada, Number(atividade));
                  setModalVisible(false);
                }}
              >
                <Text style={styles.textoBotao}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: "#f44336" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textoBotao}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// 🔹 Estilos
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  box: {
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 15,
  },
  subtitulo: { fontWeight: "600", marginBottom: 5 },
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 6,
  },
  botaoFechar: {
    backgroundColor: "#2CA856",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotao: { color: "#fff", fontWeight: "bold" },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitulo: { fontWeight: "bold", fontSize: 18, marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalBotao: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
