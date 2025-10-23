import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cabecalho from "../../../Components/Cabecalho";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const mapearTipoImovel = (tipoAbreviado) => {
  const tipos = {
    r: "Residência",
    c: "Comércio",
    tb: "Terreno Baldio",
    pe: "Ponto Estratégico",
    out: "Outros",
  };
  const chave = tipoAbreviado ? String(tipoAbreviado).toLowerCase().trim() : "";
  return tipos[chave] || (tipoAbreviado ? String(tipoAbreviado).toUpperCase() : "NÃO ESPECIFICADO");
};

export default function ImovelOffline({ route, navigation }) {
  const { quarteirao } = route.params;
  const [imoveis, setImoveis] = useState({});
  const [loading, setLoading] = useState(true);
  const offline = true;

  const agruparImoveisPorRua = (imoveisArray) => {
    return imoveisArray.reduce((acc, imovel) => {
      const rua = imovel.logradouro;
      if (!acc[rua]) {
        acc[rua] = [];
      }
      acc[rua].push(imovel);
      return acc;
    }, {});
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const carregarImoveis = async () => {
        setLoading(true);
        try {
          const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
          let todos = rawImoveis ? JSON.parse(rawImoveis) : [];

          const filtrados = todos.filter(
            (i) => i.idQuarteirao === quarteirao._id
          );

          const agrupados = agruparImoveisPorRua(filtrados);

          if (isActive) setImoveis(agrupados);
        } catch (err) {
          console.log("Erro ao carregar imóveis offline:", err);
          if (isActive) setImoveis({});
        } finally {
          if (isActive) setLoading(false);
        }
      };

      carregarImoveis();

      return () => {
        isActive = false;
      };
    }, [quarteirao])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA856" />
      </View>
    );
  }

  const ruas = Object.keys(imoveis);

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.mainTitle}>
          Imóveis do Quarteirão {quarteirao.numero} - {quarteirao.nomeArea}
        </Text>

        {ruas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum imóvel encontrado.</Text>
        ) : (
          ruas.map((rua) => (
            <View key={rua}>
              <Text style={styles.streetHeader}>{rua}</Text>
              {imoveis[rua].map((imovel) => {
                const jaVisitado = imovel.status === "visitado";
                const mostrarRecusa = imovel.status === "recusa";
                const isDisabled = jaVisitado;
                
                const tipoDoImovel = imovel.complemento || imovel.tipo;
                const tipoMapeado = mapearTipoImovel(tipoDoImovel);

                return (
                  <View key={imovel._id} style={styles.imovelItem}>
                    <View style={styles.imovelLeft}>
                      <View
                        style={[
                          styles.checkbox,
                          jaVisitado && styles.checkboxChecked,
                        ]}
                      >
                        {jaVisitado && (
                          <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color="#fff"
                          />
                        )}
                      </View>
                      <View style={styles.imovelTextContainer}>
                        <Text style={styles.imovelText}>
                          Nº {imovel.numero} - {tipoMapeado}
                        </Text>
                        {mostrarRecusa && (
                          <Text style={styles.recusaText}>Recusa</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.imovelRight}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          navigation.navigate("EditarImovelOffline", {
                            imovel,
                            offline,
                          })
                        }
                      >
                        <Text style={styles.editText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.visitButton,
                          isDisabled && styles.visitButtonDisabled,
                        ]}
                        onPress={() =>
                          !isDisabled &&
                          navigation.navigate("Visita", {
                            imovel,
                            idArea: quarteirao.idArea,
                            nomeArea: quarteirao.nomeArea,
                            quarteirao,
                          })
                        }
                        disabled={isDisabled}
                        activeOpacity={isDisabled ? 1 : 0.7}
                      >
                        <Text style={styles.visitText}>Visita</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#05419A",
    margin: 10,
    marginVertical: 20,
    paddingHorizontal: 5,
  },
  streetHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#05419A",
    color: "white",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 0,
  },
  imovelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  imovelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
  },
  checkboxChecked: {
    backgroundColor: "#05419A",
    borderColor: "#05419A",
  },
  imovelTextContainer: {
    flexShrink: 1,
  },
  imovelText: {
    fontSize: 14,
    color: "#000",
  },
  recusaText: {
    color: "red",
    fontSize: 12,
  },
  imovelRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: "#2CA856",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  visitButton: {
    backgroundColor: "#05419A",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  visitButtonDisabled: {
    backgroundColor: "#A9A9A9",
  },
  visitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});