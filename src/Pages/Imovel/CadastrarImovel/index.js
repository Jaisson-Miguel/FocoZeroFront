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
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Cabecalho from "../../../Components/Cabecalho.js";
import { API_URL } from "../../../config/config.js";
import { height, width, font } from "../../../utils/responsive.js";

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
      const formData = {
        ...form,
        posicao: Number(form.posicao),
        qtdHabitantes: Number(form.qtdHabitantes) || 0,
        qtdCachorros: Number(form.qtdCachorros) || 0,
        qtdGatos: Number(form.qtdGatos) || 0,
      };

      const response = await fetch(`${API_URL}/cadastrarImovel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
    <View style={styles.mainContainer}>
      <Cabecalho navigation={navigation} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Cadastrar Imóvel</Text>

          <Text style={styles.label}>Quarteirão:</Text>
          <Text style={styles.value}>{numeroQuarteirao}</Text>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.selectPositionButton}
          >
            <Text style={styles.selectPositionText}>Selecionar posição</Text>
          </TouchableOpacity>

          <Text style={styles.selectedPosition}>
            {posicao !== null
              ? posicao === 0
                ? `Primeiro da lista`
                : `${
                    imoveis.find((i) => i.posicao === posicao - 1)
                      ?.logradouro || ""
                  }, ${
                    imoveis.find((i) => i.posicao === posicao - 1)?.numero || ""
                  }`
              : "Nenhuma posição escolhida ainda"}
          </Text>

          {/* Modal de seleção */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  Escolha depois de qual imóvel adicionar:
                </Text>

                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setPosicao(0);
                    setForm({ ...form, posicao: 0 });
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>Primeiro da lista</Text>
                </TouchableOpacity>

                <FlatList
                  data={imoveis}
                  keyExtractor={(item) => String(item._id)}
                  renderItem={({ item }) => {
                    const novaPosicao = (item.posicao || 0) + 1;
                    return (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setPosicao(novaPosicao);
                          setForm({ ...form, posicao: novaPosicao });
                          // console.log("Imóvel selecionado:", item);
                          console.log("Nova posição:", novaPosicao);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>
                          {item.logradouro}, {item.numero}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />

                <Button
                  title="Cancelar"
                  onPress={() => setModalVisible(false)}
                  styles={{color:"red"}}
                />
              </View>
            </View>
          </Modal>

          <TextInput
            style={styles.input}
            placeholder="Logradouro"
            placeholderTextColor="#666"
            value={form.logradouro}
            onChangeText={(v) => handleChange("logradouro", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Número"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.numero}
            onChangeText={(v) => handleChange("numero", v)}
          />

          <View
            style={[
              styles.dropdownContainer,
              form.tipo === "" && styles.dropdownPlaceholder,
            ]}
          >
            <Picker
              selectedValue={form.tipo}
              style={styles.pickerStyle}
              onValueChange={(v) => handleChange("tipo", v)}
              mode="dropdown"
            >
              <Picker.Item
                label="Selecione o tipo"
                value=""
                color={form.tipo ? "#000" : "#666"}
              />
              <Picker.Item label="Residencial" value="r" />
              <Picker.Item label="Comércio" value="c" />
              <Picker.Item label="Terreno baldio" value="tb" />
              <Picker.Item label="Ponto estratégico" value="pe" />
              <Picker.Item label="Outro" value="out" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Qtd. Habitantes"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.qtdHabitantes}
            onChangeText={(v) => handleChange("qtdHabitantes", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Qtd. Cachorros"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.qtdCachorros}
            onChangeText={(v) => handleChange("qtdCachorros", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Qtd. Gatos"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.qtdGatos}
            onChangeText={(v) => handleChange("qtdGatos", v)}
          />

          <TextInput
            style={[styles.input, { height: height(10) }]}
            placeholder="Observação"
            placeholderTextColor="#666"
            multiline
            value={form.observacao}
            onChangeText={(v) => handleChange("observacao", v)}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Salvar Imóvel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width(5),
    paddingVertical: height(2),
    backgroundColor: "#fff",
  },
  title: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textAlign: "center",
    marginBottom: height(3),
  },
  label: { fontSize: font(2.25), color: "#05419A", fontWeight: "600" },
  value: { fontSize: font(2), color: "#333", marginBottom: height(1.5) },
  selectPositionButton: {
    backgroundColor: "#05419A",
    paddingVertical: height(1.2),
    borderRadius: width(2),
    alignItems: "center",
    marginBottom: height(1.5),
  },
  selectPositionText: { color: "#fff", fontWeight: "bold", fontSize: font(2) },
  selectedPosition: {
    color: "#333",
    fontSize: font(2),
    marginBottom: height(2),
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: width(3),
    padding: 15,
  },
  modalTitle: {
    fontSize: font(2.5),
    fontWeight: "bold",
    marginBottom: 10,
    color: "#05419A",
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalItemText: {
    fontSize: font(2),
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#05419A",
    borderRadius: width(2),
    paddingHorizontal: width(3),
    paddingVertical: height(1.5),
    fontSize: font(2.25),
    marginBottom: height(2),
    color: "#000",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#05419A",
    borderRadius: width(2),
    marginBottom: height(2),
    justifyContent: "center",
    height: height(6.5),
  },
  pickerStyle: {
    height: height(6.5),
    width: "100%",
    ...Platform.select({ android: { paddingHorizontal: width(2) } }),
  },
  button: {
    backgroundColor: "#05419A",
    paddingVertical: height(2),
    borderRadius: width(2),
    alignItems: "center",
    marginTop: height(2),
  },
  buttonText: { color: "#fff", fontSize: font(2.5), fontWeight: "bold" },
});
