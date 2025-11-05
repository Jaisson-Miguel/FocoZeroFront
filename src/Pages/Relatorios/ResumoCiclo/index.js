import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getId } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { width, height, font } from "../../../utils/responsive.js";
import { API_URL } from "../../../config/config.js";

const PRIMARY_BLUE = "#05419A";
const ACCENT_GREEN = "#2CA856";
const VISITADO_GREEN = "#4CAF50";
const NAO_VISITADO_RED = "#D32F2F";
const BG_LIGHT_BLUE = "#E6EFFF";
const BG_CRITICAL = "#FFEBEB";

const screenWidth = Dimensions.get('window').width;
const fontFallback = (size) => size * (screenWidth / 360);

const DEFAULT_BOTTOM_MARGIN = 20;

export default function ResumoCicloPDF({ navigation }) {
  const insets = useSafeAreaInsets();
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
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: ${PRIMARY_BLUE}; text-align: center; margin-bottom: 20px; }
            h2 { color: #333; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 25px; }
            h3 { color: ${PRIMARY_BLUE}; margin-top: 15px; font-size: 1.2em; font-weight: bold; }
            .total-box { background-color: ${BG_LIGHT_BLUE}; border: 1px solid ${PRIMARY_BLUE}; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .area-box { border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); }
            p { margin: 5px 0; }
            .visited { color: ${VISITADO_GREEN}; font-weight: bold; }
            .not-visited { color: ${NAO_VISITADO_RED}; font-weight: bold; }
            .total-area { border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Relatório de Resumo do Ciclo</h1>

          <div class="total-box">
            <h2>Totais Gerais</h2>
            <p><strong>Total de Imóveis:</strong> ${totais.totalGeral}</p>
            <p><strong>Visitados:</strong> <span class="visited">${totais.totalVisitados}</span></p>
            <p><strong>Não Visitados:</strong> <span class="not-visited">${totais.totalNaoVisitados}</span></p>
            <p><strong>% Não Visitados:</strong> <span class="not-visited">${totais.percentualNaoVisitados}%</span></p>
          </div>

          <h2>Resumo por Área</h2>
          ${resumoImoveis
          .map((area) => {
            const totalArea = area.totalVisitados + area.totalNaoVisitados;
            const percentualArea =
              totalArea > 0
                ? ((area.totalNaoVisitados / totalArea) * 100).toFixed(2)
                : 0;
            return `
                <div class="area-box">
                  <h3>${area.nomeArea.toUpperCase()}</h3>
                  <p>Visitados: <span class="visited">${area.totalVisitados}</span></p>
                  <p>Não Visitados: <span class="not-visited">${area.totalNaoVisitados}</span></p>
                  <p class="total-area">Total na Área: ${totalArea}</p>
                  <p>% Não Visitados: <span class="not-visited">${percentualArea}%</span></p>
                </div>
              `;
          })
          .join("")}
        </body>
        </html>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  const TotalSummary = (
    <View style={styles.totalSummaryContainer}>
      <Text style={styles.totalSummaryTitle}>Totais Gerais</Text>

      <View style={styles.totalRow}>
        <View style={styles.totalPill}>
          <Text style={styles.pillLabel}>Visitados</Text>
          <Text style={[styles.pillValue, { color: VISITADO_GREEN }]}>{totais.totalVisitados}</Text>
        </View>
        <View style={[styles.totalPill, styles.pillNegative]}>
          <Text style={styles.pillLabel}>Não Visitados</Text>
          <Text style={[styles.pillValue, { color: NAO_VISITADO_RED }]}>{totais.totalNaoVisitados}</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Total Geral de Imóveis</Text>
        <Text style={styles.metricValue}>{totais.totalGeral}</Text>
      </View>

      <View style={[styles.metricCard, styles.metricCardHighlight]}>
        <Text style={styles.metricLabelHighlight}>Porcentagem de fechados</Text>
        <Text style={styles.metricValueHighlight}>{totais.percentualNaoVisitados}%</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: (height ? height(5) : DEFAULT_BOTTOM_MARGIN) + insets.bottom }
        ]}
      >
        <Text style={styles.titulo}>Resumo do Ciclo</Text>

        {TotalSummary}

        <TouchableOpacity
          style={styles.botao}
          onPress={gerarPDF}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotao}>Gerar e Compartilhar PDF</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Resumo por Área</Text>

        {resumoImoveis.map((area, index) => {
          const totalArea = area.totalVisitados + area.totalNaoVisitados;
          const percentualArea = totalArea > 0
            ? ((area.totalNaoVisitados / totalArea) * 100).toFixed(2)
            : 0;

          return (
            <View
              key={area.idArea || index}
              style={styles.box}
            >
              <Text style={styles.subtitulo}>{area.nomeArea.toUpperCase()}</Text>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Visitados:</Text>
                <Text style={styles.dataValueGreen}>{area.totalVisitados}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Não Visitados:</Text>
                <Text style={styles.dataValueRed}>{area.totalNaoVisitados}</Text>
              </View>
              <View style={[styles.dataRow, styles.dataRowTotal]}>
                <Text style={styles.dataLabelTotal}>Total na Área:</Text>
                <Text style={styles.dataValueTotal}>{totalArea}</Text>
              </View>
              <View style={[styles.dataRow, { marginTop: height ? height(1) : 5 }]}>
                <Text style={styles.dataLabel}>Porcentagem de fechados:</Text>
                <Text style={styles.dataValueRed}>{percentualArea}%</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    marginTop: height(10),
    fontSize: font ? font(3) : fontFallback(18),
    color: PRIMARY_BLUE,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  container: {
    padding: width ? width(5) : 20,
  },
  titulo: {
    fontSize: font ? font(4) : fontFallback(24),
    fontWeight: "900",
    color: PRIMARY_BLUE,
    textAlign: "center",
    marginBottom: height ? height(3) : 15,
  },
  botao: {
    backgroundColor: ACCENT_GREEN,
    padding: height ? height(2) : 12,
    borderRadius: width ? width(3) : 8,
    alignItems: "center",
    marginBottom: height ? height(4) : 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6.27,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font ? font(2.25) : fontFallback(16),
    textTransform: 'uppercase',
  },
  totalSummaryContainer: {
    backgroundColor: BG_LIGHT_BLUE,
    padding: width ? width(4) : 16,
    borderRadius: width ? width(3) : 8,
    marginBottom: height ? height(3) : 15,
    borderWidth: 1,
    borderColor: PRIMARY_BLUE,
    alignSelf: 'stretch',
  },
  totalSummaryTitle: {
    fontSize: font ? font(3.5) : fontFallback(18),
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
    marginBottom: height ? height(2) : 10,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height ? height(2) : 10,
  },
  totalPill: {
    backgroundColor: '#fff',
    padding: width ? width(3) : 12,
    borderRadius: width ? width(2) : 6,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
  },
  pillNegative: {
    backgroundColor: '#FFF3E0',
  },
  pillLabel: {
    fontSize: font ? font(2.25) : fontFallback(14),
    color: '#666',
  },
  pillValue: {
    fontSize: font ? font(3) : fontFallback(22),
    fontWeight: '900',
    marginTop: height ? height(0.5) : 3,
  },
  metricCard: {
    backgroundColor: '#fff',
    padding: width ? width(3) : 12,
    borderRadius: width ? width(2) : 6,
    marginBottom: height ? height(1) : 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1.5,
    borderLeftColor: PRIMARY_BLUE,
  },
  metricCardHighlight: {
    backgroundColor: BG_CRITICAL,
    borderLeftColor: NAO_VISITADO_RED,
  },
  metricLabel: {
    fontSize: font ? font(2.25) : fontFallback(14),
    color: '#444',
    flex: 1,
  },
  metricValue: {
    fontSize: font ? font(2.5) : fontFallback(18),
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
  },
  metricLabelHighlight: {
    fontSize: font ? font(2.25) : fontFallback(15),
    fontWeight: 'bold',
    color: NAO_VISITADO_RED,
    flex: 1,
  },
  metricValueHighlight: {
    fontSize: font ? font(2.5) : fontFallback(20),
    fontWeight: '900',
    color: NAO_VISITADO_RED,
  },
  sectionTitle: {
    fontSize: font ? font(3.5) : fontFallback(18),
    fontWeight: "bold",
    color: "#333",
    marginBottom: height ? height(2) : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: height ? height(1) : 5,
  },
  box: {
    backgroundColor: "#fff",
    padding: width ? width(4) : 16,
    borderRadius: width ? width(3) : 8,
    marginBottom: height ? height(2.5) : 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderTopWidth: 2,
    borderTopColor: PRIMARY_BLUE,
  },
  subtitulo: {
    fontWeight: "800",
    fontSize: font ? font(3) : fontFallback(16),
    marginBottom: height ? height(1.5) : 8,
    color: PRIMARY_BLUE,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: height ? height(0.5) : 3,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: height ? height(0.5) : 3,
  },
  dataLabel: {
    fontSize: font ? font(2.5) : fontFallback(15),
    color: '#444',
  },
  dataValueGreen: {
    fontSize: font ? font(2.5) : fontFallback(15),
    fontWeight: '700',
    color: VISITADO_GREEN,
  },
  dataValueRed: {
    fontSize: font ? font(2.5) : fontFallback(15),
    fontWeight: '700',
    color: NAO_VISITADO_RED,
  },
  dataRowTotal: {
    marginTop: height ? height(1) : 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: height ? height(1) : 5,
  },
  dataLabelTotal: {
    fontSize: font ? font(2.5) : fontFallback(16),
    fontWeight: 'bold',
    color: '#333',
  },
  dataValueTotal: {
    fontSize: font ? font(2.5) : fontFallback(16),
    fontWeight: 'bold',
    color: '#333',
  },
});