import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { API_URL } from "../../../config/config";

// Certifique-se de que 'route' está sendo passado como prop.
export default function ListarDiario({ navigation, route }) {
    
    // 🚨 CAPTURANDO O ID DO AGENTE DA ROTA!
    const { idAgente } = route.params; 

    const [semanas, setSemanas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [semanaExpandidaId, setSemanaExpandidaId] = useState(null); 
    
    useEffect(() => {
        if (idAgente) {
            console.log("DiariosScreen: Iniciando busca para idAgente:", idAgente);
            fetchDiarios(idAgente);
        } else {
            console.error("DiariosScreen: idAgente não recebido via navegação.");
            setLoading(false);
            Alert.alert("Erro", "ID do Agente não encontrado para listar diários.");
        }
    }, [idAgente]);

    const fetchDiarios = async (agenteId) => {
        setLoading(true);
        // A URL da API continua a mesma
        const url = `${API_URL}/diarios/agente/${agenteId}`;

        console.log("URL de requisição completa:", url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${seuTokenDeAutenticacao}` 
                },
            });
            
            if (!response.ok) {
                console.error(`Status da resposta: ${response.status}`);
                throw new Error(`Erro de rede: ${response.statusText}`);
            }

            const data = await response.json();
            
            console.log("Dados recebidos da API (agrupados):", data);

            setSemanas(data);
            
        } catch (error) {
            console.error("ERRO GERAL NA BUSCA:", error.message);
            Alert.alert("Erro", `Não foi possível carregar os diários. Detalhe: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Renderiza o detalhe de um único diário com o novo formato
    const renderDiarioItem = ({ item }) => (
        <TouchableOpacity 
            // 🚨 NOVO DESTINO DE NAVEGAÇÃO: 'DetalheDiarioHistorico'
            // Passamos o ID do diário e o nome da área para ser exibido
            onPress={() => navigation.navigate('DetalheDiario', { 
                diarioId: item._id, 
                // Assumindo que o item agora tem 'nomeArea'. Caso contrário, usa 'Área ID'.
                nomeArea: item.nomeArea || `Área ${item.idArea}`,
                dataDiario: item.data // Passa a data para exibição no detalhe
            })}
            style={styles.diarioItem}
        >
            {/* Novo formato de exibição: "NOME DA AREA - DATA" */}
            <Text style={styles.diarioData}>
                {`${item.nomeArea || `Área ${item.idArea}`} - ${new Date(item.data).toLocaleDateString('pt-BR')}`}
            </Text>
            {/* Linhas antigas de Área ID e Visitas Realizadas removidas para simplificar */}
        </TouchableOpacity>
    );

    // Renderiza o grupo de uma semana (o item principal da FlatList)
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
                    <Text style={styles.toggleIcon}>
                        {isExpanded ? '▼' : '▶'}
                    </Text>
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
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Carregando diários...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Histórico de Diários</Text>
            <FlatList
                data={semanas}
                renderItem={renderSemanaItem}
                keyExtractor={item => item._id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum diário encontrado para este agente.</Text>}
            />
        </View>
    );
}

// Estilos (mantidos do seu código original)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 15,
        backgroundColor: '#eee',
        textAlign: 'center'
    },
    semanaContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    semanaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#e6f0ff',
    },
    semanaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#004080',
    },
    toggleIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#004080',
    },
    diariosList: {
        backgroundColor: '#fff',
    },
    diarioItem: {
        padding: 10,
        paddingLeft: 25, 
        borderLeftWidth: 3,
        borderLeftColor: '#2CA856', 
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    diarioData: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    emptyText: {
        padding: 20,
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    }
});