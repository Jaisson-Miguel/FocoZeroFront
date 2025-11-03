import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import Cabecalho from '../../../Components/Cabecalho'; 
import { API_URL } from "../../../config/config";
import { height, width, font } from "../../../utils/responsive";


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

export default function ListarDiario({ navigation, route }) {
    
    const { idAgente } = route.params; 

    const [semanas, setSemanas] = useState([]);
    const [areaNamesCache, setAreaNamesCache] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [semanaExpandidaId, setSemanaExpandidaId] = useState(null); 
    
    const fetchAreaName = useCallback(async (idArea) => {
        if (!idArea || areaNamesCache[idArea]) {
            return areaNamesCache[idArea];
        }
        
        try {
            const url = `${API_URL}/areas/${idArea}`; 
            const res = await fetch(url);
            
            if (!res.ok) {
                console.warn(`Aviso: Não foi possível buscar nome da área ${idArea}. Status: ${res.status}`);
                return `Área ID: ${idArea}`;
            }
            
            const data = await res.json();
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
    }
});