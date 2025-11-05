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
import { height, width, font } from "../../../utils/responsive.js";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getPercentualColor = (percentual) => {
  if (percentual < 10) {
    return styles.percentualVerde;
  } else if (percentual >= 10 && percentual <= 20) {
    return styles.percentualAmarelo;
  } else {
    return styles.percentualVermelho;
  }
};

const formatarTiposDeVisita = (tipos) => {
  const mapeamento = {
    r: "Residência",
    c: "Comércio",
    tb: "Terreno Baldio",
    pe: "Ponto Estratégico",
    out: "Outros",
  };

  return (
    <View style={styles.subDetalheBox}>
      <Text style={[styles.subtituloDetalhe, { marginTop: height(0) }]}>
        Tipos de Visita:
      </Text>
      {Object.entries(tipos).map(([sigla, quantidade]) => {
        const nomeCompleto = mapeamento[sigla.toLowerCase()] || sigla.toUpperCase();
        return (
          <Text key={sigla} style={styles.textDetalhe}>
            {`\u2022 ${nomeCompleto}: ${quantidade}`}
          </Text>
        );
      })}
    </View>
  );
};

const formatarDepositos = (depositos) => {
  return (
    <View style={styles.subDetalheBox}>
      <Text key="dep_titulo" style={[styles.subtituloDetalhe, { marginTop: height(1) }]}>
        Depósitos Inspecionados:
      </Text>
      {Object.entries(depositos).map(([tipo, quantidade]) => (
        <Text key={tipo} style={styles.textDetalhe}>
          {`\u2022 Tipo ${tipo.toUpperCase()}: ${quantidade}`}
        </Text>
      ))}
    </View>
  );
};

const DetalhesSemanaisCard = ({ semana }) => (
  <View style={styles.semanaisBoxDestaque}>
    <Text style={styles.subtituloSemanal}>
      Detalhes Semanais:
    </Text>
    <View style={styles.subDetalheBox}>
      <Text style={styles.textDetalhe}>
        Quarteirões Trabalhados:{" "}
        <Text style={styles.valorDetalhe}>{semana.totalQuarteiroesTrabalhados}</Text>
      </Text>
      <Text style={styles.textDetalhe}>
        Total Visitas: <Text style={styles.valorDetalhe}>{semana.totalVisitas}</Text>
      </Text>
      <Text style={styles.textDetalhe}>
        Total Focos: <Text style={styles.valorDetalhe}>{semana.totalFocos}</Text>
      </Text>
      <Text style={styles.textDetalhe}>
        Imóveis com Foco: <Text style={styles.valorDetalhe}>{semana.imoveisComFoco}</Text>
      </Text>
    </View>
    <View style={[styles.subDetalheBox,]}>
      <Text style={styles.textDetalhe}>
        Depósitos Eliminados: <Text style={styles.valorDetalhe}>{semana.totalDepEliminados}</Text>
      </Text>
      <Text style={styles.textDetalhe}>
        Imóveis Larvicida: <Text style={styles.valorDetalhe}>{semana.totalImoveisLarvicida}</Text>
      </Text>
      <Text style={styles.textDetalhe}>
        Qtd Larvicida: <Text style={styles.valorDetalhe}>{semana.totalQtdLarvicida}</Text>
      </Text>
      <Text style={styles.textDetalhe}>
        Dep Larvicida: <Text style={styles.valorDetalhe}>{semana.totalDepLarvicida}</Text>
      </Text>
    </View>
    {formatarTiposDeVisita(semana.totalVisitasTipo)}
    {formatarDepositos(semana.totalDepInspecionados)}
  </View>
);

const FIXED_BUTTON_CONTAINER_HEIGHT = height(10);


export default function ResumoCiclo({ navigation }) {
  const insets = useSafeAreaInsets();

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
  const [expandedAreaId, setExpandedAreaId] = useState(null);

  const SCROLLVIEW_BOTTOM_PADDING = FIXED_BUTTON_CONTAINER_HEIGHT + insets.bottom;


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

  const toggleArea = (idArea) => {
    setExpandedAreaId(idArea === expandedAreaId ? null : idArea);
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
          color="#05419A"
          style={styles.loadingIndicator}
        />
      </View>
    );
  }

  const hasAreas = resumoImoveis.length > 0;
  const totalPercentColor = getPercentualColor(totais.percentualNaoVisitados);

  return (
    <View style={styles.fullScreenContainer}>
      <Cabecalho navigation={navigation} />
      <ScrollView
        contentContainerStyle={[
          styles.containerWithData,
          { paddingBottom: SCROLLVIEW_BOTTOM_PADDING }
        ]}
      >
        <Text style={styles.titulo}>Resumo do Ciclo</Text>
        <View style={styles.totalCard}>
          <Text style={styles.cardTitulo}>Total Geral do Ciclo</Text>
          <Text style={styles.itemGeral}>
            <Text style={styles.itemGeralLabel}>Imóveis visitados:</Text>{" "}
            {totais.totalVisitados}
          </Text>
          <Text style={styles.itemGeral}>
            <Text style={styles.itemGeralLabel}>Imóveis não visitados:</Text>{" "}
            {totais.totalNaoVisitados}
          </Text>
          <Text style={styles.itemGeral}>
            <Text style={styles.itemGeralLabel}>Total de imóveis:</Text>{" "}
            {totais.totalGeral}
          </Text>
          <Text style={styles.itemGeral}>
            <Text style={styles.itemGeralLabel}>Porcentagem de fechados:</Text>{" "}
            <Text style={[styles.percentualDestaque, totalPercentColor]}>
              {totais.percentualNaoVisitados}%
            </Text>
          </Text>
        </View>
        {hasAreas ? (
          resumoImoveis.map((area) => {
            const totalArea = area.totalVisitados + area.totalNaoVisitados;
            const percentualArea = parseFloat(
              totalArea > 0
                ? ((area.totalNaoVisitados / totalArea) * 100).toFixed(2)
                : 0
            );
            const areaPercentColor = getPercentualColor(percentualArea);
            const semana = resumoSemana.find((s) => s.idArea === area.idArea);
            const isExpanded = expandedAreaId === area.idArea;

            return (
              <View key={area.idArea} style={styles.areaWrapper}>
                <TouchableOpacity
                  style={styles.sectionHeaderContainer}
                  onPress={() => toggleArea(area.idArea)}
                >
                  <Text style={styles.sectionTitle}>
                    {area.nomeArea.toUpperCase()}
                  </Text>
                  <Icon
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={font(3)}
                    color="#eee"
                    style={styles.arrowIcon}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.expandedContentBox}>
                    <Text style={styles.subtituloArea}>
                      Resumo de Imóveis:
                    </Text>
                    <Text style={styles.textBase}>
                      Imóveis visitados: {area.totalVisitados}
                    </Text>
                    <Text style={styles.textBase}>
                      Imóveis não visitados: {area.totalNaoVisitados}
                    </Text>
                    <Text style={styles.textBase}>
                      Total de imóveis: {totalArea}
                    </Text>
                    <Text style={styles.textBase}>
                      <Text>
                        Porcentagem de imóveis fechados:{" "}
                      </Text>
                      <Text style={areaPercentColor}>
                        {percentualArea}%
                      </Text>
                    </Text>
                    {semana && <DetalhesSemanaisCard semana={semana} />}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyMessage}>
            Nenhum resumo de área disponível.
          </Text>
        )}
      </ScrollView>
      <View
        style={[
          styles.bottomFixedButtonContainer,
          { paddingBottom: insets.bottom + height(1.5) }
        ]}
      >
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#c03f3bff", marginVertical: 0 }]}
          onPress={resetarCiclo}
          disabled={reseting || totais.totalVisitados === 0}
        >
          {reseting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBotao}>FECHAR CICLO</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  containerWithData: {
    flexGrow: 1,
    paddingHorizontal: width(2),
    paddingVertical: height(2),
  },
  loadingIndicator: { marginTop: height(10) },
  titulo: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    paddingBottom: height(2),
    alignSelf: "center",
    marginTop: height(1),
  },
  totalCard: {
    padding: height(2.5),
    backgroundColor: "#effdf8be",
    borderRadius: width(2),
    marginBottom: height(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 1,
    borderLeftWidth: width(0.5),
    borderLeftColor: "#05419A",
  },
  cardTitulo: {
    fontSize: font(3.25),
    fontWeight: "bold",
    marginBottom: height(1.5),
    color: "#05419A",
    textAlign: "center",
  },
  itemGeral: {
    fontSize: font(2.5),
    color: "#333",
    marginBottom: height(0.5),
  },
  itemGeralLabel: {
    fontWeight: "bold",
  },
  percentualDestaque: {
    fontWeight: "bold",
    fontSize: font(2.5),
  },
  percentualVerde: {
    color: "#388E3C",
  },
  percentualAmarelo: {
    color: "#FBC02D",
  },
  percentualVermelho: {
    color: "#D32F2F",
  },
  areaWrapper: {
    marginBottom: height(1),
  },
  sectionHeaderContainer: {
    backgroundColor: "#05419A",
    borderRadius: width(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width(4),
    paddingVertical: height(2),
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: font(2.5),
    color: "#eee",
    flexShrink: 1,
  },
  arrowIcon: {
    marginLeft: width(2)
  },
  expandedContentBox: {
    padding: height(2),
    backgroundColor: "#fff",
    borderBottomLeftRadius: width(2),
    borderBottomRightRadius: width(2),
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    marginBottom: height(1.5),
  },
  subtituloArea: {
    fontWeight: "700",
    fontSize: font(2.5),
    marginBottom: height(1),
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: height(0.5),
  },
  textBase: {
    fontSize: font(2.25),
    marginBottom: height(0.5),
    color: "#333",
  },
  semanaisBoxDestaque: {
    marginTop: height(1),
    padding: height(1.5),
    backgroundColor: "#f5f8ff",
    borderRadius: width(2),
    borderWidth: 1,
    borderColor: '#05419A20',
  },
  subtituloSemanal: {
    fontWeight: "bold",
    fontSize: font(2.75),
    marginBottom: height(1.5),
    color: "#05419A",
    textAlign: 'center',
  },
  subDetalheBox: {
    backgroundColor: '#fff',
    padding: height(1),
    borderRadius: width(1.5),
    marginBottom: height(0.75),
    borderLeftWidth: width(0.5),
    borderLeftColor: '#05419A',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  subtituloDetalhe: {
    fontWeight: "700",
    fontSize: font(2.5),
    color: "#05419A",
    marginBottom: height(0.5),
  },
  textDetalhe: {
    fontSize: font(2.2),
    marginBottom: height(0.3),
    color: "#444",
  },
  valorDetalhe: {
    fontWeight: 'bold',
    color: '#000',
  },
  emptyMessage: {
    fontSize: font(2.5),
    textAlign: "center",
    marginTop: height(2),
    color: "#777",
  },
  bottomFixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: width(2),
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 5,
  },
  botao: {
    padding: height(2),
    borderRadius: width(2),
    alignItems: "center",
    elevation: 2,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font(2.5),
    textTransform: "uppercase",
  },
});