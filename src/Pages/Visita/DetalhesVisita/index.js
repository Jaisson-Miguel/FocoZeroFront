import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function DetalhesVisita({ route }) {
  const { visita } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Detalhes da Visita</Text>

      <Text style={styles.item}>Imóvel: {visita.logradouro}, {visita.numero}</Text>
      <Text style={styles.item}>Tipo: {visita.tipo}</Text>
      <Text style={styles.item}>Data: {new Date(visita.dataVisita).toLocaleString()}</Text>
      <Text style={styles.item}>Agente ID: {visita.idAgente}</Text>
      <Text style={styles.item}>Área: {visita.nomeArea}</Text>
      <Text style={styles.item}>Quarteirão: {visita.nomeQuarteirao}</Text>
      <Text style={styles.item}>Depósitos Eliminados: {visita.qtdDepEliminado}</Text>
      <Text style={styles.item}>Depósitos Tratados: {visita.qtdDepTratado}</Text>
      <Text style={styles.item}>Larvicida usado: {visita.qtdLarvicida}</Text>
      <Text style={styles.item}>Houve foco? {visita.foco ? "Sim" : "Não"}</Text>
      <Text style={styles.item}>Sincronizado? {visita.sincronizado ? "Sim" : "Não"}</Text>

      <View style={styles.depositoBox}>
        <Text style={styles.subtitulo}>Depósitos Inspecionados:</Text>
        {Object.entries(visita.depositosInspecionados || {}).map(([campo, valor]) => (
          <Text key={campo}>{campo.toUpperCase()}: {valor}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
  },
  depositoBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  subtitulo: {
    fontWeight: "600",
    marginBottom: 5,
  },
});
