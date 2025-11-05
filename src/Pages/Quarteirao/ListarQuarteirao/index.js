import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { API_URL } from "./../../../config/config.js";
import ImageViewing from "react-native-image-viewing";
import { useFocusEffect } from "@react-navigation/native";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 1. Importar useSafeAreaInsets

const getIdString = (id) => {
  if (typeof id === "string") {
    return id;
  }
  if (id && typeof id === "object" && id.toString) {
    return id.toString();
  }
  return "";
};

const groupAreas = (areasList) => {
  const groupedData = areasList.reduce((acc, area) => {
    const categoria = (area.categoria || "Outros").toLowerCase();
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push({ type: "item", data: area });
    return acc;
  }, {});

  const finalGrouped = [];

  const order = ["bairro", "povoado"];
  const processedKeys = new Set();

  order.forEach((key) => {
    if (groupedData[key] && groupedData[key].length > 0) {
      const title = key.toUpperCase();
      finalGrouped.push({
        type: "header",
        title: title,
        key: `header-${title}`,
      });
      finalGrouped.push(...groupedData[key]);
      processedKeys.add(key);
    }
  });

  Object.keys(groupedData).forEach((categoria) => {
    if (!processedKeys.has(categoria)) {
      const title = categoria.toUpperCase();
      finalGrouped.push({
        type: "header",
        title: title,
        key: `header-${title}`,
      });
      finalGrouped.push(...groupedData[categoria]);
    }
  });

  return finalGrouped;
};

function Item({ area, navigation, modo, idAgente, funcao, modoI }) {
  const areaCodigo = area.codigo || "";

  const areaNomeFormatado =
    areaCodigo && areaCodigo !== "000"
      ? `${area.nome} - ${areaCodigo}`
      : area.nome;

  const handlePress = () => {
    if (modo === "atribuir") {
      navigation.navigate("AtribuirQuarteirao", {
        idArea: area._id,
        mapaUrl: area.mapaUrl,
        nomeArea: area.nome,
        idAgente: idAgente,
      });
    } else {
      navigation.navigate("ListarQuarteirao", {
        idArea: area._id,
        mapaUrl: area.mapaUrl,
        nomeArea: area.nome,
        funcao,
        modoI,
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text
          style={styles.listItemText}
          numberOfLines={0}
          ellipsizeMode="tail"
        >
          {areaNomeFormatado}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function CadastrarQuarteiraoModal({
  visible,
  onClose,
  idArea,
  nomeArea,
  onCadastroSucesso,
}) {
  // O modal não precisa dos insets, pois o background cobre a tela toda.
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCadastrar() {
    if (!numero) {
      Alert.alert("Erro", "Digite o número do quarteirão.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cadastrarQuarteirao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idArea, numero: Number(numero) }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erro", data.message || "Não foi possível cadastrar.");
      } else {
        Alert.alert(
          "Sucesso",
          `Quarteirão cadastrado: ${data.quarteirao.numero}`
        );
        setNumero("");
        onCadastroSucesso();
        onClose();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Erro ao cadastrar quarteirão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.title}>Cadastrar Quarteirão</Text>
          {nomeArea && (
            <Text style={modalStyles.subtitle}>Área: {nomeArea}</Text>
          )}

          <TextInput
            style={modalStyles.input}
            placeholder="Número do Quarteirão"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={numero}
            onChangeText={setNumero}
          />

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity
              style={modalStyles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.cadastrarButton,
                loading && modalStyles.buttonDisabled,
              ]}
              onPress={handleCadastrar}
              disabled={loading}
            >
              <Text style={modalStyles.cadastrarButtonText}>
                {loading ? <ActivityIndicator color="#fff" /> : "Cadastrar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const FAB_SIZE = height(8); // Definido como constante global para cálculo

export default function Quarteiroes({ route, navigation }) {
  const { idArea, mapaUrl, nomeArea, funcao, modoI, modo } = route.params;
  const insets = useSafeAreaInsets(); // 2. Obter insets

  const [quarteiroes, setQuarteiroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // 3. Calcular a posição bottom ajustada pela safe area + padding base (height(4) original)
  const FAB_BOTTOM_POSITION = insets.bottom + height(4);

  // 4. Calcular o padding inferior da lista para que o último item não seja coberto pelo FAB
  const LIST_BOTTOM_PADDING = insets.bottom + FAB_SIZE + height(3); // Adicionamos uma margem extra de 3vh

  const fetchQuarteiroes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/listarQuarteiroes/${idArea}`);
      const data = await response.json();

      if (response.status === 404) {
        setQuarteiroes([]);
      } else if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar quarteirões");
      } else {
        setQuarteiroes(data);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os quarteirões.");
    } finally {
      setLoading(false);
    }
  }, [idArea]);

  useFocusEffect(
    useCallback(() => {
      fetchQuarteiroes();
    }, [fetchQuarteiroes])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05419A" />
        <Text style={{ marginTop: font(1.5) }}>Carregando quarteirões...</Text>
      </View>
    );
  }

  const listData = [
    { type: "mapa", key: "mapaUrl", data: { mapaUrl: mapaUrl } },
    ...quarteiroes.map((q) => ({
      type: "quarteirao",
      key: getIdString(q._id),
      data: q,
    })),
  ];

  const renderListItem = ({ item }) => {
    if (item.type === "mapa") {
      return (
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={styles.mapaButton}
          accessibilityLabel="Visualizar Mapa da Área"
        >
          <Icon
            name="map-o"
            size={font(3)}
            color="#fff"
            style={styles.mapaIcon}
          />
          <Text style={styles.mapaButtonText}>MAPA DA ÁREA</Text>
        </TouchableOpacity>
      );
    } else if (item.type === "quarteirao") {
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("ListarImovel", {
              quarteirao: item.data,
              idArea,
              nomeArea,
              modoI,
              funcao,
              modo,
            })
          }
        >
          <Icon
            name="map-marker"
            size={font(3.5)}
            color="#05419A"
            style={styles.quarteiraoIcon}
          />
          <Text style={styles.itemTitle}>QUARTEIRÃO {item.data.numero}</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />

      <View style={styles.areaTitleContainer}>
        {nomeArea && (
          <Text style={styles.areaTitleText}>{nomeArea.toUpperCase()}</Text>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderListItem}
        // 5. Aplicar o padding inferior dinâmico na FlatList
        contentContainerStyle={[
          styles.flatListContent,
          funcao === "adm" && { paddingBottom: LIST_BOTTOM_PADDING } // Aplica apenas se o FAB estiver visível
        ]}
        ListEmptyComponent={
          !loading &&
          !error && (
            <Text style={styles.empty}>
              Nenhum quarteirão cadastrado para esta área.
            </Text>
          )
        }
      />

      {funcao === "adm" && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          // 6. Aplicar o estilo dinâmico de posição bottom
          style={[styles.fabButton, { bottom: FAB_BOTTOM_POSITION }]}
          accessibilityLabel="Adicionar novo quarteirão"
        >
          <Icon name="plus" size={font(5)} color="#fff" />
        </TouchableOpacity>
      )}

      <ImageViewing
        images={[{ uri: mapaUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

      <CadastrarQuarteiraoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        idArea={idArea}
        nomeArea={nomeArea}
        onCadastroSucesso={fetchQuarteiroes}
      />
    </View>
  );
}

const modalStyles = StyleSheet.create({
  // ... (Estilos do modal omitidos para brevidade)
  // (Os estilos do modal não foram alterados, pois já estavam fora do escopo de safe area)
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: width(85),
    backgroundColor: "white",
    borderRadius: width(3),
    padding: width(6),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: font(3.5),
    fontWeight: "bold",
    color: "#05419A",
    marginBottom: height(1.5),
    textAlign: "center",
  },
  subtitle: {
    fontSize: font(2.2),
    color: "#05419A",
    marginBottom: height(3),
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#05419A",
    borderRadius: width(2),
    paddingHorizontal: width(3),
    paddingVertical: height(1.5),
    fontSize: font(2.25),
    marginBottom: height(3),
    width: "100%",
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cadastrarButton: {
    backgroundColor: "#05419A",
    paddingVertical: height(1.5),
    borderRadius: width(2),
    alignItems: "center",
    flex: 1,
    marginLeft: width(2),
  },
  cadastrarButtonText: {
    color: "#fff",
    fontSize: font(2.25),
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: height(1.5),
    borderRadius: width(2),
    alignItems: "center",
    flex: 1,
    marginRight: width(2),
  },
  cancelButtonText: {
    color: "#000",
    fontSize: font(2.2),
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#A9A9A9",
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: height(2),
    fontSize: font(2),
  },
  empty: {
    fontSize: font(2.5),
    color: "gray",
    textAlign: "center",
    marginTop: height(3),
    paddingHorizontal: width(5),
  },

  areaTitleContainer: {
    paddingVertical: height(2.5),
    alignItems: "center",
  },
  areaTitleText: {
    fontSize: font(4),
    color: "#05419A",
  },

  flatListContent: {
    flexGrow: 1, // Mantido para permitir rolagem quando houver itens
    // paddingBottom será ajustado dinamicamente
  },
  mapaButton: {
    backgroundColor: "#05419A",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height(2),
    paddingHorizontal: width(4),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  mapaIcon: {
    marginRight: width(4),
  },
  mapaButtonText: {
    fontSize: font(2.5),
    fontWeight: "bold",
    color: "#fff",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eeededff",
    paddingVertical: height(2.25),
    paddingHorizontal: width(4),
    borderBottomWidth: 1,
    borderBottomColor: "#05419A",
  },
  quarteiraoIcon: {
    marginRight: width(4),
  },
  itemTitle: {
    fontSize: font(2.8),
    fontWeight: "bold",
    color: "#05419A",
  },
  fabButton: {
    position: "absolute",
    width: FAB_SIZE, // Usa a constante definida
    height: FAB_SIZE, // Usa a constante definida
    alignItems: "center",
    justifyContent: "center",
    right: width(6),
    // bottom: height(4), // Removido valor fixo
    backgroundColor: "#05419A",
    borderRadius: FAB_SIZE / 2,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
});