import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { getId } from "../../../utils/tokenStorage.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Visita({ route, navigation }) {
  const { imovel, idArea, nomeArea, quarteirao } = route.params;
  const [agenteId, setAgenteId] = useState(null);

  useEffect(() => {
    const fetchNome = async () => {
      const userId = await getId();
      if (userId) setAgenteId(userId);
    };
    fetchNome();
  }, []);

  const [form, setForm] = useState({
    depositosInspecionados: {
      a1: "",
      a2: "",
      b: "",
      c: "",
      d1: "",
      d2: "",
      e: "",
    },
    qtdDepEliminado: "",
    foco: null, // null no início
    qtdLarvicida: "",
    qtdDepTratado: "",
  });

  const handleChange = (campo, valor) => {
    setForm({ ...form, [campo]: valor });
  };

  const handleDepositoChange = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      depositosInspecionados: {
        ...prev.depositosInspecionados,
        [campo]: valor,
      },
    }));
  };

  const salvarVisita = async () => {
    if (!agenteId) {
      Alert.alert("Erro", "ID do agente não carregado ainda.");
      return;
    }
    try {
      const visita = {
        idImovel: imovel._id,
        idAgente: agenteId,
        idArea: idArea,
        idQuarteirao: quarteirao._id,
        tipo: imovel.tipo,
        dataVisita: new Date(),
        depositosInspecionados: {
          a1: Number(form.depositosInspecionados.a1) || 0,
          a2: Number(form.depositosInspecionados.a2) || 0,
          b: Number(form.depositosInspecionados.b) || 0,
          c: Number(form.depositosInspecionados.c) || 0,
          d1: Number(form.depositosInspecionados.d1) || 0,
          d2: Number(form.depositosInspecionados.d2) || 0,
          e: Number(form.depositosInspecionados.e) || 0,
        },
        qtdDepEliminado: Number(form.qtdDepEliminado),
        foco: form.foco === true, // salva como boolean
        qtdLarvicida: Number(form.qtdLarvicida),
        qtdDepTratado: Number(form.qtdDepTratado),
        sincronizado: false,
        // status: "visitado",
        nomeArea: nomeArea,
        nomeQuarteirao: quarteirao.numero,
        logradouro: imovel.logradouro,
        numero: imovel.numero,
      };

      const visitasSalvas = await AsyncStorage.getItem("visitas");
      const lista = visitasSalvas ? JSON.parse(visitasSalvas) : [];

      lista.push(visita);
      await AsyncStorage.setItem("visitas", JSON.stringify(lista));

      // 🔹 Atualiza o imóvel no AsyncStorage para status: "visitado"
      const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
      if (rawImoveis) {
        let listaImoveis = JSON.parse(rawImoveis);
        listaImoveis = listaImoveis.map((i) =>
          i._id === imovel._id
            ? { ...i, status: "visitado", editadoOffline: true }
            : i
        );
        await AsyncStorage.setItem(
          "dadosImoveis",
          JSON.stringify(listaImoveis)
        );
      }

      Alert.alert("Sucesso", "Visita salva localmente!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a visita localmente.");
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registrar Visita</Text>
      <Text style={styles.subtitulo}>
        Imóvel: {imovel.logradouro}, {imovel.numero}
      </Text>

      {["a1", "a2", "b", "c", "d1", "d2", "e"].map((campo) => (
        <TextInput
          key={campo}
          style={styles.input}
          placeholder={campo.toUpperCase()}
          keyboardType="numeric"
          value={form.depositosInspecionados[campo]}
          onChangeText={(v) => handleDepositoChange(campo, v)}
        />
      ))}

      <TextInput
        style={styles.input}
        placeholder="Qtd. Depósitos Eliminados"
        keyboardType="numeric"
        value={form.qtdDepEliminado}
        onChangeText={(v) => handleChange("qtdDepEliminado", v)}
      />

      {/* Botões de seleção para Foco */}
      <Text style={styles.label}>Houve foco?</Text>
      <View style={styles.opcoesContainer}>
        <TouchableOpacity
          style={[
            styles.opcaoBotao,
            form.foco === true && styles.opcaoSelecionada,
          ]}
          onPress={() => handleChange("foco", true)}
        >
          <Text
            style={[
              styles.opcaoTexto,
              form.foco === true && styles.opcaoTextoSelecionado,
            ]}
          >
            Sim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.opcaoBotao,
            form.foco === false && styles.opcaoSelecionada,
          ]}
          onPress={() => handleChange("foco", false)}
        >
          <Text
            style={[
              styles.opcaoTexto,
              form.foco === false && styles.opcaoTextoSelecionado,
            ]}
          >
            Não
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Qtd. de Larvicida"
        keyboardType="numeric"
        value={form.qtdLarvicida}
        onChangeText={(v) => handleChange("qtdLarvicida", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Qtd. Depósitos Tratados"
        keyboardType="numeric"
        value={form.qtdDepTratado}
        onChangeText={(v) => handleChange("qtdDepTratado", v)}
      />

      <TouchableOpacity style={styles.botao} onPress={salvarVisita}>
        <Text style={styles.textoBotao}>Salvar Visita</Text>
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
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  opcoesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  opcaoBotao: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  opcaoSelecionada: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  opcaoTexto: {
    fontSize: 16,
    color: "#333",
  },
  opcaoTextoSelecionado: {
    color: "#fff",
    fontWeight: "bold",
  },
  botao: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
