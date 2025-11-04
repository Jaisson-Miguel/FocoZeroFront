import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import { useFocusEffect } from "@react-navigation/native";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";

export default function ListarAgentes({ navigation, route }) {
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchAgentes = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${API_URL}/listarUsuarios?funcao=agente`
          );
          const data = await response.json();

          if (!response.ok) {
            Alert.alert("Erro", data.message || "Falha ao carregar agentes");
            return;
          }

          setAgentes(data);
        } catch (error) {
          Alert.alert("Erro", "Não foi possível conectar ao servidor");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchAgentes();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"#05419A"} />
        <Text style={styles.loadingText}>Carregando agentes para atribuição...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />
      <View style={styles.containerMenor}>
        <Text style={styles.listTitle}>
          Selecione um Agente
        </Text>

        <FlatList
          data={agentes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ItemAgenteAtribuir agente={item} navigation={navigation} />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>Nenhum agente encontrado.</Text>
          )}
        />
      </View>
    </View>
  );
}

function ItemAgenteAtribuir({ agente, navigation }) {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ListarAreas", {
          idAgente: agente._id,
          nomeAgente: agente.nome,
          modo: "atribuir",
        })
      }
      style={styles.card}
    >
      <View style={styles.containerInfo}>
        <Text style={styles.cardTitle}>{agente.nome}</Text>
        <Text style={styles.cardDescription}>Código: {agente.cpf}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerMenor: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: width(5),
    paddingVertical: height(2.5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: height(1.5),
    fontSize: font(2.5),
    color: "#333",
  },
  listTitle: {
    fontSize: font(4),
    fontWeight: "bold",
    marginBottom: height(3),
    color: "#05419A",
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#fff",
    padding: height(1.5),
    borderRadius: 8,
    marginBottom: height(1.25),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: height(0.2) },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: font(2.5),
    fontWeight: "600",
    color: "#333",
    marginBottom: height(0.5),
  },
  cardDescription: {
    fontSize: font(2),
    fontWeight: "400",
    color: "#666",
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: height(5),
    fontSize: font(2.25),
    color: '#666',
  }
});