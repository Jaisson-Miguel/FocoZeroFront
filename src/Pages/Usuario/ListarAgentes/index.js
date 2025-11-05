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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AgenteQuarteirao({ navigation, route }) {
  const { funcao } = route.params;
  const insets = useSafeAreaInsets();
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);

  function confirmarReset() {
    Alert.alert(
      "Atenção",
      "Você tem certeza que quer resetar todos os responsáveis dos quarteirões?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, resetar",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/resetarResponsaveis`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
              const data = await response.json();
              Alert.alert("Sucesso", data.message);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível resetar os responsáveis.");
            }
          },
        },
      ]
    );
  }

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
        <Text style={styles.loadingText}>Carregando agentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />
      <View style={styles.containerMenor}>

        <TouchableOpacity
          onPress={confirmarReset}
          style={[styles.button, { backgroundColor: "red", marginBottom: height(1.2) }]}
        >
          <Text style={styles.buttonText}>Resetar Responsáveis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Register", { funcaoUsuario: funcao })
          }
          style={[styles.button, { backgroundColor: "#05419A", marginBottom: height(2.5) }]}
        >
          <Text style={styles.buttonText}>Cadastrar Agente</Text>
        </TouchableOpacity>

        <Text style={styles.listTitle}>Lista de Agentes</Text>

        <FlatList
          data={agentes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ItemAgenteGerenciar agente={item} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + height(2) }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>Nenhum agente cadastrado.</Text>
          )}
        />
      </View>
    </View>
  );
}

function ItemAgenteGerenciar({ agente }) {
  return (
    <View style={styles.card}>
      <View style={styles.containerInfo}>
        <Text style={styles.cardTitle}>{agente.nome}</Text>
        <Text style={styles.cardDescription}>Código: {agente.cpf}</Text>
      </View>
    </View>
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
    fontSize: font(3.5),
    fontWeight: "bold",
    marginBottom: height(2),
    color: "#05419A",
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#fff",
    padding: height(1.5),
    borderRadius: 8,
    marginBottom: height(1.8),
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
  button: {
    padding: height(1.5),
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: font(2.25),
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: height(5),
    fontSize: font(2.25),
    color: '#666',
  }
});