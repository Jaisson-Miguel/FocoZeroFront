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

  const carregarOffline = async () => {
    try {
      const offlineQuarteiroes = await AsyncStorage.getItem("dadosQuarteiroes");
      const offlineImoveis = await AsyncStorage.getItem("dadosImoveis");

      if (offlineQuarteiroes) setQuarteiroes(JSON.parse(offlineQuarteiroes));
      if (offlineImoveis) setImoveis(JSON.parse(offlineImoveis));

      setLoading(false);
    } catch (err) {
      console.log("Erro ao carregar offline:", err);
    }
  };

  const baixarDados = async () => {
    try {
      const idUsuario = await getId();

      // Baixa quarteirões
      const resQ = await fetch(
        `${API_URL}/baixarQuarteiroesResponsavel/${idUsuario}`
      );
      const jsonQ = await resQ.json();
      await AsyncStorage.setItem("dadosQuarteiroes", JSON.stringify(jsonQ));

      // Baixa imóveis
      const resI = await fetch(
        `${API_URL}/baixarImoveisResponsavel/${idUsuario}`
      );
      const jsonI = await resI.json();
      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(jsonI));

      setQuarteiroes(jsonQ);
      setImoveis(jsonI);
    } catch (error) {
      console.log("Erro ao baixar:", error);
      await carregarOffline();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await carregarOffline(); // Mostra offline rápido
      await baixarDados(); // Tenta atualizar em background
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#2CA856" />;
  }

  // Agrupa por área
  const sections = quarteiroes.reduce((acc, q) => {
    let sec = acc.find((s) => s.title === q.nomeArea);
    if (!sec) {
      sec = { title: q.nomeArea, data: [] };
      acc.push(sec);
    }
    // Conta quantos imóveis esse quarteirão tem
    const qtdImoveis = imoveis.filter((i) => i.idQuarteirao === q._id).length;
    sec.data.push({ ...q, qtdImoveis });
    return acc;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
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
      />
    </View>
  );
}
