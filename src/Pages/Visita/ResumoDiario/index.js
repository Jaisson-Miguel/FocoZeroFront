import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from "react-native";
// 🆕 Importa o Ionicons (Um conjunto de ícones comum)
import Icon from 'react-native-vector-icons/Ionicons'; 
import { API_URL } from "../../../config/config.js";
import { getId } from "../../../utils/tokenStorage.js";
import { height, width, font } from "../../../utils/responsive.js"; 
import Cabecalho from "../../../Components/Cabecalho";


export default function ResumoDiario({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [resumoPorArea, setResumoPorArea] = useState([]);
    const [quarteiroes, setQuarteiroes] = useState([]);
    const [totais, setTotais] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [semana, setSemana] = useState("");
    const [atividade, setAtividade] = useState("");
    const [areaSelecionada, setAreaSelecionada] = useState(null);

    // ESTADO para controlar qual área está expandida.
    const [expandedAreaId, setExpandedAreaId] = useState(null);

    // NOVA FUNÇÃO: Alterna a expansão da área.
    const toggleArea = (idArea) => {
        setExpandedAreaId(idArea === expandedAreaId ? null : idArea);
    };

    // 🔹 Busca o resumo diário ao montar a tela
    useEffect(() => {
        const buscarResumo = async () => {
            try {
                setLoading(true);
                const hoje = new Date().toISOString().split("T")[0];
                const idAgente = await getId();
                const url = `${API_URL}/resumoDiario?idAgente=${idAgente}&data=${hoje}`;

                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) {
                    Alert.alert("Aviso", data.message || "Nenhum dado encontrado.");
                    setResumoPorArea([]);
                    setQuarteiroes([]);
                } else {
                    setResumoPorArea(data.resumoPorArea || []);
                    setQuarteiroes(data.quarteiroesTrabalhados || []);
                    setTotais({
                        totalVisitas: data.totalVisitas,
                        totalQuarteiroes: data.totalQuarteiroesTrabalhados,
                    });
                }
            } catch (err) {
                console.error("Erro ao buscar resumo:", err);
                Alert.alert("Erro", "Não foi possível carregar o resumo diário.");
            } finally {
                setLoading(false);
            }
        };

        buscarResumo();
    }, []);

    // 🔹 Envia fechamento do diário para o backend
    const handleFecharDiario = async (idArea, atividade) => {
        try {
            const idAgente = await getId();
            const hoje = new Date().toISOString().split("T")[0];

            const areaSelecionadaObj = resumoPorArea.find(
                (area) => area.idArea === idArea
            );

            if (!areaSelecionadaObj) {
                Alert.alert("Erro", "Resumo da área não encontrado.");
                return;
            }

            const resumoParaEnvio = {
                totalVisitas: areaSelecionadaObj.totalVisitas,
                totalVisitasTipo: areaSelecionadaObj.totalPorTipoImovel,
                totalDepInspecionados: areaSelecionadaObj.totalDepositosInspecionados,
                totalDepEliminados: areaSelecionadaObj.totalDepEliminados,
                totalImoveisLarvicida: areaSelecionadaObj.totalImoveisLarvicida,
                totalQtdLarvicida: areaSelecionadaObj.totalLarvicidaAplicada,
                totalDepLarvicida: areaSelecionadaObj.depositosTratadosComLarvicida,
                quarteiroes: areaSelecionadaObj.quarteiroes || [], // adiciona os números
                totalQuarteiroes: areaSelecionadaObj.totalQuarteiroes || 0,
            };

            const res = await fetch(`${API_URL}/cadastrarDiario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idAgente,
                    idArea,
                    data: hoje,
                    atividade: atividade || 4,
                    resumo: resumoParaEnvio,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                Alert.alert("Sucesso", "Diário da área cadastrado!");
                // Remove a área da lista após o fechamento bem-sucedido
                setResumoPorArea(prevResumo => 
                    prevResumo.filter(area => area.idArea !== idArea)
                );
            } else {
                Alert.alert("Erro", data.message || "Falha ao cadastrar diário.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível cadastrar o diário.");
        }
    };

    return (
        <ScrollView>
            <Cabecalho navigation={navigation} />
          <View style={styles.container}>
            <Text style={styles.titulo}>Resumo Diário</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2CA856" />
            ) : resumoPorArea.length === 0 && quarteiroes.length === 0 ? (
                <Text style={styles.textBase}>Nenhum dado disponível para hoje.</Text>
            ) : (
                <>
                    {/* 🔹 Totais Gerais */}
                    <View style={styles.box}>
                        <Text style={styles.subtitulo}>Totais do dia:</Text>
                        <Text style={styles.textBase}>Total de visitas: {totais.totalVisitas || 0}</Text>
                        <Text style={styles.textBase}>
                            Total de quarteirões finalizados: {totais.totalQuarteiroes || 0}
                        </Text>
                    </View>

                    {/* 🔹 Resumo por Área - Implementação de Expansão/Colapso */}
                    {resumoPorArea.map((area) => (
                        <View key={area.idArea}> 
                            
                            {/* 1. Área Clicável para o Nome e Expansão/Colapso (Section Header) */}
                            <TouchableOpacity
                                style={styles.sectionHeaderContainer} 
                                onPress={() => toggleArea(area.idArea)}
                            >
                                {/* Nome da Área alinhado à esquerda */}
                                <Text style={styles.sectionTitle}>{area.nomeArea}</Text>

                                {/* 🆕 Ícone de seta alinhado à direita */}
                                <Icon
                                    name={expandedAreaId === area.idArea ? 'chevron-down' : 'chevron-forward'}
                                    size={font(3)}
                                    color="#eee"
                                    style={styles.arrowIcon}
                                />

                            </TouchableOpacity>

                            {/* 2. Conteúdo Condicional: Mostra se o expandedAreaId for igual ao idArea atual */}
                            {expandedAreaId === area.idArea && (
                                <View>
                                    <View style={styles.box}>
                                        <Text style={styles.subtitulo}>
                                            Total de visitas: {area.totalVisitas}
                                        </Text>
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.subtitulo}>Imóveis por tipo:</Text>
                                        {Object.entries(area.totalPorTipoImovel).map(([tipo, qtd]) => {
                                            const tiposMap = {
                                                r: "Residencial",
                                                c: "Comercial",
                                                tb: "Terreno Baldio",
                                                out: "Outros",
                                                pe: "Ponto Estratégico",
                                            };
                                            return (
                                                <Text key={tipo} style={styles.textBase}>
                                                    {tiposMap[tipo] || tipo}: {qtd}
                                                </Text>
                                            );
                                        })}
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.subtitulo}>Depósitos inspecionados:</Text>
                                        {Object.entries(area.totalDepositosInspecionados).map(
                                            ([tipo, qtd]) => (
                                                <Text key={tipo} style={styles.textBase}>
                                                    {tipo.toUpperCase()}: {qtd}
                                                </Text>
                                            )
                                        )}
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.textBase}>Depósitos eliminados: {area.totalDepEliminados}</Text>
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.textBase}>
                                            Imóveis tratados com larvicida: {area.totalImoveisLarvicida}
                                        </Text>
                                        <Text style={styles.textBase}>
                                            Total de larvicida aplicada: {area.totalLarvicidaAplicada}
                                        </Text>
                                        <Text style={styles.textBase}>
                                            Depósitos tratados com larvicida:{" "}
                                            {area.depositosTratadosComLarvicida}
                                        </Text>
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.textBase}>Total de amostras: {area.totalAmostras}</Text>
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.textBase}>Imóveis com foco: {area.totalFocos}</Text>
                                    </View>

                                    <View style={styles.box}>
                                        <Text style={styles.subtitulo}>Quarteirões finalizados:</Text>
                                        <Text style={styles.textBase}>
                                            {(area.quarteiroes || []).length > 0
                                                ? (area.quarteiroes || []).join(", ")
                                                : "Nenhum finalizado"}
                                        </Text>
                                        <Text style={styles.textBase}>Total de quarteirões: {area.totalQuarteiroes || 0}</Text>
                                    </View>
                                </View>
                            )}

                            {/* 3. Botão Fechar Diário (Visível sempre) */}
                            <TouchableOpacity
                                style={styles.botaoFechar}
                                onPress={() => {
                                    setAreaSelecionada(area.idArea);
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={styles.textoBotao}>FECHAR DIÁRIO</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}

            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalFundo}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitulo}>Fechar Diário</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Semana"
                            keyboardType="numeric"
                            value={semana}
                            onChangeText={setSemana}
                            placeholderTextColor="#777"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Atividade (1 a 6)"
                            keyboardType="numeric"
                            value={atividade}
                            onChangeText={setAtividade}
                            placeholderTextColor="#777"
                        />

                        <View style={styles.modalBotoesContainer}>
                            <TouchableOpacity
                                style={[styles.modalBotao, { backgroundColor: "#4CAF50" }]}
                                onPress={() => {
                                    handleFecharDiario(areaSelecionada, Number(atividade));
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.textoBotao}>Confirmar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBotao, { backgroundColor: "#f44336" }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            </View>
        </ScrollView>
    );
}

// ----------------------------------------------------------------------------------
// ESTILOS RESPONSIVOS
// ----------------------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: width(2), 
        paddingVertical: height(2), 
        backgroundColor: "#f5f5f5",
    },
    
    // --- Título Principal ---
    titulo: {
        fontSize: font(3.8), 
        fontWeight: "bold",
        color: '#05419A',
        paddingBottom: height(2), 
        alignSelf: "center"
    },

    // --- Card de Resumo (Box) ---
    box: {
        padding: height(2.5), 
        backgroundColor: "#e0e0e0",
        borderRadius: width(2), 
        marginBottom: height(0.25), 
    },
    
    // --- Subtítulos dentro do Box ---
    subtitulo: { 
        fontWeight: "600", 
        fontSize: font(2.25), 
        marginBottom: height(0.5), 
        color: '#333'
    },

    // --- Estilo de Texto Base para todos os dados ---
    textBase: {
        fontSize: font(2.25), 
        marginBottom: height(0.25), 
        color: '#333',
    },
    
    // CONTAINER DO CABEÇALHO DA SEÇÃO (TouchableOpacity)
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

    // NOME DA ÁREA (Alinhado à esquerda)
    sectionTitle: {
        fontWeight: "bold",
        fontSize: font(3), 
        color: '#eee',
        flexShrink: 1, 
    },

    // 🆕 ESTILO para o ÍCONE de seta (garante o alinhamento e o espaçamento)
    arrowIcon: {
        marginLeft: width(2), 
    },

    // --- Botão Fechar Diário ---
    botaoFechar: {
        backgroundColor: "#2CA856",
        padding: height(2), 
        borderRadius: width(2), 
        alignItems: "center",
        marginBottom: height(2), 
        elevation: 2,
    },
    textoBotao: { 
        color: "#fff", 
        fontWeight: "bold",
        fontSize: font(2.25), 
        textTransform: 'uppercase',
    },

    // --- Modal ---
    modalFundo: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        width: width(80), 
        borderRadius: width(2.5), 
        padding: width(5), 
    },
    modalTitulo: { 
        fontWeight: "bold", 
        fontSize: font(2.5), 
        marginBottom: height(1), 
        color: '#05419A',
        alignSelf:"center",
    },
    
    // --- Input do Modal ---
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: width(2), 
        padding: height(2.), 
        marginTop: height(1), 
        fontSize: font(2.5),
        color: '#333',
    },

    // --- Botões do Modal ---
    modalBotoesContainer: { 
        flexDirection: "row", 
        justifyContent: "space-around",
        marginTop: height(1),
    },
    modalBotao: {
        flex: 1,
        marginHorizontal: width(1.25), 
        padding: height(1.25), 
        borderRadius: width(2), 
        alignItems: "center",
    },
});