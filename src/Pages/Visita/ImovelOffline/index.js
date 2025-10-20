import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cabecalho from "../../../Components/Cabecalho";
import { useFocusEffect } from "@react-navigation/native";

export default function ImovelOffline({ route, navigation }) {
  const { quarteirao } = route.params;
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const offline = true;

  // Recarrega os imóveis toda vez que a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const carregarImoveis = async () => {
        setLoading(true);
        try {
          const offlineImoveis = await AsyncStorage.getItem("dadosImoveis");
          if (offlineImoveis) {
            const todos = JSON.parse(offlineImoveis);
            const filtrados = todos.filter(
              (i) => i.idQuarteirao === quarteirao._id
            );
            if (isActive) setImoveis(filtrados);
          } else {
            if (isActive) setImoveis([]);
          }
        } catch (err) {
          console.log("Erro ao carregar imóveis offline:", err);
          if (isActive) setImoveis([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      carregarImoveis();

      return () => {
        isActive = false; // evita setState após unmount
      };
    }, [quarteirao])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#2CA856" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <Text style={{ fontSize: 20, fontWeight: "bold", margin: 10 }}>
        Imóveis do Quarteirão {quarteirao.numero} - {quarteirao.nomeArea}
      </Text>

      {imoveis.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
          Nenhum imóvel encontrado.
        </Text>
      ) : (
        imoveis.map((imovel) => (
          <View
            key={imovel._id}
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderColor: "#ddd",
              backgroundColor: "#fff",
              marginTop: 8,
              borderRadius: 6,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {imovel.logradouro}, {imovel.numero}
              </Text>
              <Text style={{ color: "gray" }}>Status: {imovel.status}</Text>
            </View>

            <View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Visita", {
                    imovel,
                    idArea: quarteirao.idArea,
                    nomeArea: quarteirao.nomeArea,
                    quarteirao,
                  })
                }
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "#2CA856" }}
                >
                  Visitar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditarImovelOffline", {
                    imovel,
                    offline,
                  })
                }
              >
                <Text style={{ color: "#007AFF" }}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
