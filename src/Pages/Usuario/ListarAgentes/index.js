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

export default function ListarAgentes({ navigation, route }) {
  const { funcao } = route.params;
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

  // 🔁 Atualiza a lista sempre que a tela voltar a ficar em foco
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
        <ActivityIndicator size="large" color="#05419A" />
        <Text>Carregando agentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />
      <View style={styles.containerMenor}>
        <TouchableOpacity
          onPress={confirmarReset}
          style={{
            backgroundColor: "red",
            marginBottom: 10,
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={styles.btnText}>Resetar Responsáveis</Text>
        </TouchableOpacity>

        {/* Botão Cadastrar Agente */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Register", { funcaoUsuario: funcao })
          }
          style={{
            backgroundColor: "#05419A",
            marginBottom: 20,
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={styles.btnText}>Cadastrar Agente</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Agentes</Text>

        <FlatList
          data={agentes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Item agente={item} navigation={navigation} />
          )}
        />
      </View>
    </View>
  );
}

function Item({ agente, navigation }) {
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
  },
  containerMenor: {
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
  containerInfo: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: "300",
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
