import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 1. Importar useSafeAreaInsets

// Estas imports DEVERÃO ser resolvidas no seu ambiente mobile
import Cabecalho from "../../../Components/Cabecalho.js";
import { width, height, font } from "../../../utils/responsive.js";
import { API_URL } from "../../../config/config.js";

// Definições de cores e constantes (Mobile Friendly)
const PRIMARY_BLUE = "#05419A";
const SECONDARY_ORANGE = "#D38B17";
const ACCENT_GREEN = "#2CA856";
const BG_LIGHT_BLUE = "#E6EFFF";
const BG_WHITE = "#FFFFFF";
const CRITICAL_RED = "#B90707"; // Cor usada para os valores em foco (dataValueTotal/Imoveis)

// Fallback para dimensões se o utils/responsive.js não for resolvido
const screenWidth = Dimensions.get("window").width;
const responsiveWidth = (percent) => (screenWidth * percent) / 100;
const responsiveFont = (size) => size * (screenWidth / 360);

// Constante para a margem padrão inferior
const DEFAULT_BOTTOM_PADDING = 30;

export default function FocosPorArea({ navigation }) {
  const insets = useSafeAreaInsets(); // 2. Obter insets
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenarPor, setOrdenarPor] = useState("imoveis"); // padrão

  // LOGICA ORIGINAL MANTIDA
  useEffect(() => {
    const fetchFocosPorArea = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/FocosPorArea?ordenarPor=${ordenarPor}`
        );
        const data = await response.json();

        if (response.ok) {
          setAreas(data);
        } else {
          Alert.alert("Erro", data.message || "Falha ao carregar áreas");
        }
      } catch (error) {
        console.error("Erro ao carregar áreas:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados");
      } finally {
        setLoading(false);
      }
    };

    fetchFocosPorArea();
  }, [ordenarPor]);

  // LOGICA ORIGINAL MANTIDA
  const gerarPDF = async () => {
    try {
      // HTML aprimorado para o PDF
      let html = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: ${PRIMARY_BLUE}; text-align: center; margin-bottom: 20px; }
            p { text-align:center; margin: 10px 0; font-size: 1.1em; }
            table { width:100%; border-collapse:collapse; margin-top: 20px; }
            th, td { padding: 12px; border: 1px solid #ddd; text-align: center; }
            thead tr { background-color: ${PRIMARY_BLUE}; color: white; }
            tbody tr:nth-child(even) { background-color: #f2f2f2; }
            .total-focos { font-weight: bold; color: ${CRITICAL_RED}; }
            .imoveis-foco { font-weight: bold; color: ${CRITICAL_RED}; }
          </style>
        </head>
        <body>
          <h1>Relatório de Focos por Área</h1>
          <p>Ordenado por: <b>${
        ordenarPor === "imoveis" ? "Imóveis com Foco" : "Total de Focos"
      }</b></p>
          <table>
            <thead>
              <tr>
                <th>Área</th>
                <th>Total de Focos</th>
                <th>Imóveis com Foco</th>
              </tr>
            </thead>
            <tbody>
              ${areas
        .map(
          (area) => `
                <tr>
                  <td style="text-align:left;">${area.nomeArea}</td>
                  <td class="total-focos">${area.totalFocos}</td>
                  <td class="imoveis-foco">${area.imoveisComFoco}</td>
                </tr>`
        )
        .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o relatório em PDF.");
    }
  };

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <Cabecalho navigation={navigation} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
          <Text style={styles.loadingText}>Carregando focos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          // 3. Adicionar o insets.bottom ao padding inferior
          {
            paddingBottom:
              (height ? height(5) : DEFAULT_BOTTOM_PADDING) + insets.bottom,
          },
        ]}
      >
        <Text style={styles.titulo}>Focos por Área</Text>

        {/* Botão de PDF */}
        <TouchableOpacity
          style={styles.botao}
          onPress={gerarPDF}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBotao}>Gerar e Compartilhar PDF</Text>
        </TouchableOpacity>

        {/* Seletor de ordenação */}
        <View style={styles.seletorContainer}>
          <Text style={styles.seletorLabel}>Ordenar por:</Text>

          <View style={styles.seletorOptions}>
            <TouchableOpacity
              style={[
                styles.seletorButton,
                ordenarPor === "imoveis" && styles.seletorButtonAtivo,
              ]}
              onPress={() => setOrdenarPor("imoveis")}
            >
              <Text
                style={[
                  styles.seletorText,
                  ordenarPor === "imoveis" && styles.seletorTextAtivo,
                ]}
              >
                Imóveis (Foco)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.seletorButton,
                ordenarPor === "foco" && styles.seletorButtonAtivo,
              ]}
              onPress={() => setOrdenarPor("foco")}
            >
              <Text
                style={[
                  styles.seletorText,
                  ordenarPor === "foco" && styles.seletorTextAtivo,
                ]}
              >
                Total Focos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de áreas */}
        <View style={styles.listSection}>
          {areas.length === 0 ? (
            <Text style={styles.empty}>
              Nenhuma área com focos encontrada no ciclo.
            </Text>
          ) : (
            areas.map((area, index) => (
              <View
                key={area.idArea}
                style={[
                  styles.card,
                  // Destaca o primeiro item
                  index === 0 && styles.cardHighlight,
                ]}
              >
                {/* Nome da Área */}
                <View style={styles.cardHeader}>
                  <Text style={styles.areaNome}>
                    {area.nomeArea.toUpperCase()}
                  </Text>
                  {index === 0 && <Text style={styles.rankBadge}>#1</Text>}
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Total de Focos:</Text>
                  {/* Destaque para o valor */}
                  <Text style={styles.dataValueTotal}>{area.totalFocos}</Text>
                </View>
                <View style={[styles.dataRow, styles.dataRowDivider]}>
                  <Text style={styles.dataLabel}>Imóveis com Foco:</Text>
                  {/* Destaque para o valor */}
                  <Text style={styles.dataValueImoveis}>
                    {area.imoveisComFoco}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Layout Base (Corrigido o erro do cabeçalho) ---
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    padding: width ? width(5) : responsiveWidth(5),
    // O paddingBottom foi removido daqui e aplicado dinamicamente no componente,
    // mas mantive a linha comentada para referência:
    // paddingBottom: height ? height(5) : 30
  },

  // --- Loading State (Corrigido para centralizar o conteúdo, mantendo o cabeçalho no topo) ---
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContent: {
    flex: 1, // Permite que o conteúdo de loading ocupe o espaço restante
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    color: PRIMARY_BLUE,
    fontSize: font ? font(2.8) : responsiveFont(15),
  },

  // --- Título Principal ---
  titulo: {
    fontSize: font ? font(4) : responsiveFont(22),
    fontWeight: "800",
    marginBottom: height ? height(2) : 15,
    textAlign: "center",
    color: PRIMARY_BLUE,
  },

  // --- Botão de PDF ---
  botao: {
    backgroundColor: ACCENT_GREEN,
    padding: 15,
    borderRadius: width ? width(3) : 8,
    alignItems: "center",
    marginVertical: height ? height(2) : 10,
    elevation: 8,
    shadowColor: ACCENT_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  textoBotao: {
    color: BG_WHITE,
    fontWeight: "bold",
    fontSize: font ? font(2.25) : responsiveFont(16),
    textTransform: "uppercase",
  },

  // --- Seletor de Ordenação ---
  seletorContainer: {
    marginBottom: height ? height(1) : 15,
    backgroundColor: BG_LIGHT_BLUE,
    padding: width ? width(4) : 16,
    borderRadius: width ? width(3) : 8,
  },
  seletorLabel: {
    fontSize: font ? font(2.5) : responsiveFont(15),
    fontWeight: "600",
    color: PRIMARY_BLUE,
    marginBottom: height ? height(1) : 5,
  },
  seletorOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seletorButton: {
    flex: 1,
    paddingVertical: height ? height(1.5) : 10,
    marginHorizontal: width ? width(0.5) : 4,
    borderRadius: width ? width(2) : 6,
    borderWidth: 1,
    borderColor: PRIMARY_BLUE,
    alignItems: "center",
    backgroundColor: BG_WHITE,
  },
  seletorButtonAtivo: {
    backgroundColor: PRIMARY_BLUE,
  },
  seletorText: {
    color: PRIMARY_BLUE,
    fontWeight: "bold",
    fontSize: font ? font(2.25) : responsiveFont(14),
  },
  seletorTextAtivo: {
    color: BG_WHITE,
  },

  // --- Lista de Cards ---
  listSection: {
    marginTop: height ? height(1) : 10,
  },
  card: {
    padding: height(2),
    backgroundColor: BG_WHITE,
    borderRadius: width ? width(3) : 8,
    marginBottom: height ? height(1) : 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    borderLeftWidth: 2,
    borderLeftColor: SECONDARY_ORANGE,
  },
  cardHighlight: {
    borderLeftColor: PRIMARY_BLUE,
    backgroundColor: BG_LIGHT_BLUE,
    elevation: 10,
    shadowOpacity: 0.3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height ? height(1) : 8,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_BLUE,
    paddingBottom: height(3),
  },
  areaNome: {
    fontWeight: "900",
    fontSize: font ? font(3) : responsiveFont(18),
    color: PRIMARY_BLUE,
  },
  rankBadge: {
    backgroundColor: CRITICAL_RED, // Usando a cor CRITICAL_RED para o destaque
    color: BG_WHITE,
    fontWeight: "bold",
    paddingHorizontal: width(3),
    paddingVertical: height(0.5),
    borderRadius: 4,
    fontSize: font ? font(2.2) : responsiveFont(12),
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: height(0.5),
  },
  dataRowDivider: {
    borderTopWidth: 1,
    borderTopColor: "#dbe4e7ff",
    marginTop: height(0.5),
    paddingTop: height(1),
  },
  dataLabel: {
    fontSize: font ? font(2.5) : responsiveFont(15),
    color: "#444",
  },
  dataValueTotal: {
    fontSize: font ? font(2.5) : responsiveFont(16),
    fontWeight: "bold",
    color: CRITICAL_RED, // Valor em foco em destaque
  },
  dataValueImoveis: {
    fontSize: font ? font(2.5) : responsiveFont(16),
    fontWeight: "bold",
    color: CRITICAL_RED, // Valor em foco em destaque
  },
  empty: {
    fontSize: font ? font(2.5) : responsiveFont(15),
    color: "gray",
    textAlign: "center",
    marginTop: height ? height(5) : 20,
    backgroundColor: "#fff",
    padding: height(5),
    borderRadius: 8,
  },
});
