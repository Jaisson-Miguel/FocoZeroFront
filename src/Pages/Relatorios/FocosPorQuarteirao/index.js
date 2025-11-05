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

        setDados(data);
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
              body { font-family: Arial; padding: 20px; }
              h1 { color: #05419A; text-align: center; }
              p { font-size: 14px; text-align: center; color: #555; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td {
                border: 1px solid #05419A;
                padding: 8px;
                text-align: center;
              }
              th {
                background-color: #05419A;
                color: white;
              }
            </style>
          </head>
          <body>
            <h1>Relatório de Focos por Quarteirão</h1>
            <p><strong>Área:</strong> ${nomeArea}</p>
            <p><strong>Gerado em:</strong> ${agora}</p>

            <table>
              <tr>
                <th>Quarteirão</th>
                <th>Focos</th>
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Icon name="map-marker" size={font(3)} color="#05419A" />
        <Text style={styles.quarteiraoNome}>
          Quarteirão {item.numero || "-"}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.focosTxt}>{item.totalFocos}</Text>
        <Text style={styles.label}>Focos</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05419A" />
        <Text style={{ marginTop: font(1.5) }}>Carregando focos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />
      <View style={styles.container}>
        <Text style={styles.title}>
          Focos por Quarteirão {"\n"}
          <Text style={styles.subtitle}>{nomeArea}</Text>
        </Text>

        {dados.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum foco encontrado</Text>
        ) : (
          <>
            <TouchableOpacity style={styles.exportBtn} onPress={gerarPDF}>
              <Icon name="file-pdf-o" size={font(3)} color="#fff" />
              <Text style={styles.exportTxt}> Exportar PDF</Text>
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
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff", padding: width(4) },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textAlign: "center",
    marginBottom: height(2),
  },
  subtitle: {
    fontSize: font(2.5),
    color: "#333",
    fontWeight: "normal",
  },
  exportBtn: {
    flexDirection: "row",
    backgroundColor: "#05419A",
    alignSelf: "center",
    paddingVertical: height(1),
    paddingHorizontal: width(5),
    borderRadius: 8,
    marginBottom: height(2),
    alignItems: "center",
  },
  exportTxt: {
    color: "#fff",
    fontSize: font(2.5),
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: height(3),
  },
  card: {
    backgroundColor: "#ECECEC",
    borderRadius: 8,
    padding: height(1.5),
    marginBottom: height(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: "#05419A",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  quarteiraoNome: {
    fontSize: font(2.8),
    color: "#05419A",
    marginLeft: width(2),
    fontWeight: "600",
  },
  cardRight: {
    alignItems: "center",
  },
  focosTxt: {
    fontSize: font(3.5),
    fontWeight: "bold",
    color: "#05419A",
  },
  label: {
    fontSize: font(2),
    color: "#555",
  },
  emptyText: {
    fontSize: font(2.5),
    color: "#777",
    textAlign: "center",
    marginTop: height(5),
  },
});
