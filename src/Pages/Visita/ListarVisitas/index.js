import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { height, width, font } from "../../../utils/responsive.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ListarVisitas({ navigation }) {
  const [visitas, setVisitas] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const insets = useSafeAreaInsets();

  const bottomMargin = insets.bottom > 0 ? insets.bottom : height(2);

  const carregarVisitas = async () => {
    try {
      const visitasSalvas = await AsyncStorage.getItem("visitas");
      if (visitasSalvas) {
        setVisitas(JSON.parse(visitasSalvas));
      } else {
        setVisitas([]);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as visitas.");
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", carregarVisitas);
    return unsubscribe;
  }, [navigation]);

  const agrupadas = {};
  visitas.forEach((v) => {
    const area = v.nomeArea || "Área Desconhecida";
    const quarteirao = v.nomeQuarteirao || "Quarteirão Desconhecido";

    if (!agrupadas[area]) agrupadas[area] = {};
    if (!agrupadas[area][quarteirao]) agrupadas[area][quarteirao] = [];
    agrupadas[area][quarteirao].push(v);
  });

  const limparVisitas = async () => {
    Alert.alert(
      "Confirmação",
      "Tem certeza que deseja limpar todas as visitas salvas? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Limpar",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("visitas");
              setVisitas([]);
              Alert.alert("Sucesso", "Visitas removidas com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar as visitas.");
              console.error(error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const finalizarDiario = async () => {
    if (isSyncing) return;

    try {
      const visitasSalvas = await AsyncStorage.getItem("visitas");
      const listaVisitas = visitasSalvas ? JSON.parse(visitasSalvas) : [];
      const pendentes = listaVisitas.filter((v) => !v.sincronizado);

      const imoveisSalvos = await AsyncStorage.getItem("dadosImoveis");
      const listaImoveis = imoveisSalvos ? JSON.parse(imoveisSalvos) : [];
      const imoveisEditados = listaImoveis.filter((i) => i.editado);

      if (pendentes.length > 0 || imoveisEditados.length > 0) {
        Alert.alert(
          "Atenção",
          "Existem visitas ou imóveis pendentes de sincronização. Sincronize antes de finalizar o diário."
        );
        return;
      }

      Alert.alert("Finalizar Diário", "Você finalizou algum quarteirão?", [
        {
          text: "Não",
          onPress: () => navigation.navigate("ResumoDiario"),
          style: "cancel",
        },
        {
          text: "Sim",
          onPress: () => navigation.navigate("AtualizarQuarteirao"),
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível finalizar o diário.");
    }
  };

  const sincronizarTudo = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      console.log("🔄 Iniciando sincronização geral...");

      const visitasSalvas = await AsyncStorage.getItem("visitas");
      const listaVisitas = visitasSalvas ? JSON.parse(visitasSalvas) : [];
      console.log("📦 Visitas salvas localmente:", listaVisitas);

      const pendentes = listaVisitas.filter((v) => !v.sincronizado);
      console.log("🕓 Visitas pendentes:", pendentes.length);

      const imoveisSalvos = await AsyncStorage.getItem("dadosImoveis");
      const listaImoveis = imoveisSalvos ? JSON.parse(imoveisSalvos) : [];
      const imoveisEditados = listaImoveis.filter((i) => i.editado);
      console.log("🏠 Imóveis editados:", imoveisEditados.length);

      if (pendentes.length === 0 && imoveisEditados.length === 0) {
        Alert.alert("Aviso", "Nenhuma alteração para sincronizar.");
        setIsSyncing(false);
        return;
      }

      let sucessoVisitas = 0;
      let sucessoImoveis = 0;

      await Promise.all(
        pendentes.map(async (v, index) => {
          try {
            const { sincronizado, ...dadosParaEnviar } = v;
            const res = await fetch(`${API_URL}/cadastrarVisita`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dadosParaEnviar),
            });

            if (res.ok) {
              v.sincronizado = true;
              sucessoVisitas++;
            }
          } catch (err) {
            console.log("❌ Erro ao sincronizar visita:", err.message);
          }
        })
      );

      await Promise.all(
        imoveisEditados.map(async (i) => {
          const { editado, _id, ...dadosParaEnviar } = i;
          try {
            const res = await fetch(`${API_URL}/editarImovel/${_id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dadosParaEnviar),
            });
            if (res.ok) {
              i.editado = false;
              sucessoImoveis++;
            }
          } catch (err) {
            console.log("❌ Erro ao sincronizar imóvel:", err.message);
          }
        })
      );

      const visitasNaoSincronizadas = listaVisitas.filter(
        (v) => !v.sincronizado
      );
      await AsyncStorage.setItem(
        "visitas",
        JSON.stringify(visitasNaoSincronizadas)
      );
      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(listaImoveis));

      setVisitas(visitasNaoSincronizadas);

      Alert.alert(
        "Sincronização Concluída",
        `Sucesso:\n- ${sucessoVisitas} visitas\n- ${sucessoImoveis} imóveis.`
      );
    } catch (err) {
      console.log("🚨 Erro geral na sincronização:", err);
      Alert.alert("Erro", "Falha na sincronização.");
    } finally {
      setIsSyncing(false);
    }
  };

  const getPendentesCount = () => visitas.filter((v) => !v.sincronizado).length;
  const hasVisitas = visitas.length > 0;

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visitas Salvas</Text>
        <Text style={styles.headerSubtitle}>
          Itens pendentes: {getPendentesCount()}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={
          !hasVisitas ? styles.scrollViewCentralized : styles.scrollView
        }
      >
        {Object.keys(agrupadas).length === 0 ? (
          <View style={styles.emptyMessageContainer}>
            <Text style={styles.msg}>Nenhuma visita salva ainda.</Text>
          </View>
        ) : (
          <>
            {Object.keys(agrupadas).map((nomeArea) => (
              <View key={nomeArea} style={styles.areaBox}>
                <Text style={styles.areaTitulo}>{nomeArea.toUpperCase()}</Text>

                {Object.keys(agrupadas[nomeArea]).map((nomeQuarteirao) => (
                  <View key={nomeQuarteirao} style={styles.quarteiraoBox}>
                    <Text style={styles.quarteiraoTitulo}>
                      Quarteirão: {nomeQuarteirao}
                    </Text>

                    {agrupadas[nomeArea][nomeQuarteirao].map((v, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.itemContainer}
                        onPress={() =>
                          navigation.navigate("DetalhesVisita", { visita: v })
                        }
                        activeOpacity={0.7}
                      >
                        <View style={styles.logradouroContainer}>
                          <Text style={styles.logradouroText}>
                            {v.logradouro}, {v.numero} - (
                            {(v.tipo || "Tipo não def.").toUpperCase()})
                          </Text>
                        </View>

                        <View style={styles.syncStatus}>
                          {v.sincronizado ? (
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={font(2.5)}
                              color="#4CAF50"
                            />
                          ) : (
                            <MaterialCommunityIcons
                              name="cloud-sync"
                              size={font(2.5)}
                              color="#F44336"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <View
          style={[
            styles.buttonWrapper,
            { marginBottom: bottomMargin },
          ]}
        >
          <TouchableOpacity
            style={[styles.botao, styles.botaoSincronizar]}
            onPress={sincronizarTudo}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>SINCRONIZAR DADOS</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, styles.botaoFinalizar]}
            onPress={finalizarDiario}
          >
            <Text style={styles.textoBotao}>FINALIZAR DIÁRIO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollView: {
    paddingHorizontal: width(3.75),
    paddingVertical: height(2.5),
  },
  scrollViewCentralized: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: height(3),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: font(2),
    color: "#F44336",
    fontWeight: "600",
    textAlign: "center",
  },
  areaBox: { marginBottom: height(1) },
  areaTitulo: {
    fontSize: font(2.75),
    fontWeight: "bold",
    backgroundColor: "#05419A",
    color: "white",
    paddingVertical: height(2),
    paddingHorizontal: width(2.5),
    marginBottom: height(1),
    borderRadius: width(1),
  },
  quarteiraoBox: {
    paddingLeft: width(1.25),
    borderLeftWidth: width(0.75),
    borderLeftColor: "#ccc",
    marginBottom: height(1),
  },
  quarteiraoTitulo: {
    fontSize: font(2.5),
    fontWeight: "600",
    color: "#333",
    backgroundColor: "#EAEAEA",
    paddingVertical: height(1.25),
    paddingHorizontal: width(2.5),
    marginBottom: height(0.25),
    borderRadius: width(1),
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: height(1.75),
    paddingHorizontal: width(3.75),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: width(2),
    marginBottom: height(0.25),
  },
  logradouroContainer: { flex: 1, marginRight: width(2.5) },
  logradouroText: { fontSize: font(2.25), color: "#333" },
  syncStatus: { width: width(5), alignItems: "center" },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width(5),
  },
  msg: { textAlign: "center", fontSize: font(2.5), color: "#777" },

  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: height(2),
  },
  botao: {
    padding: height(2),
    borderRadius: width(2),
    alignItems: "center",
    width: width(90),
    marginVertical: height(1),
  },
  textoBotao: { color: "#fff", fontWeight: "bold", fontSize: font(2.25) },
  botaoSincronizar: { backgroundColor: "#05419A" },
  botaoFinalizar: { backgroundColor: "#4CAF50" },
});
