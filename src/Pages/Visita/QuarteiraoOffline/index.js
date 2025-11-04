import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";
import { downloadMapForOffline } from "../../../utils/mapaUtils.js";

export default function QuarteiraoOffline({ navigation }) {
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState(null);

  const fecharDiario = () => {
    navigation.navigate("ListarVisitas", { modo: "visualizar" });
  };

  const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout)
      ),
    ]);
  };

  const carregarOffline = async () => {
    try {
      const offlineQuarteiroes = await AsyncStorage.getItem("dadosQuarteiroes");
      const offlineImoveis = await AsyncStorage.getItem("dadosImoveis");

      const q = offlineQuarteiroes ? JSON.parse(offlineQuarteiroes) : [];
      const i = offlineImoveis ? JSON.parse(offlineImoveis) : [];

      setQuarteiroes(Array.isArray(q) ? q : []);
      setImoveis(Array.isArray(i) ? i : []);
    } catch (err) {
      console.log("Erro ao carregar offline:", err);
      setQuarteiroes([]);
      setImoveis([]);
    } finally {
      setLoading(false);
    }
  };

  const baixarDados = async () => {
    setLoading(true);
    let failedDownloads = 0;
    setSyncMessage(null);

    try {
      const idUsuario = await getId();

      const resQ = await fetchWithTimeout(
        `${API_URL}/baixarQuarteiroesResponsavel/${idUsuario}`,
        {},
        5000
      );
      const quarteiroesArrayOriginal = resQ.ok ? await resQ.json() : [];

      const quarteiroesArray = [];

      for (const q of quarteiroesArrayOriginal) {
        let uriMapaLocal = null;
        if (q.mapaUrl) {
          try {
            uriMapaLocal = await downloadMapForOffline(q.mapaUrl);
          } catch (error) {
            console.warn(
              `[Download Mapa] Falha ao baixar mapa do quarteirão ${q._id}: ${error.message}`
            );
            failedDownloads++;
          }
        }

        quarteiroesArray.push({
          ...q,
          uriMapaLocal: uriMapaLocal,
        });
      }

      const resI = await fetchWithTimeout(
        `${API_URL}/baixarImoveisResponsavel/${idUsuario}`,
        {},
        5000
      );
      const imoveisArray = resI.ok ? await resI.json() : [];

      const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
      const locaisArr = rawImoveis ? JSON.parse(rawImoveis) : [];

      const mesclados = imoveisArray.map((i) => {
        const local = locaisArr.find((l) => l._id === i._id);
        if (local && (local.editado || local.status === "visitado")) {
          return local;
        }
        return i;
      });

      await AsyncStorage.setItem(
        "dadosQuarteiroes",
        JSON.stringify(quarteiroesArray)
      );
      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(mesclados));

      setQuarteiroes(Array.isArray(quarteiroesArray) ? quarteiroesArray : []);
      setImoveis(Array.isArray(mesclados) ? mesclados : []);

      if (failedDownloads > 0) {
        setSyncMessage({
          text: `Sincronização concluída, mas falhou ao baixar ${failedDownloads} mapa(s).`,
          type: "error",
        });
      } else {
        setSyncMessage({
          text: "Dados e mapas atualizados com sucesso para uso offline!",
          type: "success",
        });
      }
    } catch (error) {
      console.log("Erro ao baixar:", error.message);
      setSyncMessage({
        text: "Sem conexão. Usando dados offline.",
        type: "error",
      });
      await carregarOffline();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await carregarOffline();
      baixarDados();
    })();
  }, []);

  useEffect(() => {
    if (syncMessage) {
      const timer = setTimeout(() => {
        setSyncMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncMessage]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA856" />
      </View>
    );
  }

  const qList = Array.isArray(quarteiroes) ? quarteiroes : [];
  const iList = Array.isArray(imoveis) ? imoveis : [];

  const sections = qList.reduce((acc, q) => {
    const title = q.nomeArea || "SEM ÁREA DEFINIDA";
    let sec = acc.find((s) => s.title === title);
    if (!sec) {
      sec = { title, data: [] };
      acc.push(sec);
    }
    const qtdImoveis = iList.filter((i) => i.idQuarteirao === q._id).length;
    sec.data.push({ ...q, qtdImoveis });
    return acc;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Cabecalho navigation={navigation} />

        {syncMessage && (
          <View
            style={[
              styles.syncMessageContainer,
              syncMessage.type === "error"
                ? styles.syncError
                : styles.syncSuccess,
            ]}
          >
            <Text style={styles.syncMessageText}>{syncMessage.text}</Text>
          </View>
        )}

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>QUARTEIRÕES DO DIA</Text>
        </View>

        {sections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum quarteirão atribuído a este agente.
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item._id)}
            renderItem={({ item }) => {
              try {
                const areaNome = (
                  item?.nomeArea || "NOME INDEFINIDO"
                ).toUpperCase();
                const numero =
                  item?.numero !== undefined && item?.numero !== null
                    ? String(item.numero).padStart(2, "0")
                    : "00";
                const textoFinal = `${areaNome} - QUARTEIRÃO ${numero}`;

                const imoveisDoQuarteirao = iList.filter(
                  (i) => i.idQuarteirao === item._id
                );
                const totalImoveis = imoveisDoQuarteirao.length;
                const imoveisVisitados = imoveisDoQuarteirao.filter(
                  (i) => i.status === "visitado"
                ).length;

                let backgroundColor = styles.listItemWrapper.backgroundColor;
                if (imoveisVisitados > 0) backgroundColor = "#fbfde6ff";
                if (imoveisVisitados === totalImoveis && totalImoveis > 0)
                  backgroundColor = "#d9f1dfff";

                return (
                  <TouchableOpacity
                    style={[styles.listItemWrapper, { backgroundColor }]}
                    onPress={() =>
                      navigation.navigate("ImovelOffline", {
                        quarteirao: item,
                        uriMapaLocal: item.uriMapaLocal,
                      })
                    }
                  >
                    <Text style={styles.listItemText}>{textoFinal}</Text>
                    <Text style={styles.listItemSubtitle}>
                      {imoveisVisitados} de {totalImoveis} imóveis visitados
                    </Text>
                  </TouchableOpacity>
                );
              } catch (e) {
                console.log("Erro ao renderizar item:", e);
                return null;
              }
            }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeaderTitle}>
                  {title.toUpperCase()}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.closeDiaryButton}
        onPress={fecharDiario}
        activeOpacity={0.8}
      >
        <Text style={styles.closeDiaryButtonText}>FECHAR DIÁRIO</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitleContainer: {
    paddingVertical: height(2),
    paddingHorizontal: width(5),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: font(3),
    fontWeight: "bold",
    color: "#05419A",
    textAlign: "center",
  },
  sectionHeaderContainer: {
    paddingHorizontal: width(5),
    paddingVertical: height(1),
    backgroundColor: "#05419A",
    borderBottomWidth: 1,
    borderBottomColor: "#05419A",
  },
  sectionHeaderTitle: {
    fontSize: font(2.5),
    paddingVertical: height(1),
    fontWeight: "bold",
    color: "#fff",
  },
  listItemWrapper: {
    paddingHorizontal: width(5),
    paddingVertical: height(2),
    borderBottomWidth: 1,
    borderBottomColor: "#CDCDCD",
    width: width(100),
  },
  listItemText: {
    fontSize: font(2.5),
    color: "#333333",
    fontWeight: "bold",
  },
  listItemSubtitle: {
    fontSize: font(2),
    color: "#666",
    marginTop: height(0.5),
  },
  syncMessageContainer: {
    padding: height(2),
    marginHorizontal: width(3),
    borderRadius: 8,
    marginTop: height(1),
    marginBottom: height(1),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  syncSuccess: {
    backgroundColor: "#d9f1dfff",
    borderColor: "#2CA856",
    borderWidth: 1,
  },
  syncError: {
    backgroundColor: "#ffe0e0",
    borderColor: "#E53935",
    borderWidth: 1,
  },
  syncMessageText: {
    fontSize: font(2),
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width(10),
  },
  emptyText: {
    fontSize: font(2.5),
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: height(5),
  },
  closeDiaryButton: {
    position: "absolute",
    bottom: height(2),
    left: width(5),
    right: width(5),
    backgroundColor: "#05419A",
    paddingVertical: height(2),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  closeDiaryButtonText: {
    color: "#fff",
    fontSize: font(2.5),
    fontWeight: "bold",
  },
});