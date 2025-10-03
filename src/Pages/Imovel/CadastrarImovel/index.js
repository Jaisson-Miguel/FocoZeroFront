import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Button,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { API_URL } from "./../../../config/config.js";
import { Picker } from "@react-native-picker/picker";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width } from "../../../utils/responsive.js";

export default function CadastrarImovel({ route, navigation }) {
  const { idQuarteirao, numeroQuarteirao, imoveis } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [posicao, setPosicao] = useState(null);
  const [form, setForm] = useState({
    idQuarteirao: idQuarteirao || "",
    posicao: "",
    logradouro: "",
    numero: "",
    tipo: "",
    qtdHabitantes: "",
    qtdCachorros: "",
    qtdGatos: "",
    observacao: "",
  });

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    try {
      const response = await fetch(`${API_URL}/cadastrarImovel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert(
          "Erro",
          data.message || "Falha ao cadastrar imóvel."
        );
      }

      Alert.alert("Sucesso", "Imóvel cadastrado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível cadastrar o imóvel.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", alignItems: "center" }}>
      <Cabecalho navigation={navigation} />
      <KeyboardAvoidingView
        style={{
          flex: 1,
          width: width(100),
        }}
        behavior="height"
        // keyboardVerticalOffset={2}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Cadastrar Imóvel</Text>

            <Text>Quarteirão: {numeroQuarteirao}</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text>Depois de...</Text>
            </TouchableOpacity>

            <Text>
              {posicao !== null
                ? posicao === "Primeiro"
                  ? `Primeiro da Lista`
                  : `${imoveis[posicao].logradouro}, ${imoveis[posicao].numero}`
                : "Nenhuma posição escolhida ainda"}
            </Text>

            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent={true}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <View
                  style={{
                    margin: 20,
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 15,
                  }}
                >
                  <Text style={{ fontSize: 18, marginBottom: 10 }}>
                    Escolha depois de qual imóvel adicionar:
                  </Text>

                  <TouchableOpacity
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#ccc",
                    }}
                    onPress={() => {
                      setPosicao("Primeiro");
                      setForm({ ...form, posicao: 0 });
                      setModalVisible(false);
                    }}
                  >
                    <Text>Primeiro</Text>
                  </TouchableOpacity>
                  <FlatList
                    data={imoveis}
                    keyExtractor={(item, index) => String(item._id || index)}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#ccc",
                        }}
                        onPress={() => {
                          setPosicao(index);
                          setForm({ ...form, posicao: index + 1 });
                          setModalVisible(false);
                        }}
                      >
                        <Text>
                          {item.logradouro}, {item.numero}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />

                  <Button
                    title="Cancelar"
                    onPress={() => setModalVisible(false)}
                  />
                </View>
              </View>
            </Modal>

            <TextInput
              style={styles.input}
              placeholder="Logradouro"
              value={form.logradouro}
              onChangeText={(v) => handleChange("logradouro", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Número"
              keyboardType="numeric"
              value={form.numero}
              onChangeText={(v) => handleChange("numero", v)}
            />
            <Picker
              selectedValue={form.tipo}
              style={styles.input}
              onValueChange={(v) => handleChange("tipo", v)}
            >
              <Picker.Item label="Selecione o tipo" value="" />
              <Picker.Item label="Residencial" value="r" />
              <Picker.Item label="Comércio" value="c" />
              <Picker.Item label="Terreno baldio" value="tb" />
              <Picker.Item label="Ponto estratégico" value="pe" />
              <Picker.Item label="Outro" value="out" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Qtd. Habitantes"
              keyboardType="numeric"
              value={form.qtdHabitantes}
              onChangeText={(v) => handleChange("qtdHabitantes", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Qtd. Cachorros"
              keyboardType="numeric"
              value={form.qtdCachorros}
              onChangeText={(v) => handleChange("qtdCachorros", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Qtd. Gatos"
              keyboardType="numeric"
              value={form.qtdGatos}
              onChangeText={(v) => handleChange("qtdGatos", v)}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Observação"
              multiline
              value={form.observacao}
              onChangeText={(v) => handleChange("observacao", v)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#05419A",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#05419A",
    padding: 15,
    borderRadius: 10,
    marginBottom: height(5),
    alignItems: "center",
    width: width(90),
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
