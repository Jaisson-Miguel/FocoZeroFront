import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { API_URL } from "./../../../config/config.js";
import ImageViewing from "react-native-image-viewing";
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

export default function Quarteiroes({ route, navigation }) {
    const { idArea, mapaUrl, nomeArea, funcao, modoI } = route.params;
    const [quarteiroes, setQuarteiroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchQuarteiroes = async () => {
                setLoading(true);
                try {
                    const response = await fetch(
                        `${API_URL}/listarQuarteiroes/${idArea}`
                    );
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
            };

            fetchQuarteiroes();
        }, [idArea])
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
        ...quarteiroes.map((q) => ({ type: "quarteirao", key: q._id, data: q })),
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
                contentContainerStyle={styles.flatListContent}
            />

            {funcao === "adm" && (
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("CadastrarQuarteirao", {
                            idArea: idArea,
                            nomeArea: nomeArea,
                        })
                    }
                    style={styles.fabButton}
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
        </View>
    );
}

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
        paddingBottom: height(12),
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
        width: height(8),
        height: height(8),
        alignItems: "center",
        justifyContent: "center",
        right: width(6),
        bottom: height(4),
        backgroundColor: "#05419A",
        borderRadius: height(8) / 2,
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