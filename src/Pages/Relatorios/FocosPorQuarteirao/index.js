import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const PRIMARY_BLUE = "#05419A";
const ACCENT_RED = "#D32F2F";
const NEUTRAL_LIGHT = "#F5F7FA";
const TEXT_DARK = "#333333";
const TEXT_MUTED = "#777777";
const SHADOW_COLOR = "#000";

export default function FocosPorQuarteirao({ route, navigation }) {
  const { idArea, nomeArea } = route.params;
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch(
          `${API_URL}/focosPorQuarteirao?idArea=${idArea}`
        );
        const data = await response.json();

        if (!response.ok) {
          Alert.alert("Erro", data.message || "Falha ao carregar os dados");
          return;
        }

        const dadosOrdenados = data.sort((a, b) => b.totalFocos - a.totalFocos);
        setDados(dadosOrdenados);

      } catch (error) {
        Alert.alert("Erro", "Não foi possível conectar ao servidor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [idArea]);

  const gerarPDF = async () => {
    try {
      const agora = new Date().toLocaleString("pt-BR");

      const conteudoHTML = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: ${PRIMARY_BLUE}; text-align: center; margin-bottom: 5px;}
              p { font-size: 14px; text-align: center; color: ${TEXT_MUTED}; margin-bottom: 15px;}
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
              th, td {
                border: 1px solid ${PRIMARY_BLUE};
                padding: 10px;
                text-align: center;
              }
              th {
                background-color: ${PRIMARY_BLUE};
                color: white;
                font-weight: bold;
              }
              td:nth-child(2) { color: ${ACCENT_RED}; font-weight: bold; }
              td:nth-child(3) { color: ${PRIMARY_BLUE}; font-weight: bold; }
              tr:nth-child(even) { background-color: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>Relatório de Focos por Quarteirão</h1>
            <p><strong>Área:</strong> ${nomeArea} | <strong>Gerado em:</strong> ${agora}</p>

            <table>
              <tr>
                <th>Quarteirão</th>
                <th>Total Focos</th>
                <th>Imóveis com Foco</th>
              </tr>
              ${dados
          .map(
            (item) => `
                    <tr>
                      <td>${item.numero || "-"}</td>
                      <td>${item.totalFocos}</td>
                      <td>${item.imoveisComFoco}</td>
                    </tr>
                  `
          )
          .join("")}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: conteudoHTML });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao gerar o PDF");
    }
  };

  const renderItem = ({ item, index }) => {
    const isTop = index === 0;

    return (
      <View
        style={[
          styles.card,
          isTop && styles.cardTopRank,
        ]}
      >
        <View style={styles.cardHeader}>
          <Icon name="map-marker" size={font(3)} color={isTop ? ACCENT_RED : PRIMARY_BLUE} />
          <Text style={[styles.quarteiraoNome, isTop && styles.quarteiraoNomeTop]}>
            Quarteirão {item.numero || "Sem Número"}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.dataGroup}>
            <Text style={styles.label}>Total de focos:</Text>
            <Text style={[styles.focosTxt, isTop && styles.focosTxtTop]}>{item.totalFocos}</Text>
          </View>
          <View style={styles.dataGroup}>
            <Text style={styles.label}>Imóveis com foco:</Text>
            <Text style={styles.imoveisTxt}>{item.imoveisComFoco}</Text>
          </View>
        </View>
      </View>
    );
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
      <View style={styles.container}>

        <Text style={styles.title}>
          Focos por Quarteirão
          <Text style={styles.subtitle}>{`\nÁrea: ${nomeArea}`}</Text>
        </Text>

        {dados.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum foco encontrado nesta área.</Text>
        ) : (
          <>
            <TouchableOpacity style={styles.exportBtn} onPress={gerarPDF} activeOpacity={0.8}>
              <Icon name="file-pdf-o" size={font(3)} color="#fff" />
              <Text style={styles.exportTxt}> Exportar Relatório (PDF)</Text>
            </TouchableOpacity>

            <FlatList
              data={dados}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NEUTRAL_LIGHT
  },
  container: {
    flex: 1,
    paddingHorizontal: width(4),
    paddingTop: height(2),
  },

  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: NEUTRAL_LIGHT,
  },
  loadingText: {
    marginTop: font(1.5),
    color: PRIMARY_BLUE,
    fontSize: font(2.5),
  },

  title: {
    fontSize: font(4.5),
    fontWeight: "800",
    color: PRIMARY_BLUE,
    textAlign: "center",
    marginBottom: height(2),
    lineHeight: font(5.5),
  },
  subtitle: {
    fontSize: font(3),
    color: TEXT_DARK,
    fontWeight: "500",
    marginTop: height(1),
  },

  exportBtn: {
    flexDirection: "row",
    backgroundColor: PRIMARY_BLUE,
    alignSelf: "stretch",
    paddingVertical: height(1.5),
    paddingHorizontal: width(5),
    borderRadius: 10,
    marginBottom: height(2.5),
    alignItems: "center",
    justifyContent: 'center',
    elevation: 5,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exportTxt: {
    color: "#fff",
    fontSize: font(2.5),
    fontWeight: "bold",
  },

  listContainer: {
    paddingBottom: height(5),
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: height(2),
    marginBottom: height(1.5),
    flexDirection: "column",
    borderLeftWidth: 6,
    borderLeftColor: PRIMARY_BLUE,
    elevation: 4,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTopRank: {
    borderLeftColor: ACCENT_RED,
    backgroundColor: '#FFF0F0',
    elevation: 8,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height(1),
    paddingBottom: height(1),
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_LIGHT,
  },

  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: height(1),
  },

  quarteiraoNome: {
    fontSize: font(3),
    color: PRIMARY_BLUE,
    marginLeft: width(3),
    fontWeight: "700",
    flexShrink: 1,
  },
  quarteiraoNomeTop: {
    color: ACCENT_RED,
  },

  dataGroup: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: width(1),
  },
  focosTxt: {
    fontSize: font(3.8),
    fontWeight: "900",
    color: PRIMARY_BLUE,
    marginTop: height(0.5),
  },
  focosTxtTop: {
    color: ACCENT_RED,
    fontSize: font(4),
  },
  imoveisTxt: {
    fontSize: font(2.25),
    fontWeight: "600",
    color: TEXT_DARK,
    marginTop: height(0.5),
  },
  label: {
    fontSize: font(1.8),
    color: TEXT_MUTED,
    fontWeight: '400',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: font(3),
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: height(5),
    padding: height(3),
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: SHADOW_COLOR,
    shadowOpacity: 0.1,
  },
});