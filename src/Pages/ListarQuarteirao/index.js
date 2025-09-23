import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { API_URL } from "../../config/config.js";
import ImageViewing from "react-native-image-viewing";

export default function Quarteiroes({ route, navigation }) {
  const { idArea, mapaUrl, nomeArea } = route.params; // pega dados da área
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function fetchQuarteiroes() {
      try {
        const response = await fetch(`${API_URL}/listarQuarteiroes/${idArea}`);
        const data = await response.json();

        if (response.status === 404) {
          // Nenhum quarteirão encontrado
          setQuarteiroes([]);
        } else if (!response.ok) {
          throw new Error(data.message || "Erro ao buscar quarteirões");
        } else {
          setQuarteiroes(data);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os quarteirões.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuarteiroes();
  }, [idArea]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa da área */}
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Text style={styles.title}>Mapa</Text>
      </TouchableOpacity>
      <ImageViewing
        images={[{ uri: mapaUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

      {/* Nome da área */}
      {nomeArea && <Text style={styles.areaTitle}>{nomeArea}</Text>}

      {/* Mensagem de erro */}
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={{
          margin: 10,
          backgroundColor: "green",
          padding: 10,
          borderRadius: 5,
        }}
        onPress={() =>
          navigation.navigate("CadastrarQuarteirao", {
            idArea: idArea,
            nomeArea: nomeArea,
          })
        }
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Cadastrar Quarteirão
        </Text>
      </TouchableOpacity>

      {/* Lista de quarteirões */}
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
                navigation.navigate("ListarImovel", { quarteirao: item })
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
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mapa: { width: "100%", height: 200, marginBottom: 10 },
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
  itemCode: { color: "gray" },
});
