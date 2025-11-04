import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import Cabecalho from '../../../Components/Cabecalho'; 
import { API_URL } from "../../../config/config";
import { height, width, font } from "../../../utils/responsive";

// --- Substituição Customizada para CheckBox (Resolve o erro nativo) ---
const CustomCheckBox = ({ value, onValueChange, disabled }) => (
    <TouchableOpacity
        onPress={onValueChange}
        disabled={disabled}
        style={[
            customStyles.checkboxBase,
            value && customStyles.checkboxChecked,
            disabled && customStyles.checkboxDisabled
        ]}
    >
        {/* Usando o ícone de marca de verificação do Ionicons */}
        {value && <Icon name="checkmark" size={font(3)} color="#fff" />} 
    </TouchableOpacity>
);

// --- COMPONENTE FECHAR SEMANAL ---

export default function FecharSemanalScreen({ navigation, route }) {
    // Parâmetros passados da tela anterior
    const { idAgente, semana } = route.params; 

    const [areasPendentes, setAreasPendentes] = useState([]);
    const [areasSelecionadas, setAreasSelecionadas] = useState([]); // Array de IDs de Área (string)
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [mensagemStatus, setMensagemStatus] = useState('');
    
    const semanaAtual = semana;

    // 1. Busca as áreas pendentes para fechamento
    const fetchAreasPendentes = useCallback(async () => {
        setLoading(true);
        setMensagemStatus('');
        try {
            const url = `${API_URL}/diariosPendentesFechamento/${idAgente}/${semanaAtual}`;
            const response = await fetch(url);
            
            if (response.status === 404) {
                // Caso a rota retorne 404 conforme a lógica do backend (sem diários ou todos fechados)
                const data = await response.json();
                setMensagemStatus(data.message);
                setAreasPendentes([]);
                setAreasSelecionadas([]);
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.statusText}`);
            }

            const data = await response.json();
            setAreasPendentes(data);
            
            // Pré-selecionar todas as áreas pendentes
            const ids = data.map(area => area.idArea.toString());
            setAreasSelecionadas(ids);
            
        } catch (error) {
            console.error("ERRO ao buscar áreas pendentes:", error.message);
            setMensagemStatus(`Erro ao carregar a lista de áreas: ${error.message}`);
            // Alert.alert("Erro", "Não foi possível carregar as áreas pendentes para o fechamento.");
        } finally {
            setLoading(false);
        }
    }, [idAgente, semanaAtual]);

    useEffect(() => {
        if (idAgente && semanaAtual) {
            fetchAreasPendentes();
        } else {
            setLoading(false);
            Alert.alert("Erro de Parâmetro", "ID do Agente ou Número da Semana não foi passado corretamente.");
        }
    }, [idAgente, semanaAtual, fetchAreasPendentes]);
    
    // 2. Lógica para marcar/desmarcar uma área
    const toggleSelecaoArea = (idArea) => {
        const idString = idArea.toString();
        setAreasSelecionadas(prevIds => {
            if (prevIds.includes(idString)) {
                // Desmarca
                return prevIds.filter(id => id !== idString); 
            } else {
                // Marca
                return [...prevIds, idString]; 
            }
        });
    };

    // 3. Função principal para fechar o semanal
    const handleFecharSemanal = async () => {
        if (areasSelecionadas.length === 0) {
            Alert.alert("Atenção", "Selecione pelo menos uma área para fechar o relatório semanal.");
            return;
        }

        setIsClosing(true);
        setMensagemStatus('');
        let sucessoCount = 0;
        let falhaCount = 0;
        
        // Loop para cadastrar o Semanal para CADA área selecionada
        for (const idArea of areasSelecionadas) {
            try {
                const response = await fetch(`${API_URL}/cadastrarSemanal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idAgente: idAgente,
                        idArea: idArea,
                        semana: semanaAtual,
                        atividade: 4 // Atividade padrão
                    })
                });

                if (response.ok) {
                    sucessoCount++;
                } else {
                    const errorData = await response.json();
                    console.error(`Falha ao fechar Semanal da Área ${idArea}:`, errorData.message);
                    falhaCount++;
                }
            } catch (error) {
                console.error(`Erro de conexão ao fechar Semanal da Área ${idArea}:`, error.message);
                falhaCount++;
            }
        }

        setIsClosing(false);
        
        if (falhaCount === 0) {
             Alert.alert("Sucesso", `✅ Relatórios semanais de ${sucessoCount} área(s) fechados!`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert(
                "Concluído com Falhas",
                `Fechamento finalizado: ${sucessoCount} área(s) fechada(s) com sucesso. ${falhaCount} área(s) falharam no processo.`
            );
        }
        
        // Recarrega a lista para remover as áreas recém-fechadas
        fetchAreasPendentes(); 
    };
    
    // 4. Componente de item da lista
    const renderAreaItem = ({ item }) => {
        const isSelected = areasSelecionadas.includes(item.idArea.toString());
        return (
            <TouchableOpacity 
                style={[styles.areaItem, isSelected && styles.areaItemSelected]}
                onPress={() => toggleSelecaoArea(item.idArea)}
                activeOpacity={0.7}
                disabled={isClosing}
            >
                <View style={styles.areaDetails}>
                    <Text style={styles.areaName}>{item.nomeArea}</Text>
                    <Text style={styles.areaInfo}>
                        Diários: {item.diariosCount} | Dias Trabalhados: {item.qtdDiasTrabalhados}
                    </Text>
                </View>
                {/* Usa o CustomCheckBox em vez do componente nativo */}
                <CustomCheckBox
                    value={isSelected}
                    onValueChange={() => toggleSelecaoArea(item.idArea)}
                    disabled={isClosing}
                />
            </TouchableOpacity>
        );
    };

    // 5. Renderização
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#05419A" />
                <Text style={{ marginTop: font(1.5) }}>Buscando áreas pendentes...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.safeArea}>
            <Cabecalho navigation={navigation} />
            <View style={styles.container}>
                <View style={styles.screenTitleContainer}>
                    <Text style={styles.screenTitle}>FECHAR SEMANAL - SEMANA {semanaAtual}</Text>
                </View>
                
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Mensagem de Status */}
                    {mensagemStatus ? (
                         <View style={styles.statusBox}>
                            <Text style={styles.statusText}>{mensagemStatus}</Text>
                         </View>
                    ) : (
                        <>
                            <Text style={styles.instructionText}>
                                Selecione as áreas que deseja fechar o relatório semanal (o sistema irá agregar automaticamente todos os diários desta semana para as áreas selecionadas).
                            </Text>

                            <FlatList
                                data={areasPendentes}
                                renderItem={renderAreaItem}
                                keyExtractor={item => item.idArea.toString()}
                                scrollEnabled={false} 
                                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma área com diário pendente de fechamento semanal.</Text>}
                            />
                        
                            {areasPendentes.length > 0 && (
                                <Text style={styles.selectionCount}>
                                    {areasSelecionadas.length} área(s) selecionada(s) de {areasPendentes.length}
                                </Text>
                            )}
                        </>
                    )}
                </ScrollView>
                
                {/* Botão de Fechamento */}
                {areasPendentes.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.closeButton, 
                            (areasSelecionadas.length === 0 || isClosing) && styles.closeButtonDisabled
                        ]}
                        onPress={handleFecharSemanal}
                        activeOpacity={0.8}
                        disabled={areasSelecionadas.length === 0 || isClosing}
                    >
                        {isClosing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.closeButtonText}>
                                CONFIRMAR FECHAMENTO SEMANAL
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// --- Styles do Custom CheckBox ---
const customStyles = StyleSheet.create({
    checkboxBase: {
        width: width(6),
        height: width(6),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#666',
        marginRight: width(2),
    },
    checkboxChecked: {
        backgroundColor: '#28a745',
        borderColor: '#28a745',
    },
    checkboxDisabled: {
         backgroundColor: '#ccc',
         borderColor: '#999',
    }
});


// --- Styles da Tela de Fechamento ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        paddingHorizontal: width(4),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    screenTitleContainer: {
        paddingVertical: height(2),
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#05419A",
        marginBottom: height(2),
    },
    screenTitle: {
        color: "#05419A",
        fontSize: font(3.5),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    instructionText: {
        fontSize: font(2.5),
        color: '#666',
        marginBottom: height(2),
        textAlign: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: height(12), // Espaço para o botão flutuante
    },
    areaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: width(4),
        borderRadius: 8,
        marginBottom: height(1.5),
        borderWidth: 1,
        borderColor: '#ddd',
    },
    areaItemSelected: {
        backgroundColor: '#e6ffe6',
        borderColor: '#28a745',
        borderWidth: 2,
    },
    areaDetails: {
        flex: 1,
        marginRight: width(4),
    },
    areaName: {
        fontSize: font(3),
        fontWeight: 'bold',
        color: '#05419A',
    },
    areaInfo: {
        fontSize: font(2.2),
        color: '#666',
        marginTop: height(0.5),
    },
    emptyText: {
        padding: height(3),
        textAlign: 'center',
        color: '#666',
        fontSize: font(3),
    },
    selectionCount: {
        textAlign: 'right',
        fontSize: font(2.2),
        color: '#05419A',
        marginTop: height(1),
    },
    closeButton: {
        position: "absolute",
        bottom: height(2), 
        left: width(5),
        right: width(5),
        backgroundColor: "#28a745", // Verde para Ação Principal
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
    closeButtonDisabled: {
        backgroundColor: "#ccc",
    },
    closeButtonText: {
        color: "#fff", 
        fontSize: font(2.5),
        fontWeight: "bold",
    },
    statusBox: {
        padding: width(4),
        backgroundColor: '#ffe0e0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ff9999',
        marginBottom: height(2),
    },
    statusText: {
        fontSize: font(2.5),
        color: '#cc0000',
        textAlign: 'center',
    }
});