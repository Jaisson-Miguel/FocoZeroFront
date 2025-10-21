import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";
import Cabecalho from "../../../Components/Cabecalho.js";

export default function ListarVisitas({ navigation }) {
  const [visitas, setVisitas] = useState([]);

  useEffect(() => {
    const carregarVisitas = async () => {
      try {
        const visitasSalvas = await AsyncStorage.getItem("visitas");
        if (visitasSalvas) {
          setVisitas(JSON.parse(visitasSalvas));
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar as visitas.");
        console.error(error);
      }
    };

    const unsubscribe = navigation.addListener("focus", carregarVisitas);
    return unsubscribe;
  }, [navigation]);

  // Agrupar por área e quarteirão
  const agrupadas = {};
  visitas.forEach((v) => {
    if (!agrupadas[v.nomeArea]) agrupadas[v.nomeArea] = {};
    if (!agrupadas[v.nomeArea][v.nomeQuarteirao])
      agrupadas[v.nomeArea][v.nomeQuarteirao] = [];
    agrupadas[v.nomeArea][v.nomeQuarteirao].push(v);
  });

  const limparVisitas = async () => {
    try {
      await AsyncStorage.removeItem("visitas");
      setVisitas([]);
      Alert.alert("Sucesso", "Visitas removidas com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível limpar as visitas.");
      console.error(error);
    }
  };

  const finalizarDiario = async () => {
    try {
      const visitasSalvas = await AsyncStorage.getItem("visitas");
      const listaVisitas = visitasSalvas ? JSON.parse(visitasSalvas) : [];
      const pendentes = listaVisitas.filter((v) => !v.sincronizado);

      const imoveisSalvos = await AsyncStorage.getItem("dadosImoveis");
      const listaImoveis = imoveisSalvos ? JSON.parse(imoveisSalvos) : [];
      const imoveisEditados = listaImoveis.filter((i) => i.editadoOffline);

      // ⚠️ Se houver algo pendente, bloqueia o acesso
      if (pendentes.length > 0 || imoveisEditados.length > 0) {
        Alert.alert(
          "Atenção",
          "Existem visitas ou imóveis pendentes de sincronização. Sincronize antes de finalizar o diário."
        );
        return;
      }

      // ✅ Tudo sincronizado → perguntar se finalizou algum quarteirão
      Alert.alert(
        "Finalizar Diário",
        "Você finalizou algum quarteirão?",
        [
          {
            text: "Não",
            onPress: () => navigation.navigate("ResumoDiario"),
            style: "cancel",
          },
          {
            text: "Sim",
            onPress: () => navigation.navigate("AtualizarQuarteirao"),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível finalizar o diário.");
    }
  };

  const sincronizarTudo = async () => {
    try {
      // Visitas pendentes
      const visitasSalvas = await AsyncStorage.getItem("visitas");
      const listaVisitas = visitasSalvas ? JSON.parse(visitasSalvas) : [];
      const pendentes = listaVisitas.filter((v) => !v.sincronizado);

      // Imóveis editados
      const imoveisSalvos = await AsyncStorage.getItem("dadosImoveis");
      const listaImoveis = imoveisSalvos ? JSON.parse(imoveisSalvos) : [];
      const imoveisEditados = listaImoveis.filter((i) => i.editadoOffline);

      if (pendentes.length === 0 && imoveisEditados.length === 0) {
        Alert.alert("Aviso", "Nenhuma alteração para sincronizar.");
        return;
      }

      // 🔹 Sincroniza visitas
      await Promise.all(
        pendentes.map(async (v) => {
          try {
            const { sincronizado, ...dadosParaEnviar } = v;
            const res = await fetch(`${API_URL}/cadastrarVisita`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dadosParaEnviar),
            });
            if (res.ok) v.sincronizado = true;
          } catch (err) {
            console.error("Erro ao sincronizar visita:", err);
          }
        })
      );

      // 🔹 Sincroniza imóveis
      await Promise.all(
        imoveisEditados.map(async (i) => {
          const { editadoOffline, _id, ...dadosParaEnviar } = i;
          try {
            const res = await fetch(`${API_URL}/editarImovel/${_id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dadosParaEnviar),
            });
            if (res.ok) i.editadoOffline = false;
          } catch (err) {
            console.error("Erro rede imóvel:", err);
          }
        })
      );

      // Atualiza AsyncStorage
      await AsyncStorage.setItem("visitas", JSON.stringify(listaVisitas));
      await AsyncStorage.setItem("dadosImoveis", JSON.stringify(listaImoveis));

      // Atualiza state
      setVisitas(listaVisitas);

      Alert.alert("Sucesso", "Sincronização concluída!");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha na sincronização.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <ScrollView style={styles.container}>
        {Object.keys(agrupadas).length === 0 ? (
          <Text style={styles.msg}>Nenhuma visita salva ainda.</Text>
        ) : (
          Object.keys(agrupadas).map((nomeArea) => (
            <View key={nomeArea} style={styles.areaBox}>
              <Text style={styles.areaTitulo}>{nomeArea}:</Text>
              {Object.keys(agrupadas[nomeArea]).map((nomeQuarteirao) => (
                <View key={nomeQuarteirao} style={styles.quarteiraoBox}>
                  <Text style={styles.quarteiraoTitulo}>
                    Quarteirão {nomeQuarteirao}:
                  </Text>
                  {agrupadas[nomeArea][nomeQuarteirao].map((v, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() =>
                        navigation.navigate("DetalhesVisita", { visita: v })
                      }
                    >
                      <Text style={styles.logradouro}>
                        {v.logradouro}, {v.numero} ({v.tipo}){" "}
                        {v.sincronizado ? "✅" : "⏳"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#2196F3" }]}
          onPress={sincronizarTudo}
        >
          <Text style={styles.textoBotao}>Sincronizar Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#2196F3" }]}
          onPress={finalizarDiario}
        >
          <Text style={styles.textoBotao}>Finalizar Diário</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#f44336" }]}
          onPress={limparVisitas}
        >
          <Text style={styles.textoBotao}>Limpar Visitas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: "#4CAF50" }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoBotao}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  areaBox: {
    marginBottom: 15,
  },
  areaTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  quarteiraoBox: {
    paddingLeft: 15,
    marginBottom: 10,
  },
  quarteiraoTitulo: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
  },
  logradouro: {
    paddingLeft: 15,
    fontSize: 14,
    marginBottom: 2,
  },
  msg: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },
  botao: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
