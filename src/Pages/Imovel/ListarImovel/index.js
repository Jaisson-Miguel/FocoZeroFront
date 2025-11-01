import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import Cabecalho from "../../../Components/Cabecalho";
import { useFocusEffect } from "@react-navigation/native";
import { height, width, font } from "../../../utils/responsive.js";
import Icon from "react-native-vector-icons/FontAwesome";
import { API_URL } from "../../../config/config.js";

const mapearTipoImovel = (tipoAbreviado) => {
  const tipos = {
    c: "Comércio",
    r: "Residência",
    tb: "Terreno Baldio",
    pe: "P. Estratégico",
    out: "Outros",
  };

  const getTipo = (valor) => {
    if (!valor) return "NÃO ESPECIFICADO";
    const v = String(valor).toLowerCase().trim();

    if (v.includes("comércio") || v === "c") return "Comércio";
    if (v.includes("residência") || v === "r") return "Residência";
    if (v.includes("terreno") || v === "tb") return "Terreno Baldio";
    if (v.includes("estratégico") || v === "pe") return "P. Estratégico";
    if (v.includes("outros") || v === "out") return "Outros";

    return tipos[v] || "NÃO ESPECIFICADO";
  };

  return getTipo(tipoAbreviado);
};

const screenWidth = Dimensions.get("window").width;

export default function ListarImovel({ route, navigation }) {
  const { quarteirao, idArea, nomeArea, modoI, funcao, modo } = route.params;
  const [imoveis, setImoveis] = useState({});
  const [loading, setLoading] = useState(true);

  const agruparImoveisPorRua = (imoveisArray) => {
    return imoveisArray.reduce((acc, imovel) => {
      const rua = imovel.logradouro || "Rua Desconhecida";
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
          const response = await fetch(
            `${API_URL}/listarImoveis/${quarteirao._id}`
          );

          if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.message || "Erro ao buscar imóveis.");
          }

          const data = await response.json();

          // Ordena por número
          data.sort((a, b) => {
            const numA = parseInt(String(a.numero).replace(/[^0-9]/g, "")) || 0;
            const numB = parseInt(String(b.numero).replace(/[^0-9]/g, "")) || 0;
            return numA - numB;
          });

          const agrupados = agruparImoveisPorRua(data);

          if (isActive) setImoveis(agrupados);
        } catch (err) {
          console.log("Erro ao carregar imóveis da API:", err.message);
          if (isActive) {
            Alert.alert("Erro", err.message || "Falha ao buscar imóveis.");
            setImoveis({});
          }
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
        <ActivityIndicator size="large" color="#05419A" />
      </View>
    );
  }

  const ruas = Object.keys(imoveis);

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />

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
                const isDisabled = imovel.status === "visitado";
                const tipoMapeado = mapearTipoImovel(imovel.tipo);
                const contentText = `Nº ${imovel.numero} - ${tipoMapeado}`;

                return (
                  <View key={imovel._id} style={styles.imovelItem}>
                    <View style={styles.imovelLeft}>
                      <TouchableOpacity
                        style={styles.imovelTextTouchable}
                        disabled={modoI === "Visualizar"}
                        onPress={() => {
                          if (modoI === "detalhes" || modoI === "Editar") {
                            navigation.navigate("EditarImovel", {
                              imovel,
                              offline: false,
                              funcao,
                            });
                          } else if (modoI !== "Visualizar") {
                            navigation.navigate("Visita", {
                              imovel,
                              idArea: quarteirao.idArea,
                              nomeArea: quarteirao.nomeArea,
                              quarteirao,
                            });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.imovelText,
                            isDisabled && styles.imovelTextVisited,
                            modoI === "Visualizar" && styles.imovelTextDisabled,
                          ]}
                        >
                          {contentText}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {modoI !== "Visualizar" && funcao !== "fiscal" && (
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          navigation.navigate("EditarImovel", {
                            imovel,
                            offline: false,
                            funcao,
                          })
                        }
                      >
                        <Text style={styles.editText}>Editar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      {/* ➕ Botão flutuante para cadastrar novo imóvel */}
      {modoI !== "Visualizar" && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() =>
            navigation.navigate("CadastrarImovel", {
              idQuarteirao: quarteirao._id,
              numeroQuarteirao: quarteirao.numero,
              imoveis: Object.values(imoveis).flat(),
            })
          }
        >
          <Icon name="plus" size={font(5)} color="#fff" />
        </TouchableOpacity>
      )}
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
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: height(3),
  },
  simpleTitleContainer: {
    paddingHorizontal: width(3.75),
    alignItems: "center",
    paddingVertical: height(2),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  simpleTitle: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textTransform: "uppercase",
  },
  simpleSubtitle: {
    fontSize: font(2.5),
    color: "#666",
    textTransform: "uppercase",
    marginTop: height(0.25),
  },
  streetHeader: {
    fontSize: font(3),
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#05419A",
    paddingVertical: height(1.5),
    paddingHorizontal: width(3.75),
  },
  imovelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height(1.25),
    paddingHorizontal: width(3.75),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingLeft: width(5),
  },
  imovelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imovelTextTouchable: {
    flex: 1,
    paddingVertical: height(1),
  },
  imovelText: {
    fontSize: font(2.5),
    color: "#333",
  },
  imovelTextVisited: {
    color: "#188a1bff",
  },
  imovelTextDisabled: {
    color: "black",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: height(1),
    paddingHorizontal: width(3.5),
    borderRadius: 5,
    marginLeft: width(2.5),
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: font(2.25),
  },
  emptyText: {
    textAlign: "center",
    color: "gray",
    fontSize: font(2.5),
    marginTop: height(2.5),
  },
  fabButton: {
    position: "absolute",
    width: height(8),
    height: height(8),
    alignItems: "center",
    justifyContent: "center",
    right: width(6),
    bottom: height(4),
    backgroundColor: "#05419A",
    borderRadius: height(8) / 2,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
