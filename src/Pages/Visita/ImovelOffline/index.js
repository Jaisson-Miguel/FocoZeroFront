import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cabecalho from "../../../Components/Cabecalho";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { height, width, font } from "../../../utils/responsive.js";
import ImageViewing from "react-native-image-viewing";

const mapearTipoImovel = (tipoAbreviado) => {
  const tipos = {
    r: "Residência",
    c: "Comércio",
    tb: "Terreno Baldio",
    pe: "Ponto Estratégico",
    out: "Outros",
  };
  const chave = tipoAbreviado ? String(tipoAbreviado).toLowerCase().trim() : "";
  return (
    tipos[chave] ||
    (tipoAbreviado ? String(tipoAbreviado).toUpperCase() : "NÃO ESPECIFICADO")
  );
};

const screenWidth = Dimensions.get("window").width;

export default function ImovelOffline({ route, navigation }) {
  const { quarteirao } = route.params;

  const [imoveis, setImoveis] = useState({});
  const [loading, setLoading] = useState(true);
  const [mapaVisivel, setMapaVisivel] = useState(false);
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

          const agrupados = filtrados.reduce((acc, imovel) => {
            if (!acc[imovel.logradouro]) acc[imovel.logradouro] = [];
            acc[imovel.logradouro].push(imovel);
            return acc;
          }, {});

          setImoveis(agrupados);
        } catch (err) {
          console.log("Erro ao carregar imóveis offline:", err);
          setImoveis({});
        } finally {
          setLoading(false);
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

      {quarteirao?.uriMapaLocal ? (
        <TouchableOpacity
          style={styles.mapaButton}
          onPress={() => setMapaVisivel(true)}
        >
          <MaterialCommunityIcons
            name="map"
            size={font(2.5)}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.mapaButtonText}>Mapa da Área</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.mapaButtonDisabled}>
          <MaterialCommunityIcons
            name="map-off"
            size={font(2.5)}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.mapaButtonText}>Mapa não disponível</Text>
        </View>
      )}

      <ImageViewing
        images={[{ uri: quarteirao.uriMapaLocal }]}
        imageIndex={0}
        visible={mapaVisivel}
        onRequestClose={() => setMapaVisivel(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.simpleTitleContainer}>
          <Text style={styles.simpleTitle}>
            {quarteirao.nomeArea} - {quarteirao.numero}
          </Text>
          <Text style={styles.simpleSubtitle}>
            Código {quarteirao.codigoArea} - Zona {quarteirao.zonaArea}
          </Text>
        </View>

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
                            size={font(2)}
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
                            quarteirao,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: height(3),
  },
  mapaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05419A",
    paddingVertical: height(1.25),
    marginHorizontal: width(3.75),
    borderRadius: 8,
    marginTop: height(1.25),
  },
  mapaButtonDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A9A9A9",
    paddingVertical: height(1.25),
    marginHorizontal: width(3.75),
    borderRadius: 8,
    marginTop: height(1.25),
  },
  mapaButtonText: {
    color: "#fff",
    fontSize: font(2),
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  simpleTitleContainer: {
    paddingHorizontal: width(3.75),
    alignItems: "center",
    paddingVertical: height(1.25),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  simpleTitle: {
    fontSize: font(3.5),
    fontWeight: "bold",
    color: "#05419A",
    textTransform: "uppercase",
  },
  simpleSubtitle: {
    fontSize: font(2.25),
    color: "#666",
    textTransform: "uppercase",
  },
  streetHeader: {
    fontSize: font(2.5),
    fontWeight: "bold",
    backgroundColor: "#05419A",
    color: "white",
    paddingVertical: height(1.5),
    paddingHorizontal: width(3.75),
    marginBottom: 0,
  },
  imovelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height(1.25),
    paddingHorizontal: width(3.75),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  imovelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: width(5),
    height: width(5),
    borderWidth: 1,
    borderColor: "#000",
    marginRight: width(2.5),
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
    fontSize: font(1.9),
    color: "#000",
  },
  recusaText: {
    color: "red",
    fontSize: font(1.5),
  },
  imovelRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: width(2.5),
  },
  editButton: {
    backgroundColor: "#2CA856",
    paddingVertical: height(0.75),
    paddingHorizontal: width(3),
    borderRadius: 5,
    marginRight: width(2),
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font(1.6),
  },
  visitButton: {
    backgroundColor: "#05419A",
    paddingVertical: height(0.75),
    paddingHorizontal: width(3),
    borderRadius: 5,
  },
  visitButtonDisabled: {
    backgroundColor: "#A9A9A9",
  },
  visitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font(1.6),
  },
  emptyText: {
    textAlign: "center",
    marginTop: height(2.5),
    color: "gray",
    fontSize: font(2),
  },
});
