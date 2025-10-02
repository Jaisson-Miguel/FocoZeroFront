import React, { useCallback, useEffect, useState } from "react";
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
import { API_URL } from "./../../../config/config.js";
import { getFuncao } from "../../../utils/tokenStorage.js";
import { useFocusEffect } from "@react-navigation/native";

export default function ListarArea({ route, navigation }) {
  const { modo, idAgente, nomeAgente } = route.params;
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [funcao, setFuncao] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchAreas = async () => {
        setLoading(true);
        const userFuncao = await getFuncao();
        if (userFuncao) setFuncao(userFuncao);

        try {
          const response = await fetch(`${API_URL}/listarAreas`);
          const data = await response.json();

          if (!response.ok) {
            Alert.alert("Erro", data.message || "Falha ao carregar áreas");
            return;
          }

          setAreas(data);
        } catch (error) {
          Alert.alert("Erro", "Não foi possível conectar ao servidor");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchAreas();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05419A" />
        <Text>Carregando áreas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Áreas cadastradas</Text>

      {funcao === "adm" && (
        <TouchableOpacity
          onPress={() => navigation.navigate("CadastrarArea")}
          style={styles.btnCadastrar}
        >
          <Text>Cadastrar Área</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={areas}
        renderItem={({ item }) => (
          <Item
            area={item}
            navigation={navigation}
            modo={modo}
            idAgente={idAgente}
          />
        )}
      />
    </View>
  );
}

function Item({ area, navigation, modo, idAgente }) {
  return modo === "atribuir" ? (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("AtribuirQuarteirao", {
          idArea: area._id,
          mapaUrl: area.mapaUrl,
          nomeArea: area.nome,
          idAgente: idAgente,
        })
      }
      style={styles.container}
    >
      <View style={styles.containerInfo}>
        <Text style={styles.title}>Atribuir ... {area.nome}</Text>
        <Text style={styles.description}>{area.codigo}</Text>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ListarQuarteirao", {
          idArea: area._id,
          mapaUrl: area.mapaUrl,
          nomeArea: area.nome,
        })
      }
      style={styles.container}
    >
      <View style={styles.containerInfo}>
        <Text style={styles.title}>{area.nome}</Text>
        <Text style={styles.description}>{area.codigo}</Text>
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
