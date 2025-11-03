import React, { useEffect, useState } from "react";
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
// Assumindo que você tem esses utilitários de estilo e o Cabecalho
import { height, width, font } from "../../../utils/responsive.js"; 
import Cabecalho from "../../../Components/Cabecalho";


export default function DetalheDiarioHistorico({ navigation, route }) {
    // 1. Recebe os parâmetros da navegação
    // O 'diarioId' é o ID do MongoDB (_id) que você precisa buscar
    const { diarioId, nomeArea, dataDiario } = route.params; 

    const [loading, setLoading] = useState(true);
    const [diarioData, setDiarioData] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);

    const dataFormatada = dataDiario ? new Date(dataDiario).toLocaleDateString('pt-BR') : 'Data Desconhecida';

    const toggleSection = (sectionName) => {
        setExpandedSection(sectionName === expandedSection ? null : sectionName);
    };

    useEffect(() => {
        const fetchDiario = async () => {
            if (!diarioId) {
                Alert.alert("Erro", "ID do Diário não encontrado.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // 2. Endpoint para buscar o diário pelo ID (ex: GET /diarios/60c72b...)
                const url = `${API_URL}/diarios/${diarioId}`; 
                console.log("Buscando detalhes do diário:", url);

                const res = await fetch(url);
                
                // 🚨 CORREÇÃO PARA O ERRO JSON PARSE: Verifica se a resposta foi bem sucedida (200-299)
                if (!res.ok) {
                    const errorBody = await res.text(); // Lê como texto para evitar erro de JSON Parse
                    console.error(`ERRO HTTP ${res.status} ao buscar diário ${diarioId}:`, errorBody);
                    
                    // Lança um erro descritivo que será capturado pelo catch
                    throw new Error(`A API retornou status ${res.status}. Detalhes: ${res.statusText}`);
                }
                
                // Tenta fazer o parse do JSON apenas se a resposta for OK
                const data = await res.json();
                
                if (!data || !data.resumo) {
                     // Verifica se a estrutura esperada está presente
                     throw new Error("Resposta da API inválida: estrutura 'resumo' ausente.");
                }

                setDiarioData(data); 

            } catch (err) {
                console.error("Erro ao buscar detalhes do diário:", err.message);
                // Exibe a mensagem de erro detalhada
                Alert.alert("Erro de Busca", `Não foi possível carregar os detalhes do diário. ${err.message}`);
                setDiarioData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDiario();
    }, [diarioId]);
    
    // Objeto de resumo para simplificar a renderização
    const resumo = diarioData?.resumo;
    const hasData = resumo && Object.keys(resumo).length > 0;

    const scrollContentStyle = hasData || loading
        ? styles.containerWithData
        : styles.containerEmpty;
        
    // Mapeamento de tipos de imóvel (reutilizado do seu ResumoDiario)
    const tiposMap = {
        r: "Residencial",
        c: "Comercial",
        tb: "Terreno Baldio",
        out: "Outros",
        pe: "Ponto Estratégico",
    };

    if (loading) {
        return (
            <View style={styles.fullScreenContainer}>
                <Cabecalho navigation={navigation} />
                <ActivityIndicator size="large" color="#2CA856" style={styles.loadingIndicator} />
            </View>
        );
    }
    
    // Função auxiliar para renderizar seções expansíveis
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

    return (
        <View style={styles.fullScreenContainer}>
            <Cabecalho navigation={navigation} />

            <ScrollView contentContainerStyle={scrollContentStyle}>
                <View style={styles.contentWrapper}>
                    <Text style={styles.titulo}>Diário Histórico</Text>
                    <Text style={styles.subTituloInfo}>
                        <Text style={styles.textBold}>{nomeArea}</Text> - {dataFormatada}
                    </Text>

                    {!hasData ? (
                        <View style={styles.emptyMessageContainer}>
                            <Text style={styles.textBase}>Nenhum resumo encontrado para este diário.</Text>
                        </View>
                    ) : (
                        <>
                            {/* SEÇÃO 1: TOTAIS GERAIS */}
                            {renderSection("Totais Gerais", (
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

                            {/* SEÇÃO 2: IMÓVEIS POR TIPO */}
                            {renderSection("Imóveis por Tipo", (
                                <>
                                    {Object.entries(resumo.totalVisitasTipo || {}).map(([tipo, qtd]) => (
                                        <Text key={tipo} style={styles.textBase}>
                                            {tiposMap[tipo] || tipo}: {qtd || 0}
                                        </Text>
                                    ))}
                                </>
                            ), 'tiposImovel')}

                            {/* SEÇÃO 3: DEPÓSITOS E TRATAMENTO */}
                            {renderSection("Depósitos e Tratamento", (
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
                            
                            {/* SEÇÃO 4: FOCOS E AMOSTRAS */}
                            {renderSection("Focos e Amostras", (
                                <>
                                    <Text style={styles.textBase}>Total de amostras: {resumo.totalAmostras || 0}</Text>
                                    <Text style={styles.textBase}>Imóveis com foco: {resumo.totalFocos || 0}</Text>
                                </>
                            ), 'focos')}

                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

// Estilos adaptados do seu componente ResumoDiario
const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    containerWithData: {
        flexGrow: 1,
        paddingHorizontal: width(2),
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
        fontSize: font(3.8),
        fontWeight: "bold",
        color: '#05419A',
        paddingBottom: height(1),
        alignSelf: "center",
        marginTop: height(1)
    },
    subTituloInfo: {
        fontSize: font(2.5),
        color: '#333',
        marginBottom: height(2),
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
        marginBottom: height(0.25),
    },
    subtitulo: {
        fontWeight: "600",
        fontSize: font(2.25),
        marginBottom: height(0.5),
        color: '#333'
    },
    textBase: {
        fontSize: font(2.25),
        marginBottom: height(0.25),
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
        marginBottom: height(0.25),
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
        marginVertical: height(0.5)
    }
});