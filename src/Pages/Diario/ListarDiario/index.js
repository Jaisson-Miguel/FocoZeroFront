import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
// ✅ IMPORTAÇÃO NECESSÁRIA PARA OS ÍCONES
import Icon from 'react-native-vector-icons/Ionicons'; 
// Certifique-se de que a importação do Cabeçalho está correta, dependendo da sua estrutura de pastas
// Importação simulada, ajuste o caminho se necessário:
import Cabecalho from '../../../Components/Cabecalho'; 
import { API_URL } from "../../../config/config";
import { height, width, font } from "../../../utils/responsive";


// Função utilitária para formatar a data como DD/MM/AAAA (para exibição)
const formatarDataUTC = (dateString) => {
    if (!dateString) return 'Data Desconhecida';
    
    const dateObj = new Date(dateString);

    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
};

// Função para extrair apenas AAAA-MM-DD da string ISO (para API)
const extrairDataParaAPI = (dateString) => {
    if (!dateString) return null;
    return dateString.split('T')[0];
};

export default function ListarDiario({ navigation, route }) {
    
    const { idAgente } = route.params; 

    const [semanas, setSemanas] = useState([]);
    // ✅ Novo estado para armazenar o mapa de ID da Área para Nome (cache)
    const [areaNamesCache, setAreaNamesCache] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [semanaExpandidaId, setSemanaExpandidaId] = useState(null); 
    
    // --- FUNÇÃO PARA BUSCAR O NOME DA ÁREA ---
    const fetchAreaName = useCallback(async (idArea) => {
        if (!idArea || areaNamesCache[idArea]) {
            return areaNamesCache[idArea];
        }
        
        try {
            const url = `${API_URL}/areas/${idArea}`; 
            const res = await fetch(url);
            
            if (!res.ok) {
                console.warn(`Aviso: Não foi possível buscar nome da área ${idArea}. Status: ${res.status}`);
                return `Área ID: ${idArea}`; // Retorna um fallback
            }
            
            const data = await res.json();
            const nomeEncontrado = data.nome || data.nomeArea; 

            if (nomeEncontrado) {
                // Atualiza o cache e retorna o nome
                setAreaNamesCache(prevCache => ({ ...prevCache, [idArea]: nomeEncontrado }));
                return nomeEncontrado;
            }
            
            return `Área ID: ${idArea}`; // Retorna fallback se o nome não for encontrado no objeto
        } catch (err) {
            console.error(`ERROR ao buscar nome da área ${idArea}:`, err.message);
            return `Erro ID: ${idArea}`; // Retorna erro
        }
    }, [areaNamesCache]); // Depende do cache para evitar chamadas duplicadas

    // --- FUNÇÃO PRINCIPAL DE BUSCA DE DIÁRIOS ---
    const fetchDiarios = async (agenteId) => {
        setLoading(true);
        const url = `${API_URL}/diarios/agente/${agenteId}`;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.statusText}`);
            }

            const data = await response.json();
            
            // 1. Coleta todos os IDs de área únicos
            const allAreaIds = new Set();
            data.forEach(semana => {
                semana.diarios.forEach(diario => {
                    // Adiciona o idArea (se existir e não tiver nomeArea)
                    if (diario.idArea && !diario.nomeArea) { 
                        allAreaIds.add(diario.idArea);
                    }
                });
            });

            // 2. Cria um array de promessas para buscar todos os nomes de área
            const areaPromises = Array.from(allAreaIds).map(id => 
                fetchAreaName(id).then(name => ({ id, name }))
            );

            // 3. Executa as buscas em paralelo
            const areaResults = await Promise.all(areaPromises);
            
            // 4. Cria um mapa (ID -> Nome) dos resultados
            const newAreaNames = areaResults.reduce((acc, current) => {
                acc[current.id] = current.name;
                return acc;
            }, {});

            // 5. Atualiza o cache com os novos nomes
            setAreaNamesCache(prevCache => ({ ...prevCache, ...newAreaNames }));
            
            // 6. Atualiza a lista de diários ANEXANDO o nome da área
            const updatedSemanas = data.map(semana => ({
                ...semana,
                diarios: semana.diarios.map(diario => {
                    // Se o diário já tem nomeArea OU se conseguimos o nome pelo idArea no cache
                    const nomeReal = diario.nomeArea || areaNamesCache[diario.idArea] || newAreaNames[diario.idArea];
                    
                    return {
                        ...diario,
                        // ✅ Passa o nome real ou um fallback
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
        if (idAgente) {
            fetchDiarios(idAgente);
        } else {
            console.error("DiariosScreen: idAgente não recebido.");
            setLoading(false);
            Alert.alert("Erro", "ID do Agente não encontrado.");
        }
    }, [idAgente]);


    // Renderiza o detalhe de um único diário
    const renderDiarioItem = ({ item }) => {
        
        const dataApenas = extrairDataParaAPI(item.data); 

        return (
            <TouchableOpacity 
                onPress={() => navigation.navigate('DetalheDiario', { 
                    diarioId: item._id, 
                    // ✅ O 'item.nomeArea' agora está garantido de ter o nome real ou o fallback
                    nomeArea: item.nomeArea, 
                    dataDiario: dataApenas 
                })}
                // Estilo padronizado como o 'listItem'
                style={styles.diarioItem} 
            >
                <View style={styles.diarioItemContent}>
                    {/* Exibição: "NOME DA AREA - DATA" */}
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
                    style={styles.semanaHeader} // Estilo padronizado como o 'groupHeaderContainer'
                >
                    <Text style={styles.semanaTitle}> 
                        Semana: {item._id} ({item.totalDiarios} Diários) 
                    </Text>
                    {/* ✅ SUBSTITUIÇÃO AQUI */}
                    <Icon
                        name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={font(3)}
                        color="#eee"
                        style={styles.arrowIcon}
                    />
                    {/* FIM DA SUBSTITUIÇÃO */}
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
        </View>
    );
}

// 🎨 ESTILOS PADRONIZADOS COM RESPONSIVIDADE
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

    // Novo Estilo para o Título da Tela (Semelhante ao 'areasTitleContainer')
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
        fontWeight: 'bold', // Adicionado para dar mais destaque
    },

    // Estilo do Cabeçalho da Semana (Semelhante ao 'groupHeaderContainer')
    semanaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: "#05419A", // Cor primária
        paddingHorizontal: width(4),
        paddingVertical: height(1.5),
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    semanaTitle: {
        color: "#fff", // Cor de texto branco
        fontSize: font(3),
        fontWeight: "bold",
        flex: 1,
    },
    // ✅ REMOVIDO: toggleIcon
    // toggleIcon: {
    //     fontSize: font(3), // Ajustado para font()
    //     fontWeight: 'bold',
    //     color: "#fff",
    //     marginLeft: width(2),
    // },
    // ✅ NOVO: Estilo para o Icon
    arrowIcon: { 
        marginLeft: width(2),
    },


    // Container da Semana (Seção Agrupadora)
    semanaContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },

    // Lista de Diários de uma Semana
    diariosList: {
        backgroundColor: "#fff",
    },
    
    // Item do Diário (Semelhante ao 'listItem')
    diarioItem: {
        backgroundColor: "#ecececff",
        paddingVertical: height(1.5),
        paddingHorizontal: width(4),
        borderBottomWidth: 1,
        borderBottomColor: "#ccc", // Um cinza mais claro para sub-itens
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: width(8), // Recuo maior para indicar que é um sub-item
    },
    diarioItemContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    diarioData: {
        fontSize: font(3), // Tamanho de fonte padrão
        color: "#05419A", // Cor primária
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
        paddingBottom: height(2), // Adiciona um pequeno padding no final da lista
    }
});