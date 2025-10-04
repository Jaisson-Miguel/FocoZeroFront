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
  const [selected, setSelected] = useState([]);

  // NOVO: estados para quarteirões e seleção
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [loadingQuarteiroes, setLoadingQuarteiroes] = useState(true);
  const [selectedQuarteiroes, setSelectedQuarteiroes] = useState([]);

  useEffect(() => {
    const carregarQuarteiroes = async () => {
      try {
        const raw = await AsyncStorage.getItem("dadosQuarteiroes");
        if (raw) {
          const parsed = JSON.parse(raw);
          setQuarteiroes(Array.isArray(parsed) ? parsed : []);
        } else {
          setQuarteiroes([]);
        }
      } catch (err) {
        console.error("Erro ao carregar quarteirões:", err);
        setQuarteiroes([]);
      } finally {
        setLoadingQuarteiroes(false);
      }
    };

    carregarQuarteiroes();
  }, []);

  const sincronizarVisitas = async () => {
    if (visitas.length === 0 && selectedQuarteiroes.length === 0) {
      Alert.alert("Aviso", "Nenhuma alteração para sincronizar.");
      return;
    }

    setLoading(true);

    try {
      const listaAtualizada = [...visitas];

      // 1️⃣ Sincroniza todas as visitas
      const promVisitas = listaAtualizada.map(async (visita) => {
        try {
          const { sincronizado, ...dadosParaEnviar } = visita;

          const response = await fetch(`${API_URL}/cadastrarVisita`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosParaEnviar),
          });

          if (response.ok) {
            visita.sincronizado = true; // marca localmente
          } else {
            console.log("Erro no servidor:", await response.text());
          }
        } catch (err) {
          console.error("Erro de rede:", err);
        }
      });

      // 2️⃣ Sincroniza imóveis editados offline
      const promImoveis = (async () => {
        try {
          const raw = await AsyncStorage.getItem("dadosQuarteiroes");
          if (!raw) return;

          let quarteiroes = JSON.parse(raw);

          // cria uma lista de promises para todos os imóveis editados offline
          const promises = [];

          for (let q of quarteiroes) {
            for (let imovel of q.imoveis) {
              if (imovel.editadoOffline) {
                const { editadoOffline, _id, ...dadosParaEnviar } = imovel;

                promises.push(
                  fetch(`${API_URL}/editarImovel/${_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dadosParaEnviar),
                  })
                    .then(async (res) => {
                      if (res.ok) {
                        imovel.editadoOffline = false;
                      } else {
                        console.log(
                          "Erro ao sincronizar imóvel:",
                          await res.text()
                        );
                      }
                    })
                    .catch((err) =>
                      console.error("Erro de rede ao sincronizar imóvel:", err)
                    )
                );
              }
            }
          }

          // espera todas as promises terminarem
          await Promise.all(promises);

          // salva storage atualizado
          await AsyncStorage.setItem(
            "dadosQuarteiroes",
            JSON.stringify(quarteiroes)
          );
        } catch (err) {
          console.error("Erro ao sincronizar imóveis:", err);
        }
      })();

      // 3️⃣ Atualiza todos os quarteirões selecionados em uma única requisição
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

      // 4️⃣ Executa tudo em paralelo
      await Promise.all([...promVisitas, promImoveis, promQuarteiroes]);

      // 5️⃣ Atualiza AsyncStorage das visitas
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

      Alert.alert(
        "Sucesso",
        "Visitas, imóveis e quarteirões foram sincronizados!"
      );
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

  // Agrupar quarteirões por área
  const sections = quarteiroes.reduce((acc, q) => {
    let sec = acc.find((s) => s.title === q.nomeArea);
    if (!sec) {
      sec = { title: q.nomeArea, data: [] };
      acc.push(sec);
    }
    sec.data.push(q);
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

      {/* ---------- A PARTIR DAQUI: nova listagem de quarteirões (mantendo layout) ---------- */}

      <Text style={[styles.titulo, { marginTop: 20 }]}>
        Selecione os quarteirões finalizados:
      </Text>

      {loadingQuarteiroes ? (
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
                        {q.imoveis?.length || 0} imóveis
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
          <Text style={styles.textoBotao}>Sincronizar Visitas</Text>
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
