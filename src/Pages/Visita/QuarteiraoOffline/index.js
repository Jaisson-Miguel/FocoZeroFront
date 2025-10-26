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
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";

export default function QuarteiraoOffline({ navigation }) {
    const [quarteiroes, setQuarteiroes] = useState([]);
    const [imoveis, setImoveis] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const baixarDados = async () => {
        setLoading(true);
        try {
            const idUsuario = await getId();

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

            const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
            const locais = rawImoveis ? JSON.parse(rawImoveis) : [];
            const locaisArr = Array.isArray(locais) ? locais : [];

            const mesclados = imoveisArray.map((i) => {
                const local = locaisArr.find((l) => l._id === i._id);
                if (local && (local.status === "visitado" || local.editadoOffline)) {
                    return local;
                }
                return i;
            });

            await AsyncStorage.setItem(
                "dadosQuarteiroes",
                JSON.stringify(quarteiroesArray)
            );
            await AsyncStorage.setItem("dadosImoveis", JSON.stringify(mesclados));

            setQuarteiroes(Array.isArray(quarteiroesArray) ? quarteiroesArray : []);
            setImoveis(Array.isArray(mesclados) ? mesclados : []);
        } catch (error) {
            console.log("Erro ao baixar:", error);
            await carregarOffline();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await carregarOffline();
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

    const qList = Array.isArray(quarteiroes) ? quarteiroes : [];
    const iList = Array.isArray(imoveis) ? imoveis : [];

    const sections = qList.reduce((acc, q) => {
        const title = q.nomeArea || "SEM ÁREA DEFINIDA";
        let sec = acc.find((s) => s.title === title);
        if (!sec) {
            sec = { title, data: [] };
            acc.push(sec);
        }
        const qtdImoveis = iList.filter((i) => i.idQuarteirao === q._id).length;
        sec.data.push({ ...q, qtdImoveis });
        return acc;
    }, []);

    return (
        <View style={styles.container}>
            <Cabecalho navigation={navigation} />

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

                            const textoFinal = `${areaNome} - QUARTEIRÃO ${numero}`;

                            const imoveisDoQuarteirao = iList.filter(
                                (i) => i.idQuarteirao === item._id
                            );
                            const totalImoveis = imoveisDoQuarteirao.length;
                            const imoveisVisitados = imoveisDoQuarteirao.filter(
                                (i) => i.status === "visitado"
                            ).length;

                            let backgroundColor = styles.listItemContainer.backgroundColor;
                            if (imoveisVisitados > 0) {

                                backgroundColor = "#fbfde6ff";
                            }
                            if (imoveisVisitados === totalImoveis && totalImoveis > 0) {
                                backgroundColor = "#d9f1dfff";
                            }


                            return (
                                <TouchableOpacity
                                    style={[styles.listItemContainer, { backgroundColor }]}
                                    onPress={() =>
                                        navigation.navigate("ImovelOffline", { quarteirao: item })
                                    }
                                >
                                    <View style={styles.listItemTextWrapper}>
                                        <Text style={styles.listItemText}>
                                            {textoFinal}
                                        </Text>
                                        <Text style={styles.listItemSubtitle}>
                                            {imoveisVisitados} de {totalImoveis} imóveis visitados
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        } catch (e) {
                            console.log("Erro ao renderizar item:", e);
                            return null;
                        }
                    }}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeaderTitle}>{title.toUpperCase()}</Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.listEmptyContainer}>
                            <Text style={styles.listEmptyText}>
                                Nenhum quarteirão encontrado.
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={sections.length === 0 && { flex: 1 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitleContainer: {
        paddingVertical: height(2),
        paddingHorizontal: width(5),
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: font(3),
        fontWeight: "bold",
        color: "#05419A",
        textAlign: "center",
    },

    sectionHeaderContainer: {
        paddingHorizontal: width(5),
        paddingVertical: height(1),
        backgroundColor: "#05419A",
        borderBottomWidth: 1,
        borderBottomColor: '#05419A',
    },
    sectionHeaderTitle: {
        fontSize: font(2.5),
        paddingVertical: height(1),
        fontWeight: "bold",
        color: "#fff",
    },

    listItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: height(2),
        paddingHorizontal: width(5),
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#CDCDCD",
        width: width(100),
    },
    listItemTextWrapper: {
        flex: 1,
    },
    listItemText: {
        fontSize: font(2.5),
        color: "#333333",
        fontWeight: "bold",
        includeFontPadding: false,
        textAlignVertical: "center",
    },
    listItemSubtitle: {
        fontSize: font(2),
        color: "#666",
        marginTop: height(0.5),
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: width(10),
    },
    emptyText: {
        fontSize: font(2.5),
        color: "gray",
        textAlign: "center",
    },
    listEmptyContainer: {
        padding: height(2.5),
        alignItems: "center",
        flex: 1,
        justifyContent: 'center',
    },
    listEmptyText: {
        color: "gray",
        fontSize: font(2.2),
    },
});