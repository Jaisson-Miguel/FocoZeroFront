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
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarOffline = async () => {
    const offline = await AsyncStorage.getItem("dadosQuarteiroes");
    if (offline) {
      setDados(JSON.parse(offline));
      setLoading(false); // já mostra o offline
    }
  };

  const baixarDados = async () => {
    try {
      const idUsuario = await getId();
      const response = await fetch(
        `${API_URL}/baixarQuarteiroesResponsavel/${idUsuario}`
      );
      if (!response.ok) throw new Error("Erro ao buscar no servidor");
      const json = await response.json();

      await AsyncStorage.setItem("dadosQuarteiroes", JSON.stringify(json));
      setDados(json);
    } catch (error) {
      console.log("Erro ao baixar:", error);
      // se não conseguir, garante que pelo menos o offline esteja mostrado
      await carregarOffline();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await carregarOffline(); // mostra offline rápido
      await baixarDados(); // tenta atualizar em background
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#2CA856" />;
  }

  const sections = dados.reduce((acc, q) => {
    let sec = acc.find((s) => s.title === q.nomeArea);
    if (!sec) {
      sec = { title: q.nomeArea, data: [] };
      acc.push(sec);
    }
    sec.data.push(q);
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
            <Text style={{ color: "gray" }}>{item.imoveis.length} imóveis</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
