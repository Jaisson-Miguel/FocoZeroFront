import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFuncao } from "../../../utils/tokenStorage.js";
import { useFocusEffect } from "@react-navigation/native";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";

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
    acc[categoria].push({
      type: "item",
      data: area,
      key: getIdString(area._id),
    });
    return acc;
  }, {});

  const finalGrouped = [];

  const order = ["bairro", "povoado"];
  const processedKeys = new Set();
  let headerCounter = 0;

  order.forEach((key) => {
    if (groupedData[key] && groupedData[key].length > 0) {
      const title = key.toUpperCase();
      finalGrouped.push({
        type: "header",
        title: title,
        key: `header-${headerCounter++}`,
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
        key: `header-${headerCounter++}`,
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

export default function ListarArea({ route, navigation }) {
  const { modo, idAgente, idUsuario, modoI } = route.params;
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [funcao, setFuncao] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchAreas = async () => {
        setLoading(true);
        const userFuncao = await getFuncao();
        if (userFuncao) setFuncao(userFuncao);

        try {
          const response = await fetch(`${API_URL}/listarAreas`);
          const data = await response.json();

          if (!response.ok) {
            Alert.alert("Erro", data.message || "Falha ao carregar áreas");
            return;
          }

          let areasFiltradas = data;

          if (userFuncao === "agente" && idUsuario) {
            areasFiltradas = data.filter(
              (area) => area.idResponsavel === idUsuario
            );
          }

          setAreas(areasFiltradas);
        } catch (error) {
          Alert.alert("Erro", "Não foi possível conectar ao servidor");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchAreas();
    }, [])
  );

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      return (
        <View style={styles.groupHeaderContainer}>
          <Text style={styles.groupHeader}>{item.title}</Text>
        </View>
      );
    }
    return (
      <Item
        area={item.data}
        navigation={navigation}
        modo={modo}
        idAgente={idAgente}
        funcao={funcao}
        modoI={modoI}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#05419A" />
        <Text style={{ marginTop: font(1.5) }}>Carregando áreas...</Text>
      </View>
    );
  }

  const groupedAreas = groupAreas(areas);

  return (
    <View style={styles.safeArea}>
      <Cabecalho navigation={navigation} />
      <View style={styles.container}>
        <View style={styles.areasTitleContainer}>
          <Text style={styles.areasTitle}>ÁREAS</Text>
        </View>

        <FlatList
          data={groupedAreas}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
        />
      </View>
      {funcao === "adm" && (
        <TouchableOpacity
          onPress={() => navigation.navigate("CadastrarArea")}
          style={styles.fabButton}
        >
          <Icon name="plus" size={font(5)} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const FAB_SIZE = height(8);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  areasTitleContainer: {
    backgroundColor: "#ecececff",
    paddingVertical: height(2),
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#05419A",
  },
  areasTitle: {
    color: "#05419A",
    fontSize: font(4.5),
  },
  groupHeaderContainer: {
    backgroundColor: "#05419A",
    paddingHorizontal: width(4),
    paddingVertical: height(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  groupHeader: {
    color: "#fff",
    fontSize: font(3),
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  listItem: {
    backgroundColor: "#ecececff",
    paddingVertical: height(1.5),
    paddingHorizontal: width(4),
    borderBottomWidth: 1,
    borderBottomColor: "#05419A",
    flexDirection: "row",
    alignItems: "center",
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: width(5),
  },
  listItemText: {
    fontSize: font(3),
    color: "#05419A",
    fontWeight: "600",
    flex: 1,
    flexWrap: "wrap",
  },

  fabButton: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    alignItems: "center",
    justifyContent: "center",
    right: width(6),
    bottom: height(4),
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
  fabText: {
    color: "#fff",
    fontSize: font(6.5),
    lineHeight: font(6.5),
  },
});
