import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "./../../config/config.js";

export default function ListarAgentes({ navigation }) {
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentes = async () => {
      try {
        const response = await fetch(`${API_URL}/listarUsuarios?funcao=agente`);
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
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05419A" />
        <Text>Carregando agentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agentes</Text>

      <FlatList
        data={agentes}
        renderItem={({ item }) => (
          <Item agente={item} navigation={navigation} />
        )}
      />
    </View>
  );
}

function Item({ agente, navigation }) {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ListarArea", {
          idAgente: agente._id,
          nomeAgente: agente.nome,
          modo: "atribuir",
        })
      }
      style={styles.container}
    >
      <View style={styles.containerInfo}>
        <Text style={styles.title}>{agente.nome}</Text>
        <Text style={styles.description}>{agente.codigo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#05419A",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    flex: 1,
  },
  nome: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  mapa: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },

  img: {
    width: 100,
    height: 100,
  },
  containerInfo: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    fontWeight: 300,
  },
  btnCadastrar: {
    margin: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
