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
// Certifique-se de que estes caminhos existem no seu projeto
import { API_URL } from "../../../config/config.js";
import { height, width, font } from "../../../utils/responsive.js";
import Cabecalho from "../../../Components/Cabecalho";

// Função auxiliar para criar um objeto Date no fuso horário local a partir da string AAAA-MM-DD
const createLocalDate = (dateString) => {
    if (!dateString) return null;
    try {
        const dateParts = dateString.split('-'); // Ex: ['2025', '11', '03']
        // Cria a data no fuso horário local (Ex: 03/11 00:00:00 GMT-3)
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    } catch (e) {
        console.error("Erro ao criar data local:", e);
        return null;
    }
};

export default function DetalheDiarioHistorico({ navigation, route }) {
    
    // Parâmetros: 'nomeArea' da rota será tratado como um fallback (ex: 'Área ID')
    const { diarioId, nomeArea: nomeAreaFallback, dataDiario } = route.params;

    // Estados da Tela
    const [loading, setLoading] = useState(true);
    const [diarioData, setDiarioData] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);
    const [visitasDetalhes, setVisitasDetalhes] = useState(null);
    const [loadingVisitas, setLoadingVisitas] = useState(false);
    
    // Estado para armazenar o nome da área real (inicia com o fallback)
    const [nomeArea, setNomeArea] = useState(nomeAreaFallback);

    // dataFormatadaUrl (para a API) é a string bruta 'YYYY-MM-DD' que veio da tela anterior.
    const dataFormatadaUrl = dataDiario;

    // Data formatada para exibição no título (DD/MM/AAAA)
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

    // --- FUNÇÃO: BUSCA O NOME DA ÁREA ---
    const fetchNomeArea = useCallback(async (idArea) => {
        if (!idArea) return;

        try {
            // Requisição ao endpoint da sua API de Áreas
            const url = `${API_URL}/areas/${idArea}`;
            
            const res = await fetch(url);
            
            if (!res.ok) {
                console.warn(`Aviso: Não foi possível buscar nome da área ${idArea}.`);
                return;
            }
            
            const data = await res.json();
            // Tenta 'nome', depois 'nomeArea', para flexibilidade
            const nomeEncontrado = data.nome || data.nomeArea;

            if (nomeEncontrado) {
                setNomeArea(nomeEncontrado);
            }
        } catch (err) {
            console.error("ERROR Erro ao buscar nome da área:", err.message);
            // Mantém o nome/ID do fallback
        }
    }, []);

    // --- FUNÇÃO: BUSCA O DIÁRIO (INICIAL) ---
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
                
                // ✅ ACIONA A BUSCA DO NOME DA ÁREA
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

    // --- FUNÇÃO: BUSCA DE DETALHES DAS VISITAS ---
    const fetchVisitas = useCallback(async () => {
        const idAgente = diarioData?.idAgente;
        
        if (loadingVisitas) return;

        if (!idAgente || !dataFormatadaUrl) {
              Alert.alert("Erro", "ID do Agente ou Data da visita não encontrados no diário.");
              return;
        }

        try {
            setLoadingVisitas(true);
            
            const dataUrl = dataFormatadaUrl; // Passa apenas AAAA-MM-DD
            
            // Endpoint para buscar visitas por Agente e Data (AAAA-MM-DD)
            const url = `${API_URL}/visitas/detalhes?idAgente=${idAgente}&data=${dataUrl}`;
            
            console.log("LOG Buscando detalhes das visitas - URL enviada:", url);

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
    }, [diarioData, dataFormatadaUrl, loadingVisitas]);

    
    const resumo = diarioData?.resumo;
    const hasData = resumo && Object.keys(resumo).length > 0;
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
        
        if (!visitasDetalhes) {
            return null;
        }

        if (visitasDetalhes.length === 0) {
            return (
                <View style={styles.box}>
                    <Text style={styles.textBase}>Nenhuma visita detalhada encontrada para este dia.</Text>
                </View>
            );
        }

        return visitasDetalhes.map(quarteirao => (
            <View key={quarteirao._id} style={styles.quarteiraoGroup}>
                <Text style={styles.quarteiraoTitle}>
                    Quarteirão {quarteirao.numeroQuarteirao} ({quarteirao.nomeArea})
                </Text>
                {quarteirao.visitas.map(visita => (
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
        ));
    };

    if (loading) {
        return (
            <View style={styles.fullScreenContainer}>
                <Cabecalho navigation={navigation} />
                <ActivityIndicator size="large" color="#2CA856" style={styles.loadingIndicator} />
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            <Cabecalho navigation={navigation} />

            <ScrollView contentContainerStyle={scrollContentStyle}>
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

// Estilos
const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    containerWithData: {
        flexGrow: 1,
        paddingHorizontal: width(4), // Padronizado para width(4)
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
        fontSize: font(5), // Mantido
        fontWeight: "bold",
        color: '#05419A',
        paddingBottom: height(0.5),
        alignSelf: "center",
        marginTop: height(1)
    },
    subTituloInfo: {
        fontSize: font(2.5), // Mantido
        color: '#333',
        marginBottom: height(1.5), // Mantido
        alignSelf: "center",
        textAlign: 'center',
    },
    textBold: {
        fontWeight: 'bold',
    },
    // BOX DE CONTEÚDO (dentro da section)
    box: {
        padding: height(2.5), // Ajustado para altura
        backgroundColor: "#e0e0e0",
        borderRadius: width(2), // Mantido
        marginBottom: height(0.5),
    },
    subtitulo: {
        fontWeight: "600",
        fontSize: font(2.5), // Padronizado para font(2.5) como no exemplo
        marginBottom: height(0.5),
        color: '#333'
    },
    textBase: {
        fontSize: font(2.25), // Mantido
        marginBottom: height(0.5), // Ajustado para height(0.5) para mais espaçamento
        color: '#333',
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width(5),
    },
    // HEADER DA SECTION
    sectionHeaderContainer: {
        backgroundColor: "#05419A",
        borderRadius: width(1.5), // Mantido
        marginBottom: height(0.5),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width(4), // Mantido
        paddingVertical: height(2), // Mantido
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: font(3), // Mantido
        color: '#eee',
        flexShrink: 1,
    },
    arrowIcon: {
        marginLeft: width(2),
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: height(1), // Aumentado o espaçamento
    },
    // BOTÃO DETALHES DAS VISITAS
    loadVisitasButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2CA856', // Cor verde do exemplo
        padding: height(2),
        borderRadius: width(2),
        // marginTop: height(1.5),
    },
    loadVisitasButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: font(2.5),
        marginRight: width(2),
    },
    visitasContainer: {
        // Estilos para o contêiner dos detalhes das visitas
        marginBottom: height(2),
        marginTop: height(0.5),
    },
    quarteiraoGroup: {
        backgroundColor: '#f9f9f9',
        borderRadius: width(2), // Aumentado para width(2)
        padding: width(4), // Aumentado para width(4)
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
        borderBottomColor: '#ccc', // Alterado para #ccc para ser mais sutil
        paddingBottom: height(1),
    },
    visitaItem: {
        backgroundColor: '#fff',
        padding: width(4), // Aumentado para width(4)
        borderRadius: width(1.5), // Aumentado
        marginBottom: height(0.5), // Aumentado
        borderLeftWidth: width(1), // Usando width
        borderLeftColor: '#2CA856',
    },
    textBaseTipo: {
        fontSize: font(2.25), // Padronizado
        color: '#666',
        marginTop: height(0.25),
    },
    textBaseData: {
        fontSize: font(2.25), // Padronizado
        color: '#666',
        fontStyle: 'italic',
        marginTop: height(0.25),
    },
});