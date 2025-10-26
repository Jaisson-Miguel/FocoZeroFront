import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SectionList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import { API_URL } from "../../../config/config.js";
import { getId, getNome } from "../../../utils/tokenStorage.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { height, width, font } from "../../../utils/responsive.js";

export default function AtualizarQuarteiroes({ navigation }) {
    const [quarteiroes, setQuarteiroes] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const id = await getId();
                setUsuarioId(id);

                const res = await fetch(
                    `${API_URL}/baixarQuarteiroesResponsavel/${id}`
                );
                if (!res.ok) throw new Error("Falha ao baixar quarteirões");
                const listaQ = await res.json();

                setQuarteiroes(Array.isArray(listaQ) ? listaQ : []);
            } catch (err) {
                console.error(err);
                Alert.alert("Erro", "Não foi possível carregar os quarteirões.");
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const enviarQuarteiroes = async () => {
        if (selected.length === 0) {
            Alert.alert(
                "Atenção",
                "Selecione ao menos um quarteirão para atualizar."
            );
            return;
        }

        Alert.alert(
            "Confirmar",
            "Deseja realmente finalizar os quarteirões selecionados?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/atualizarQuarteiroes`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    ids: selected,
                                    trabalhadoPor: usuarioId,
                                }),
                            });

                            if (res.ok) {
                                navigation.replace("ResumoDiario");
                            } else {
                                const data = await res.json();
                                Alert.alert(
                                    "Erro",
                                    data.message || "Falha ao atualizar quarteirões."
                                );
                            }
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Erro", "Não foi possível enviar os quarteirões.");
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2CA856" />
            </View>
        );
    }

    const sections = quarteiroes.reduce((acc, q) => {
        const title = q.nomeArea || q.idArea?.nome || "Sem Área";
        let sec = acc.find((s) => s.title === title);
        if (!sec) {
            sec = { title, data: [] };
            acc.push(sec);
        }
        sec.data.push(q);
        return acc;
    }, []);

    return (
        <View style={styles.container}>
            <Cabecalho navigation={navigation} />

            <View style={styles.simpleTitleContainer}>
                <Text style={styles.simpleTitle}>
                    ATUALIZAR QUARTEIRÕES
                </Text>
            </View>

            {sections.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Nenhum quarteirão atribuído a você.
                    </Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => String(item._id)}
                    renderSectionHeader={({ section }) => (
                        <Text style={styles.sectionHeader}>
                            {section.title}
                        </Text>
                    )}
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item._id);
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.itemContainer,
                                    isSelected && styles.itemSelected,
                                ]}
                                onPress={() => toggleSelect(item._id)}
                            >
                                <View style={styles.itemContent}>
                                    <View>
                                        <Text style={styles.itemText}>Quarteirão {item.numero}</Text>
                                        <Text style={styles.itemSubtitle}>
                                            {item.finalizado ? "Finalizado ✅" : "Pendente"}
                                        </Text>
                                    </View>
                                    <Text style={styles.itemCheck}>
                                        {isSelected ? "✓" : ""}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.botao, styles.botaoConfirmar]}
                    onPress={enviarQuarteiroes}
                >
                    <Text style={styles.textoBotao}>
                        ATUALIZAR QUARTEIRÕES
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.botao, styles.botaoVoltar]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.textoBotao}>
                        VOLTAR
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    simpleTitleContainer: {
        paddingHorizontal: width(3.75),
        alignItems: "center",
        paddingVertical: height(2.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    simpleTitle: {
        fontSize: font(3.5),
        fontWeight: "bold",
        color: "#05419A",
        textTransform: 'uppercase',
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: width(5),
    },
    emptyText: {
        color: "gray",
        fontSize: font(2.5),
    },
    sectionHeader: {
        fontWeight: "bold",
        fontSize: font(3.5),
        backgroundColor: "#05419A",
        color: "white",
        paddingVertical: height(2),
        paddingHorizontal: width(3),
    },
    itemContainer: {
        paddingVertical: height(1),
        paddingHorizontal: width(4.75),
        borderBottomWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
    },
    itemSelected: {
        backgroundColor: "#c8e6c9",
        borderBottomWidth: 1,
        borderColor: "#4CAF50",
    },
    itemContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemText: {
        fontSize: font(2.5),
        color: "#333",
    },
    itemSubtitle: {
        color: "gray",
        fontSize: font(1.9),
        marginTop: height(0.5)
    },
    itemCheck: {
        fontSize: font(4),
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    footer: {
        paddingHorizontal: width(3),
        paddingTop: height(5),
        marginBottom: height(3),
    },
    botao: {
        padding: height(2.25),
        borderRadius: width(2.25),
        alignItems: "center",
        marginBottom: height(2),
        elevation: 2,
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: font(2.25),
    },
    botaoConfirmar: {
        backgroundColor: "#4CAF50",
    },
    botaoVoltar: {
        backgroundColor: "#2196F3",
    },
});