import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { API_URL } from "../../../config/config.js";

export default function ListarImoveis({ route, navigation }) {
  const { quarteirao } = route.params; // vem da tela anterior
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchImoveis() {
      try {
        const response = await fetch(
          `${API_URL}/listarImoveis/${quarteirao._id}`
        );
        const data = await response.json();

        if (response.status === 404) {
          setImoveis([]); // Nenhum imóvel
        } else if (!response.ok) {
          throw new Error(data.message || "Erro ao buscar imóveis");
        } else {
          setImoveis(data);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os imóveis.");
      } finally {
        setLoading(false);
      }
    }

    fetchImoveis();
  }, [quarteirao._id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Nome do quarteirão */}
      <Text style={styles.areaTitle}>
        Imóveis do Quarteirão {quarteirao.numero}
      </Text>

      {/* Mensagem de erro */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Botão cadastrar imóvel */}
      <TouchableOpacity
        style={styles.btnCadastrar}
        onPress={() =>
          navigation.navigate("CadastrarImovel", {
            idQuarteirao: quarteirao._id,
            numeroQuarteirao: quarteirao.numero,
          })
        }
      >
        <Text style={styles.btnText}>Cadastrar Imóvel</Text>
      </TouchableOpacity>

      {/* Lista de imóveis */}
      {imoveis.length === 0 ? (
        <Text style={styles.empty}>Nenhum imóvel encontrado.</Text>
      ) : (
        <FlatList
          data={imoveis}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Visita", { imovel: item })}
            >
              <Text style={styles.itemTitle}>
                {item.tipo} - {item.logradouro}, {item.numero}
              </Text>
              <Text style={styles.itemCode}>Status: {item.status}</Text>
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
  areaTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
  empty: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  btnCadastrar: {
    margin: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  itemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 5,
  },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemCode: { color: "gray" },
});
