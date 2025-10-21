import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import { getId, getNome } from "../../../utils/tokenStorage.js";

export default function AtualizarQuarteiroes({ navigation }) {
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const id = await getId();
        setUsuarioId(id);

        // 🔹 Busca quarteirões do usuário direto do backend
        const res = await fetch(
          `${API_URL}/baixarQuarteiroesResponsavel/${id}`
        );
        if (!res.ok) throw new Error("Falha ao baixar quarteirões");
        const listaQ = await res.json();

        setQuarteiroes(Array.isArray(listaQ) ? listaQ : []);
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível carregar os quarteirões.");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const enviarQuarteiroes = async () => {
    if (selected.length === 0) {
      Alert.alert(
        "Atenção",
        "Selecione ao menos um quarteirão para atualizar."
      );
      return;
    }

    Alert.alert(
      "Confirmar",
      "Deseja realmente finalizar os quarteirões selecionados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/atualizarQuarteiroes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ids: selected,
                  trabalhadoPor: usuarioId,
                }),
              });

              const data = await res.json();

              if (res.ok) {
                Alert.alert(
                  "Sucesso",
                  `Quarteirões atualizados: ${data.quarteiroesAtualizados}`
                );

                setQuarteiroes((prev) =>
                  prev.map((q) =>
                    selected.includes(q._id) ? { ...q, finalizado: true } : q
                  )
                );

                setSelected([]);
              } else {
                Alert.alert(
                  "Erro",
                  data.message || "Falha ao atualizar quarteirões."
                );
              }
            } catch (err) {
              console.error(err);
              Alert.alert("Erro", "Não foi possível enviar os quarteirões.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2CA856" />
      </View>
    );
  }

  // 🔹 Agrupa quarteirões por área (igual QuarteiraoOffline)
  const sections = quarteiroes.reduce((acc, q) => {
    const title = q.nomeArea || q.idArea?.nome || "Sem Área";
    let sec = acc.find((s) => s.title === title);
    if (!sec) {
      sec = { title, data: [] };
      acc.push(sec);
    }
    sec.data.push(q);
    return acc;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          margin: 20,
          marginBottom: 10,
        }}
      >
        Atualizar Quarteirões
      </Text>

      {sections.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "gray" }}>
            Nenhum quarteirão atribuído a você.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item._id)}
          renderSectionHeader={({ section }) => (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                backgroundColor: "#eee",
                padding: 8,
                marginTop: 5,
              }}
            >
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => {
            const sel = selected.includes(item._id);
            return (
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: "#ddd",
                  backgroundColor: sel ? "#c8e6c9" : "#fff",
                }}
                onPress={() => toggleSelect(item._id)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text>Quarteirão {item.numero}</Text>
                    <Text style={{ color: "gray" }}>
                      {item.finalizado ? "Finalizado ✅" : ""}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18 }}>{sel ? "✓" : ""}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          margin: 20,
        }}
        onPress={enviarQuarteiroes}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Atualizar Quarteirões
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: "#2196F3",
          padding: 15,
          borderRadius: 8,
          alignItems: "center",
          marginHorizontal: 20,
          marginBottom: 20,
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Voltar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
