import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Cabecalho from "../../../Components/Cabecalho.js";
import { width, height, font } from "../../../utils/responsive.js";
import { API_URL } from "../../../config/config.js";

export default function FocosPorArea({ navigation }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenarPor, setOrdenarPor] = useState("imoveis"); // padrão

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

  const gerarPDF = async () => {
    try {
      let html = `
        <h1 style="text-align:center;">Relatório de Focos por Área</h1>
        <p style="text-align:center;">Ordenado por: <b>${
          ordenarPor === "imoveis" ? "Imóveis com Foco" : "Total de Focos"
        }</b></p>
        <hr />
        <table style="width:100%; border-collapse:collapse;" border="1">
          <thead>
            <tr style="background-color:#05419A; color:white;">
              <th style="padding:8px;">Área</th>
              <th style="padding:8px;">Total de Focos</th>
              <th style="padding:8px;">Imóveis com Foco</th>
            </tr>
          </thead>
          <tbody>
            ${areas
              .map(
                (area) => `
              <tr>
                <td style="padding:8px;">${area.nomeArea}</td>
                <td style="padding:8px; text-align:center;">${area.totalFocos}</td>
                <td style="padding:8px; text-align:center;">${area.imoveisComFoco}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
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
      <View style={styles.loadingContainer}>
        <Cabecalho navigation={navigation} />
        <ActivityIndicator
          size="large"
          color="#05419A"
          style={{ marginTop: 50 }}
        />
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Carregando áreas...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />
      {/* Botão de PDF */}
      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#05419A" }]}
        onPress={gerarPDF}
      >
        <Text style={styles.textoBotao}>Gerar PDF</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Focos por Área</Text>
        <Text style={styles.subTitulo}>Ordenado por:</Text>

        {/* Seletor de ordenação */}
        <View style={styles.seletorContainer}>
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
              Imóveis com Foco
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
              Total de Focos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de áreas */}
        {areas.length === 0 ? (
          <Text style={styles.empty}>Nenhuma área encontrada.</Text>
        ) : (
          areas.map((area) => (
            <View key={area.idArea} style={styles.card}>
              <Text style={styles.areaNome}>{area.nomeArea.toUpperCase()}</Text>
              <Text style={styles.item}>Total Focos: {area.totalFocos}</Text>
              <Text style={styles.item}>
                Imóveis com Foco: {area.imoveisComFoco}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: width(5), paddingBottom: height(5) },
  titulo: {
    fontSize: font(4),
    fontWeight: "bold",
    marginBottom: height(3),
    textAlign: "center",
    color: "#05419A",
    width: "100%",
  },
  subTitulo: {
    fontSize: font(3),
    fontWeight: "bold",
    textAlign: "center",
    color: "#05419A",
    width: "100%",
  },
  seletorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: height(3),
  },
  seletorButton: {
    flex: 1,
    padding: height(1.5),
    marginHorizontal: width(1),
    borderRadius: width(2),
    borderWidth: 1,
    borderColor: "#05419A",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  seletorButtonAtivo: { backgroundColor: "#05419A" },
  seletorText: { color: "#05419A", fontWeight: "bold" },
  seletorTextAtivo: { color: "#fff" },
  card: {
    padding: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: width(3),
    marginBottom: height(2),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  areaNome: {
    fontWeight: "bold",
    fontSize: font(3.2),
    marginBottom: height(1),
    color: "#05419A",
  },
  item: { fontSize: font(2.5), marginTop: height(0.5) },
  empty: {
    fontSize: font(2.5),
    color: "gray",
    textAlign: "center",
    marginTop: height(3),
  },
  botao: {
    padding: 15,
    borderRadius: width(3),
    alignItems: "center",
    marginTop: height(3),
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: font(2.8) },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
