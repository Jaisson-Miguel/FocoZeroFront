import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { height, width, font } from "../../../utils/responsive.js";
import Icon from "react-native-vector-icons/Ionicons";
import Cabecalho from "../../../Components/Cabecalho.js";

export default function DetalhesVisita({ route, navigation }) {
  const { visita } = route.params;

  const renderDepositos = (depositos) => {
    return Object.entries(depositos || {}).map(([campo, valor]) => {
      const nomeFormatado = campo
        .replace(/([A-Z])/g, " $1")
        .trim()
        .replace(/^./, (str) => str.toUpperCase());
      return (
        <Text key={campo} style={styles.textBase}>
          <Text style={styles.textBold}>{nomeFormatado}</Text>: {valor}
        </Text>
      );
    });
  };

  const formatarData = (dataVisita) => {
    try {
      if (!dataVisita) return "N/A";
      const data = new Date(dataVisita);
      if (isNaN(data)) return "Data Inválida";

      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return "Erro ao formatar data";
    }
  };

  const traduzirTipoImovel = (tipo) => {
    const tipos = {
      'r': 'Residência',
      'c': 'Comércio',
      'tb': 'Terreno Baldio',
      'pe': 'Ponto Estratégico',
      'out': 'Outros',
    };
    return tipos[String(tipo).toLowerCase()] || tipo;
  };


  return (
    <View style={styles.fullScreenContainer}>
      <Cabecalho navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Detalhes da Visita</Text>

        <View style={styles.box}>
          <Text style={styles.subtitulo}>Informações do Imóvel</Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Imóvel:</Text> {visita.logradouro}, {visita.numero}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Tipo:</Text> {traduzirTipoImovel(visita.tipo)}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Área:</Text> {visita.nomeArea}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Quarteirão:</Text> {visita.nomeQuarteirao}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Data da Visita:</Text> {formatarData(visita.dataVisita)}
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.subtitulo}>Depósitos e Tratamento</Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Depósitos Eliminados:</Text> {visita.qtdDepEliminado}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Depósitos Tratados (Larvicida):</Text> {visita.qtdDepTratado}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Larvicida Usado (g):</Text> {visita.qtdLarvicida}
          </Text>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Houve Foco?</Text>{" "}
            <Text style={{ color: visita.foco ? "#F44336" : "#2CA856", fontWeight: 'bold' }}>
              {visita.foco ? "Sim" : "Não"}
            </Text>
          </Text>
        </View>

        <View style={styles.depositoBox}>
          <Text style={styles.subtituloDep}>
            Depósitos Inspecionados
          </Text>
          {renderDepositos(visita.depositosInspecionados)}
        </View>

        <View style={[styles.box, { backgroundColor: visita.sincronizado ? '#c3e3caff' : '#ff99a3ff' }]}>
          <Text style={styles.textBase}>
            <Text style={styles.textBold}>Sincronizado?</Text>{" "}
            <Text style={{ color: visita.sincronizado ? "#27904aff" : "#a22820ff", fontWeight: "bold" }}>
              {visita.sincronizado ? "Sim" : "Não"}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: width(2),
    paddingVertical: height(2),
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: font(3.8),
    fontWeight: "bold",
    color: "#05419A",
    paddingBottom: height(2),
    alignSelf: "center",
    marginTop: height(1),
  },
  box: {
    padding: height(2.5),
    backgroundColor: "#e0e0e0",
    borderRadius: width(2),
    marginBottom: height(1.5),
  },
  subtitulo: {
    fontWeight: "600",
    fontSize: font(2.5),
    marginBottom: height(1),
    color: "#05419A",
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: height(0.5)
  },
  subtituloDep: {
    fontWeight: "600",
    fontSize: font(2.5),
    marginBottom: height(1),
    color: "#05419A",
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBase: {
    fontSize: font(2.25),
    marginBottom: height(0.5),
    color: "#333",
  },
  textBold: {
    fontWeight: 'bold',
  },
  depositoBox: {
    padding: height(2.5),
    backgroundColor: "#e0e0e0",
    borderRadius: width(2),
    marginBottom: height(1.5),
  },
});