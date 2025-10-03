import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { API_URL } from "./../../../config/config.js";
import ImageViewing from "react-native-image-viewing";
import { useFocusEffect } from "@react-navigation/native";
import Cabecalho from "../../../Components/Cabecalho.js";

export default function Quarteiroes({ route, navigation }) {
  const { idArea, mapaUrl, nomeArea, funcao, modoI } = route.params;
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchQuarteiroes = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${API_URL}/listarQuarteiroes/${idArea}`
          );
          const data = await response.json();

          if (response.status === 404) {
            setQuarteiroes([]);
          } else if (!response.ok) {
            throw new Error(data.message || "Erro ao buscar quarteirões");
          } else {
            setQuarteiroes(data);
          }
          setError(null);
        } catch (err) {
          console.error(err);
          setError("Não foi possível carregar os quarteirões.");
        } finally {
          setLoading(false);
        }
      };

      fetchQuarteiroes();
    }, [idArea])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />

      {nomeArea && <Text style={styles.areaTitle}>{nomeArea}</Text>}

      <TouchableOpacity onPress={() => setVisible(true)}>
        <Text style={styles.areaTitle}>Mapa</Text>
      </TouchableOpacity>
      <ImageViewing
        images={[{ uri: mapaUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {funcao === "adm" && (
        <TouchableOpacity
          style={styles.btnCadastrar}
          onPress={() =>
            navigation.navigate("CadastrarQuarteirao", {
              idArea: idArea,
              nomeArea: nomeArea,
            })
          }
        >
          <Text style={styles.btnText}>Cadastrar Quarteirão</Text>
        </TouchableOpacity>
      )}

      {quarteiroes.length === 0 ? (
        <Text style={styles.empty}>Nenhum quarteirão encontrado.</Text>
      ) : (
        <FlatList
          data={quarteiroes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("ListarImovel", {
                  quarteirao: item,
                  idArea,
                  nomeArea,
                  modoI,
                })
              }
            >
              <Text style={styles.itemTitle}>{item.numero}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  areaTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
  empty: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  itemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 5,
  },
  itemTitle: { fontSize: 16 },
  btnCadastrar: {
    margin: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
