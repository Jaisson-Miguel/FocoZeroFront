import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from "../../../config/config.js";
import { height, width, font } from "../../../utils/responsive.js";
import Cabecalho from "../../../Components/Cabecalho";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const createLocalDate = (dateString) => {
    if (!dateString) return null;
    try {
        const dateParts = dateString.split('-');
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    } catch (e) {
        console.error("Erro ao criar data local:", e);
        return null;
    }
};

export default function DetalheDiarioHistorico({ navigation, route }) {

    const { diarioId, nomeArea: nomeAreaFallback, dataDiario } = route.params;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [diarioData, setDiarioData] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);
    const [visitasDetalhes, setVisitasDetalhes] = useState(null);
    const [loadingVisitas, setLoadingVisitas] = useState(false);

    const [nomeArea, setNomeArea] = useState(nomeAreaFallback);

    const dataFormatadaUrl = dataDiario;

    let dataFormatadaExibicao = 'Data Desconhecida';
    const displayDate = createLocalDate(dataDiario);
    if (displayDate) {
        dataFormatadaExibicao = displayDate.toLocaleDateString('pt-BR');
    }

    const toggleSection = (sectionName) => {
        setExpandedSection(sectionName === expandedSection ? null : sectionName);
    };

    const tiposMap = {
        r: "Residencial",
        c: "Comercial",
        tb: "Terreno Baldio",
        out: "Outros",
        pe: "Ponto Estratégico",
    };

    const fetchNomeArea = useCallback(async (idArea) => {
        if (!idArea) return;

        try {
            const url = `${API_URL}/areas/${idArea}`;
            const res = await fetch(url);

            if (!res.ok) {
                console.warn(`Aviso: Não foi possível buscar nome da área ${idArea}.`);
                return;
            }

            const data = await res.json();
            const nomeEncontrado = data.nome || data.nomeArea;

            if (nomeEncontrado) {
                setNomeArea(nomeEncontrado);
            }
        } catch (err) {
            console.error("ERROR Erro ao buscar nome da área:", err.message);
        }
    }, []);

    useEffect(() => {
        const fetchDiario = async () => {
            if (!diarioId) {
                Alert.alert("Erro", "ID do Diário não encontrado.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const url = `${API_URL}/diarios/${diarioId}`;
                const res = await fetch(url);
                if (!res.ok) {
                    const errorBody = await res.text();
                    console.error(`ERRO HTTP ${res.status} ao buscar diário ${diarioId}:`, errorBody);
                    throw new Error(`A API retornou status ${res.status}. Detalhes: ${res.statusText}`);
                }
                const data = await res.json();
                if (!data || !data.resumo) {
                    throw new Error("Resposta da API inválida: estrutura 'resumo' ausente.");
                }
                setDiarioData(data);

                if (data.idArea) {
                    fetchNomeArea(data.idArea);
                }

            } catch (err) {
                console.error("Erro ao buscar detalhes do diário:", err.message);
                Alert.alert("Erro de Busca", `Não foi possível carregar os detalhes do diário. ${err.message}`);
                setDiarioData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDiario();
    }, [diarioId, fetchNomeArea]);

    const fetchVisitas = useCallback(async () => {

        if (loadingVisitas || !diarioId) return;

        if (!diarioId) {
            Alert.alert("Erro", "ID do Diário não encontrado para buscar as visitas.");
            return;
        }

        try {
            setLoadingVisitas(true);

            const url = `${API_URL}/visitas/detalhes/diario/${diarioId}`;

            const res = await fetch(url);

            if (!res.ok) {
                const errorBody = await res.json().catch(() => ({ message: res.statusText }));
                console.error("ERROR URL da Requisição com erro:", url);
                throw new Error(errorBody.message || `Erro HTTP ${res.status}`);
            }

            const data = await res.json();
            setVisitasDetalhes(data);

        } catch (err) {
            console.error("ERROR Erro ao buscar visitas:", err.message);
            Alert.alert("Erro", `Não foi possível carregar as visitas. ${err.message}`);
            setVisitasDetalhes([]);
        } finally {
            setLoadingVisitas(false);
        }
    }, [diarioId, loadingVisitas]);


    const resumo = diarioData?.resumo;
    const hasData = resumo && Object.keys(resumo).length > 0;

    const safeAreaStyle = {
        paddingTop: insets.top,
        paddingBottom: insets.bottom
    };

    const scrollContentStyle = hasData || loading ? styles.containerWithData : styles.containerEmpty;

    const renderSection = (title, content, sectionName) => (
        <View key={sectionName}>
            <TouchableOpacity
                style={styles.sectionHeaderContainer}
                onPress={() => toggleSection(sectionName)}
            >
                <Text style={styles.sectionTitle}>{title}</Text>
                <Icon
                    name={expandedSection === sectionName ? 'chevron-down' : 'chevron-forward'}
                    size={font(3)}
                    color="#eee"
                    style={styles.arrowIcon}
                />
            </TouchableOpacity>

            {expandedSection === sectionName && (
                <View style={styles.box}>
                    {content}
                </View>
            )}
        </View>
    );

    const renderVisitasDetalhes = () => {
        if (loadingVisitas) {
            return <ActivityIndicator size="small" color="#2CA856" style={styles.loadingVisitas} />;
        }

        if (!visitasDetalhes || visitasDetalhes.length === 0) {
            return (
                <View style={styles.box}>
                    <Text style={styles.textBase}>Nenhuma visita detalhada encontrada para este dia.</Text>
                </View>
            );
        }

        return visitasDetalhes.map(quarteirao => {

            const visitasOrdenadas = [...quarteirao.visitas].sort((a, b) => {
                const posA = a.posicaoImovel || Infinity;
                const posB = b.posicaoImovel || Infinity;

                return posA - posB;
            });

            return (
                <View key={quarteirao._id} style={styles.quarteiraoGroup}>
                    <Text style={styles.quarteiraoTitle}>
                        Quarteirão {quarteirao.numeroQuarteirao} ({quarteirao.nomeArea})
                    </Text>

                    {visitasOrdenadas.map(visita => (
                        <View key={visita._id} style={styles.visitaItem}>
                            <Text style={styles.textBase}>
                                <Text style={styles.textBold}>{visita.rua}, {visita.numeroImovel}</Text>
                            </Text>
                            <Text style={styles.textBaseTipo}>
                                Tipo: {tiposMap[visita.tipoImovel] || visita.tipoImovel}
                            </Text>

                        </View>
                    ))}
                </View>
            );
        });
    };

    if (loading) {
        return (
            <View style={[styles.fullScreenContainer, { paddingTop: insets.top }]}>
                <Cabecalho navigation={navigation} />
                <ActivityIndicator size="large" color="#2CA856" style={styles.loadingIndicator} />
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <Cabecalho navigation={navigation} />
            <ScrollView contentContainerStyle={[scrollContentStyle, { paddingBottom: insets.bottom + height(2) }]}>
                <View style={styles.contentWrapper}>
                    <Text style={styles.titulo}>Diário </Text>
                    <Text style={styles.subTituloInfo}>
                        <Text style={styles.textBold}>{nomeArea}</Text> - {dataFormatadaExibicao}
                    </Text>

                    {hasData && renderSection("Total Geral", (
                        <>
                            <Text style={styles.textBase}>Total de visitas: {resumo.totalVisitas || 0}</Text>
                            <Text style={styles.textBase}>
                                Total de quarteirões finalizados: {resumo.totalQuarteiroes || 0}
                            </Text>
                            <Text style={styles.textBase}>
                                Quarteirões: {(resumo.quarteiroes || []).length > 0
                                    ? (resumo.quarteiroes || []).join(", ")
                                    : "Nenhum finalizado"}
                            </Text>
                        </>
                    ), 'gerais')}

                    {hasData && renderSection("Imóveis por Tipo", (
                        <>
                            {Object.entries(resumo.totalVisitasTipo || {}).map(([tipo, qtd]) => (
                                <Text key={tipo} style={styles.textBase}>
                                    {tiposMap[tipo] || tipo}: {qtd || 0}
                                </Text>
                            ))}
                        </>
                    ), 'tiposImovel')}

                    {hasData && renderSection("Depósitos e Tratamento", (
                        <>
                            <Text style={styles.subtitulo}>Inspecionados:</Text>
                            {Object.entries(resumo.totalDepInspecionados || {}).map(
                                ([tipo, qtd]) => (
                                    <Text key={tipo} style={styles.textBase}>
                                        {tipo.toUpperCase()}: {qtd || 0}
                                    </Text>
                                )
                            )}
                            <View style={styles.divider} />
                            <Text style={styles.textBase}>Depósitos eliminados: {resumo.totalDepEliminados || 0}</Text>
                            <View style={styles.divider} />
                            <Text style={styles.subtitulo}>Larvicida:</Text>
                            <Text style={styles.textBase}>
                                Imóveis tratados: {resumo.totalImoveisLarvicida || 0}
                            </Text>
                            <Text style={styles.textBase}>
                                Depósitos tratados: {resumo.totalDepLarvicida || 0}
                            </Text>
                            <Text style={styles.textBase}>
                                Larvicida aplicada (g/ml): {resumo.totalQtdLarvicida || 0}
                            </Text>
                        </>
                    ), 'depositos')}

                    {hasData && renderSection("Focos e Amostras", (
                        <>
                            <Text style={styles.textBase}>Total de amostras: {resumo.totalAmostras || 0}</Text>
                            <Text style={styles.textBase}>Imóveis com foco: {resumo.imoveisComFoco || 0}</Text>
                        </>
                    ), 'focos')}

                    {hasData && (
                        <TouchableOpacity
                            style={styles.loadVisitasButton}
                            onPress={() => {
                                if (visitasDetalhes && expandedSection === 'detalhesVisitas') {
                                    toggleSection(null);
                                } else if (visitasDetalhes && expandedSection !== 'detalhesVisitas') {
                                    toggleSection('detalhesVisitas');
                                } else {
                                    fetchVisitas();
                                    setExpandedSection('detalhesVisitas');
                                }
                            }}
                            disabled={loadingVisitas}
                        >
                            {loadingVisitas ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.loadVisitasButtonText}>
                                    {visitasDetalhes ? 'Listar imóveis visitados' : 'Listar imóveis visitados'}
                                </Text>
                            )}
                            <Icon
                                name={expandedSection === 'detalhesVisitas' ? 'chevron-up' : 'chevron-down'}
                                size={font(2.5)}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    )}

                    {expandedSection === 'detalhesVisitas' && (
                        <View style={styles.visitasContainer}>
                            {renderVisitasDetalhes()}
                        </View>
                    )}

                    {!hasData && (
                        <View style={styles.emptyMessageContainer}>
                            <Text style={styles.textBase}>Nenhum resumo encontrado para este diário.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    containerWithData: {
        flexGrow: 1,
        paddingHorizontal: width(4),
        paddingVertical: height(2),
    },
    containerEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentWrapper: {
        flex: 1,
    },
    loadingIndicator: {
        marginTop: height(10),
    },
    titulo: {
        fontSize: font(5),
        fontWeight: "bold",
        color: '#05419A',
        paddingBottom: height(0.5),
        alignSelf: "center",
        marginTop: height(1)
    },
    subTituloInfo: {
        fontSize: font(2.5),
        color: '#333',
        marginBottom: height(1.5),
        alignSelf: "center",
        textAlign: 'center',
    },
    textBold: {
        fontWeight: 'bold',
    },
    box: {
        padding: height(2.5),
        backgroundColor: "#e0e0e0",
        borderRadius: width(2),
        marginBottom: height(0.5),
    },
    subtitulo: {
        fontWeight: "600",
        fontSize: font(2.5),
        marginBottom: height(0.5),
        color: '#333'
    },
    textBase: {
        fontSize: font(2.25),
        marginBottom: height(0.5),
        color: '#333',
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width(5),
    },
    sectionHeaderContainer: {
        backgroundColor: "#05419A",
        borderRadius: width(1.5),
        marginBottom: height(0.5),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width(4),
        paddingVertical: height(2),
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: font(3),
        color: '#eee',
        flexShrink: 1,
    },
    arrowIcon: {
        marginLeft: width(2),
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: height(1),
    },
    loadVisitasButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2CA856',
        padding: height(2),
        borderRadius: width(2),
        marginTop: height(1),
    },
    loadVisitasButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: font(2.5),
        marginRight: width(2),
    },
    visitasContainer: {
        marginBottom: height(2),
        marginTop: height(0.5),
    },
    quarteiraoGroup: {
        backgroundColor: '#f9f9f9',
        borderRadius: width(2),
        padding: width(4),
        marginBottom: height(0.5),
        borderWidth: 1,
        borderColor: '#ddd',
    },
    quarteiraoTitle: {
        fontSize: font(2.5),
        fontWeight: 'bold',
        color: '#05419A',
        marginBottom: height(1),
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: height(1),
    },
    visitaItem: {
        backgroundColor: '#fff',
        padding: width(4),
        borderRadius: width(1.5),
        marginBottom: height(0.5),
        borderLeftWidth: width(1),
        borderLeftColor: '#2CA856',
    },
    textBaseTipo: {
        fontSize: font(2.25),
        color: '#666',
        marginTop: height(0.25),
    },
});