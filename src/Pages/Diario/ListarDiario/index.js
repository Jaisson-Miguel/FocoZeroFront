import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import Cabecalho from '../../../Components/Cabecalho'; 
import { API_URL } from "../../../config/config";
import { height, width, font } from "../../../utils/responsive";

// --- Funções de Utilidade ---

const formatarDataUTC = (dateString) => {
    if (!dateString) return 'Data Desconhecida';
    
    const dateObj = new Date(dateString);

    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
};

const extrairDataParaAPI = (dateString) => {
    if (!dateString) return null;
    return dateString.split('T')[0];
};

/**
 * Calcula o número da semana ISO (1 a 52/53) para a data de hoje.
 * Este é um cálculo comum, mas você deve garantir que corresponde ao seu backend.
 */
const getSemanaAtual = () => {
    const dataAtual = new Date();
    
    // Cria uma cópia da data para evitar mutação
    const data = new Date(Date.UTC(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate()));
    
    // Ajusta para o dia da semana (0=domingo, 6=sábado)
    const dayNum = data.getUTCDay() || 7;
    
    // Seta a data para a quinta-feira da semana (meio da semana ISO)
    data.setUTCDate(data.getUTCDate() + 4 - dayNum);
    
    // Obtém o início do ano
    const yearStart = new Date(Date.UTC(data.getUTCFullYear(), 0, 1));
    
    // Calcula a diferença em milissegundos e depois em semanas
    const weekNo = Math.ceil((((data - yearStart) / 86400000) + 1) / 7);
    
    return weekNo;
};


// ----------------------------------------------------------------------
// --- COMPONENTE PRINCIPAL (COM CORREÇÃO DO ESCOPO DO NAVIGATION) ---
// ----------------------------------------------------------------------

export default function ListarDiario({ navigation, route }) {
    
    const { idAgente } = route.params; 

    const [semanas, setSemanas] = useState([]);
    const [areaNamesCache, setAreaNamesCache] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [semanaExpandidaId, setSemanaExpandidaId] = useState(null); 
    const [semanaAtual, setSemanaAtual] = useState(null); // Estado para a semana atual
    
    // --- FUNÇÃO CORRIGIDA: AGORA DENTRO DO ESCOPO ---
    const handleFecharSemanal = () => {
        if (!semanaAtual) {
            Alert.alert("Atenção", "Não foi possível determinar a semana atual para fechamento.");
            return;
        }

        // 💡 Ajuste o nome da tela ('FecharSemanalScreen') para o nome que você usou no seu Stack Navigator
        navigation.navigate("FecharSemanal", { 
            idAgente: idAgente,
            semana: semanaAtual, // Passa a semana atual para a tela de fechamento
        });
    };
    // --- FIM DA FUNÇÃO CORRIGIDA ---


    const fetchAreaName = useCallback(async (idArea) => {
        if (!idArea || areaNamesCache[idArea]) {
            return areaNamesCache[idArea];
        }
        
        try {
            // 💡 Ajuste: Usando /areas/:idArea, conforme sua implementação
            const url = `${API_URL}/areas/${idArea}`; 
            const res = await fetch(url);
            
            if (!res.ok) {
                console.warn(`Aviso: Não foi possível buscar nome da área ${idArea}. Status: ${res.status}`);
                return `Área ID: ${idArea}`;
            }
            
            const data = await res.json();
            // 💡 Ajuste: Pega o nome, seja 'nome' ou 'nomeArea' no retorno
            const nomeEncontrado = data.nome || data.nomeArea; 

            if (nomeEncontrado) {
                setAreaNamesCache(prevCache => ({ ...prevCache, [idArea]: nomeEncontrado }));
                return nomeEncontrado;
            }
            
            return `Área ID: ${idArea}`;
        } catch (err) {
            console.error(`ERROR ao buscar nome da área ${idArea}:`, err.message);
            return `Erro ID: ${idArea}`;
        }
    }, [areaNamesCache]);

    const fetchDiarios = async (agenteId) => {
        setLoading(true);
        // 💡 Ajuste: Use a rota que retorna diários agrupados por semana
        const url = `${API_URL}/diarios/agente/${agenteId}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.statusText}`);
            }

            const data = await response.json();
            
            const allAreaIds = new Set();
            data.forEach(semana => {
                semana.diarios.forEach(diario => {
                    if (diario.idArea && !diario.nomeArea) { 
                        allAreaIds.add(diario.idArea);
                    }
                });
            });

            const areaPromises = Array.from(allAreaIds).map(id => 
                fetchAreaName(id).then(name => ({ id, name }))
            );

            const areaResults = await Promise.all(areaPromises);
            
            const newAreaNames = areaResults.reduce((acc, current) => {
                acc[current.id] = current.name;
                return acc;
            }, {});

            setAreaNamesCache(prevCache => ({ ...prevCache, ...newAreaNames }));
            
            const updatedSemanas = data.map(semana => ({
                ...semana,
                diarios: semana.diarios.map(diario => {
                    const nomeReal = diario.nomeArea || areaNamesCache[diario.idArea] || newAreaNames[diario.idArea];
                    
                    return {
                        ...diario,
                        nomeArea: nomeReal || `Área ID: ${diario.idArea}`
                    };
                }),
            }));

            setSemanas(updatedSemanas);
            
        } catch (error) {
            console.error("ERRO GERAL NA BUSCA:", error.message);
            Alert.alert("Erro", `Não foi possível carregar os diários. Detalhe: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Define a semana atual ao carregar o componente
        setSemanaAtual(getSemanaAtual()); 
        
        if (idAgente) {
            fetchDiarios(idAgente);
        } else {
            console.error("DiariosScreen: idAgente não recebido.");
            setLoading(false);
            Alert.alert("Erro", "ID do Agente não encontrado.");
        }
    }, [idAgente]);


    const renderDiarioItem = ({ item }) => {
        
        const dataApenas = extrairDataParaAPI(item.data); 

        return (
            <TouchableOpacity 
                onPress={() => navigation.navigate('DetalheDiario', { 
                    diarioId: item._id, 
                    nomeArea: item.nomeArea, 
                    dataDiario: dataApenas 
                })}
                style={styles.diarioItem} 
            >
                <View style={styles.diarioItemContent}>
                    <Text 
                        style={styles.diarioData}
                        numberOfLines={0}
                        ellipsizeMode="tail"
                    >
                        {`${item.nomeArea} - ${formatarDataUTC(item.data)}`} 
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSemanaItem = ({ item }) => {
        const isExpanded = semanaExpandidaId === item._id; 

        return (
            <View style={styles.semanaContainer}>
                <TouchableOpacity 
                    onPress={() => setSemanaExpandidaId(isExpanded ? null : item._id)}
                    style={styles.semanaHeader} 
                >
                    <Text style={styles.semanaTitle}> 
                        Semana: {item._id} ({item.totalDiarios} Diários) 
                    </Text>
                    <Icon
                        name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={font(3)}
                        color="#eee"
                        style={styles.arrowIcon}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <FlatList
                        data={item.diarios.sort((a, b) => new Date(a.data) - new Date(b.data))}
                        renderItem={renderDiarioItem}
                        keyExtractor={diario => diario._id.toString()}
                        style={styles.diariosList}
                    />
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#05419A" />
                <Text style={{ marginTop: font(1.5) }}>Carregando diários...</Text>
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <Cabecalho navigation={navigation} />
            <View style={styles.container}>
                <View style={styles.screenTitleContainer}>
                    <Text style={styles.screenTitle}>HISTÓRICO DE DIÁRIOS</Text>
                </View>

                <FlatList
                    data={semanas}
                    renderItem={renderSemanaItem}
                    keyExtractor={item => item._id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum diário encontrado para este agente.</Text>}
                />
            </View>
            <TouchableOpacity
                style={styles.closeDiaryButton}
                onPress={handleFecharSemanal} // Chamando a função corrigida
                activeOpacity={0.8}
            >
                <Text style={styles.closeDiaryButtonText}>FECHAR SEMANAL (Semana {semanaAtual})</Text>
            </TouchableOpacity>
        </View>
        
    );
}

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

    screenTitleContainer: {
        backgroundColor: "#fff",
        paddingVertical: height(2),
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#05419A",
    },
    screenTitle: {
        color: "#05419A",
        fontSize: font(4),
        fontWeight: 'bold',
    },

    semanaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: "#05419A",
        paddingHorizontal: width(4),
        paddingVertical: height(1.5),
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    semanaTitle: {
        color: "#fff",
        fontSize: font(3),
        fontWeight: "bold",
        flex: 1,
    },
    arrowIcon: { 
        marginLeft: width(2),
    },


    semanaContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },

    diariosList: {
        backgroundColor: "#fff",
    },
    
    diarioItem: {
        backgroundColor: "#ecececff",
        paddingVertical: height(1.5),
        paddingHorizontal: width(4),
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: width(8),
    },
    diarioItemContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    diarioData: {
        fontSize: font(3),
        color: "#05419A",
        fontWeight: "600",
        flex: 1,
        flexWrap: "wrap",
    },

    emptyText: {
        padding: height(3),
        textAlign: 'center',
        color: '#666',
        fontSize: font(3.5),
    },
    listContent: {
        paddingBottom: height(2),
    },
    closeDiaryButton: {
    position: "absolute",
    bottom: height(2), 
    left: width(5),
    right: width(5),
    backgroundColor: "#05419A", // Mudei a cor para destacar o Fechamento Semanal
    paddingVertical: height(2),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    },
    closeDiaryButtonText: {
    color: "#fff", 
    fontSize: font(2.5),
    fontWeight: "bold",
    },
});