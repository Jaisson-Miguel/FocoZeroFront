import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";

export default function ResumoDiario({ route, navigation }) {
  const { pendentes, resumo } = route.params;
  const [loading, setLoading] = useState(false);
  const [visitas, setVisitas] = useState(pendentes);

  const [quarteiroes, setQuarteiroes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);
  const [selectedQuarteiroes, setSelectedQuarteiroes] = useState([]);

  // 🔹 Carrega quarteirões e imóveis offline
  useEffect(() => {
    const carregarDadosOffline = async () => {
      try {
        const rawQ = await AsyncStorage.getItem("dadosQuarteiroes");
        const rawI = await AsyncStorage.getItem("dadosImoveis");

        const parsedQ = rawQ ? JSON.parse(rawQ) : [];
        const parsedI = rawI ? JSON.parse(rawI) : [];

        setQuarteiroes(parsedQ);
        setImoveis(parsedI);
      } catch (err) {
        console.error("Erro ao carregar dados offline:", err);
      } finally {
        setLoadingDados(false);
      }
    };
    carregarDadosOffline();
  }, []);

  // 🔄 Função principal de sincronização
  const sincronizarVisitas = async () => {
    setLoading(true);

    try {
      // 🔹 Verifica se há imóveis editados offline
      const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
      const listaImoveis = rawImoveis ? JSON.parse(rawImoveis) : [];
      const imoveisEditados = listaImoveis.filter((i) => i.editadoOffline);

      // 🔹 Verifica se há algo a sincronizar
      if (
        visitas.length === 0 &&
        selectedQuarteiroes.length === 0 &&
        imoveisEditados.length === 0
      ) {
        setLoading(false);
        Alert.alert("Aviso", "Nenhuma alteração para sincronizar.");
        return;
      }

      const listaAtualizada = [...visitas];

      // 1️⃣ Envia visitas pendentes
      const promVisitas = listaAtualizada.map(async (visita) => {
        try {
          const { sincronizado, ...dadosParaEnviar } = visita;
          const response = await fetch(`${API_URL}/cadastrarVisita`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosParaEnviar),
          });
          if (response.ok) {
            visita.sincronizado = true;
          }
        } catch (err) {
          console.error("Erro ao sincronizar visita:", err);
        }
      });

      // 2️⃣ Sincroniza imóveis editados offline (novo)
      const promImoveis = (async () => {
        try {
          const raw = await AsyncStorage.getItem("dadosImoveis");
          if (!raw) return;
          let listaImoveis = JSON.parse(raw);

          const promises = listaImoveis
            .filter((i) => i.editadoOffline)
            .map(async (i) => {
              const { editadoOffline, _id, ...dadosParaEnviar } = i;
              try {
                const res = await fetch(`${API_URL}/editarImovel/${_id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(dadosParaEnviar),
                });
                if (res.ok) {
                  i.editadoOffline = false;
                } else {
                  console.log("Erro servidor imóvel:", await res.text());
                }
              } catch (err) {
                console.error("Erro rede imóvel:", err);
              }
            });

          await Promise.all(promises);
          await AsyncStorage.setItem(
            "dadosImoveis",
            JSON.stringify(listaImoveis)
          );
        } catch (err) {
          console.error("Erro ao sincronizar imóveis:", err);
        }
      })();

      // 3️⃣ Atualiza quarteirões selecionados
      const userId = await getId();
      const promQuarteiroes = selectedQuarteiroes.length
        ? fetch(`${API_URL}/atualizarQuarteiroes`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ids: selectedQuarteiroes,
              trabalhadoPor: userId,
            }),
          })
        : Promise.resolve();

      // 4️⃣ Executa tudo
      await Promise.all([...promVisitas, promImoveis, promQuarteiroes]);

      // 5️⃣ Atualiza armazenamento de visitas
      const todasVisitasSalvas = await AsyncStorage.getItem("visitas");
      const listaTotal = todasVisitasSalvas
        ? JSON.parse(todasVisitasSalvas)
        : [];
      const atualizadas = listaTotal.map((v) => {
        const encontrada = listaAtualizada.find(
          (p) => p.idImovel === v.idImovel
        );
        return encontrada ? encontrada : v;
      });
      await AsyncStorage.setItem("visitas", JSON.stringify(atualizadas));
      setVisitas(listaAtualizada);

      Alert.alert("Sucesso", "Sincronização concluída com sucesso!");
      navigation.goBack();
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      Alert.alert("Erro", "Não foi possível sincronizar tudo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedQuarteiroes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🔹 Agrupa quarteirões por área e conta imóveis pelo idQuarteirao
  const sections = quarteiroes.reduce((acc, q) => {
    const qtdImoveis = imoveis.filter((i) => i.idQuarteirao === q._id).length;

    let sec = acc.find((s) => s.title === q.nomeArea);
    if (!sec) {
      sec = { title: q.nomeArea, data: [] };
      acc.push(sec);
    }
    sec.data.push({ ...q, qtdImoveis });
    return acc;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Resumo Diário</Text>

      <Text style={styles.item}>
        Total de visitas pendentes: {resumo.totalVisitas}
      </Text>

      <View style={styles.box}>
        <Text style={styles.subtitulo}>Visitas por tipo:</Text>
        {Object.entries(resumo.visitasPorTipo).map(([tipo, qtd]) => (
          <Text key={tipo}>
            {tipo.toUpperCase()}: {qtd}
          </Text>
        ))}
      </View>

      <View style={styles.box}>
        <Text style={styles.subtitulo}>
          Depósitos inspecionados (total por tipo):
        </Text>
        {Object.entries(resumo.depositosTotais).map(([campo, qtd]) => (
          <Text key={campo}>
            {campo.toUpperCase()}: {qtd}
          </Text>
        ))}
      </View>

      <Text style={styles.item}>Total de focos: {resumo.totalFocos}</Text>

      <Text style={[styles.titulo, { marginTop: 20 }]}>
        Selecione os quarteirões finalizados:
      </Text>

      {loadingDados ? (
        <ActivityIndicator size="small" color="#2CA856" />
      ) : quarteiroes.length === 0 ? (
        <Text style={{ color: "gray", marginTop: 8 }}>
          Nenhum quarteirão baixado.
        </Text>
      ) : (
        sections.map((sec) => (
          <View key={sec.title} style={{ width: "100%", marginTop: 8 }}>
            <Text style={styles.sectionHeader}>{sec.title}</Text>
            {sec.data.map((q) => {
              const selected = selectedQuarteiroes.includes(q._id);
              return (
                <TouchableOpacity
                  key={q._id}
                  style={[
                    styles.quarteiraoItem,
                    selected && styles.quarteiraoSelecionado,
                  ]}
                  onPress={() => toggleSelect(q._id)}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Text>Quarteirão {q.numero}</Text>
                      <Text style={{ color: "gray" }}>
                        {q.qtdImoveis} imóveis
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18 }}>{selected ? "✓" : ""}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))
      )}

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#2196F3" }]}
        onPress={sincronizarVisitas}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Sincronizar Dados</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: "#4CAF50" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoBotao}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
  },
  box: {
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 15,
  },
  subtitulo: {
    fontWeight: "600",
    marginBottom: 5,
  },
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionHeader: {
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: "#eee",
    padding: 8,
  },
  quarteiraoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  quarteiraoSelecionado: {
    backgroundColor: "#c8e6c9",
  },
});
