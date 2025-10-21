import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/MaterialIcons"; // Ícone de localização removido

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
    setLoading(true); // Opcional: Mostra o loading ao iniciar o download
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
      // O baixarDados foi mantido, pois faz parte da sua lógica original,
      // mas o FAB foi removido da UI.
      await baixarDados(); 
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA856" />
      </View>
    );
  }

  // garante que temos arrays
  const qList = Array.isArray(quarteiroes) ? quarteiroes : [];
  const iList = Array.isArray(imoveis) ? imoveis : [];

  // Agrupa quarteirões por área
  const sections = qList.reduce((acc, q) => {
    const title = q.nomeArea || "SEM ÁREA DEFINIDA";
    let sec = acc.find((s) => s.title === title);
    if (!sec) {
      sec = { title, data: [] };
      acc.push(sec);
    }
    const qtdImoveis = iList.filter((i) => i.idQuarteirao === q._id).length;
    // Usamos o nomeArea como title da seção e o numero do quarteirão no item.
    sec.data.push({ ...q, qtdImoveis }); 
    return acc;
  }, []);

  return (
    <View style={styles.container}>
      <Cabecalho navigation={navigation} />

      {/* Título Principal */}
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
              const areaNome = (item?.nomeArea || "NOME INDEFINIDO").toUpperCase();
              const numero =
                item?.numero !== undefined && item?.numero !== null
                  ? String(item.numero).padStart(2, "0")
                  : "00";

              const textoFinal = `${areaNome} - ${numero}`;

              return (
                <TouchableOpacity
                  style={styles.listItemContainer}
                  onPress={() =>
                    navigation.navigate("ImovelOffline", { quarteirao: item })
                  }
                >
                  <View>
            <Text
              style={{
                fontSize: 20,
                color: "black",
                fontWeight: "bold",
              }}
            >
              {textoFinal}
            </Text>
          </View>

                </TouchableOpacity>
              );
            } catch (e) {
              console.log("Erro ao renderizar item:", e);
              return null;
            }
          }}


// ...
          ListEmptyComponent={() => (
            <View style={styles.listEmptyContainer}>
              <Text style={styles.listEmptyText}>
                Nenhum quarteirão encontrado.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Fundo branco
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: "center",
  },
  
  // --- Título Principal (QUARTEIRÕES DO DIA) ---
  headerTitleContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff", 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#274F8B", // Azul escuro
    textAlign: "center",
  },

  // --- Item da Lista (Linha de Quarteirão) ---
listItemContainer: {
  flexDirection: "row", // garante que o texto fique na mesma linha
  alignItems: "center", // centraliza verticalmente
  justifyContent: "flex-start",
  paddingVertical: 18,
  paddingHorizontal: 20,
  backgroundColor: "#F4F7F9",
  borderBottomWidth: 1,
  borderBottomColor: "#CDCDCD",
  width: "100%", // evita corte
},

listItemText: {
  fontSize: 17,
  color: "#333333", // cor bem visível
  fontWeight: "600",
  includeFontPadding: false,
  textAlignVertical: "center",
},
  // --- Estados Vazios ---
  emptyContainer: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16, 
    color: "gray",
  },
  listEmptyContainer: {
    padding: 20,
  },
  listEmptyText: {
    color: "gray",
  },
});