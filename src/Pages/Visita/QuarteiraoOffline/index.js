import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";

export default function QuarteiraoOffline({ navigation }) {
  const [quarteiroes, setQuarteiroes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados offline (com fallback seguro)
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

  // Baixa dados do backend e mescla com dados locais
  const baixarDados = async () => {
    try {
      const idUsuario = await getId();

      // 🔹 Baixa quarteirões
      const resQ = await fetch(
        `${API_URL}/baixarQuarteiroesResponsavel/${idUsuario}`
      );
      let quarteiroesArray = [];
      if (resQ.ok) {
        const jsonQ = await resQ.json();
        quarteiroesArray = Array.isArray(jsonQ) ? jsonQ : [];
      } else {
        console.warn("Resposta inválida ao baixar quarteirões:", resQ.status);
      }

      // 🔹 Baixa imóveis
      const resI = await fetch(
        `${API_URL}/baixarImoveisResponsavel/${idUsuario}`
      );
      let imoveisArray = [];
      if (resI.ok) {
        const jsonI = await resI.json();
        imoveisArray = Array.isArray(jsonI) ? jsonI : [];
      } else {
        console.warn("Resposta inválida ao baixar imóveis:", resI.status);
      }

      // 🔹 Mescla dados locais (preservando visitas/offline edits)
      const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
      const locais = rawImoveis ? JSON.parse(rawImoveis) : [];
      const locaisArr = Array.isArray(locais) ? locais : [];

      const mesclados = imoveisArray.map((i) => {
        const local = locaisArr.find((l) => l._id === i._id);
        // Se estiver visitado ou editadoOffline, mantém tudo do local
        if (local && (local.status === "visitado" || local.editadoOffline)) {
          return local;
        }
        return i;
      });

      // salva atualizado (mesclado)
      await AsyncStorage.setItem(
        "dadosQuarteiroes",
        JSON.stringify(quarteiroesArray)
      );
      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(mesclados));

      setQuarteiroes(Array.isArray(quarteiroesArray) ? quarteiroesArray : []);
      setImoveis(Array.isArray(mesclados) ? mesclados : []);
    } catch (error) {
      console.log("Erro ao baixar:", error);
      // em caso de erro, tenta carregar do offline (fallback)
      await carregarOffline();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await carregarOffline(); // mostra dados locais rápido
      await baixarDados(); // tenta atualizar (se falhar, já tratamos)
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2CA856" />
      </View>
    );
  }

  // garante que temos arrays
  const qList = Array.isArray(quarteiroes) ? quarteiroes : [];
  const iList = Array.isArray(imoveis) ? imoveis : [];

  // Agrupa quarteirões por área (se algum nome for undefined, usa "Sem Área")
  const sections = qList.reduce((acc, q) => {
    const title = q.nomeArea || "Sem Área";
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
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      {sections.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "gray" }}>
            Nenhum quarteirão atribuido a este agente.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) =>
            item && item._id ? String(item._id) : Math.random().toString()
          }
          renderSectionHeader={({ section }) => (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                backgroundColor: "#eee",
                padding: 5,
              }}
            >
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ padding: 10, borderBottomWidth: 1 }}
              onPress={() =>
                navigation.navigate("ImovelOffline", { quarteirao: item })
              }
            >
              <Text>Quarteirão {item.numero}</Text>
              <Text style={{ color: "gray" }}>{item.qtdImoveis} imóveis</Text>
            </TouchableOpacity>
          )}
          // proteções adicionais (renderEmptyComponent não causa crash)
          ListEmptyComponent={() => (
            <View style={{ padding: 20 }}>
              <Text style={{ color: "gray" }}>
                Nenhum quarteirão encontrado.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
