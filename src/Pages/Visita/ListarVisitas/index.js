import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator, 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../../config/config.js";
import Cabecalho from "../../../Components/Cabecalho.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { height, width, font } from "../../../utils/responsive.js"; // Funções responsivas


export default function ListarVisitas({ navigation }) {
    const [visitas, setVisitas] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false); 

    const carregarVisitas = async () => {
        try {
            const visitasSalvas = await AsyncStorage.getItem("visitas");
            if (visitasSalvas) {
                setVisitas(JSON.parse(visitasSalvas));
            } else {
                setVisitas([]); // Garante que o estado é limpo se não houver dados
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar as visitas.");
            console.error(error);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", carregarVisitas);
        return unsubscribe;
    }, [navigation]);

    // Agrupar por área e quarteirão
    const agrupadas = {};
    visitas.forEach((v) => {
        const area = v.nomeArea || "Área Desconhecida";
        const quarteirao = v.nomeQuarteirao || "Quarteirão Desconhecido";

        if (!agrupadas[area]) agrupadas[area] = {};
        if (!agrupadas[area][quarteirao])
            agrupadas[area][quarteirao] = [];
        agrupadas[area][quarteirao].push(v);
    });

    const limparVisitas = async () => {
        Alert.alert(
            "Confirmação",
            "Tem certeza que deseja limpar todas as visitas salvas? Essa ação não pode ser desfeita.",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Sim, Limpar",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("visitas");
                            setVisitas([]);
                            Alert.alert("Sucesso", "Visitas removidas com sucesso!");
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível limpar as visitas.");
                            console.error(error);
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const finalizarDiario = async () => {
        if (isSyncing) return; 
        
        try {
            const visitasSalvas = await AsyncStorage.getItem("visitas");
            const listaVisitas = visitasSalvas ? JSON.parse(visitasSalvas) : [];
            const pendentes = listaVisitas.filter((v) => !v.sincronizado);

            const imoveisSalvos = await AsyncStorage.getItem("dadosImoveis");
            const listaImoveis = imoveisSalvos ? JSON.parse(imoveisSalvos) : [];
            const imoveisEditados = listaImoveis.filter((i) => i.editadoOffline);

            // ⚠️ Se houver algo pendente, bloqueia o acesso
            if (pendentes.length > 0 || imoveisEditados.length > 0) {
                Alert.alert(
                    "Atenção",
                    "Existem visitas ou imóveis pendentes de sincronização. Sincronize antes de finalizar o diário."
                );
                return;
            }

            // ✅ Tudo sincronizado → perguntar se finalizou algum quarteirão
            Alert.alert(
                "Finalizar Diário",
                "Você finalizou algum quarteirão?",
                [
                    {
                        text: "Não",
                        onPress: () => navigation.navigate("ResumoDiario"),
                        style: "cancel",
                    },
                    {
                        text: "Sim",
                        onPress: () => navigation.navigate("AtualizarQuarteirao"),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível finalizar o diário.");
        }
    };

    const sincronizarTudo = async () => {
        if (isSyncing) return;
        setIsSyncing(true);

        try {
            // Visitas pendentes
            const visitasSalvas = await AsyncStorage.getItem("visitas");
            const listaVisitas = visitasSalvas ? JSON.parse(visitasSalvas) : [];
            const pendentes = listaVisitas.filter((v) => !v.sincronizado);

            // Imóveis editados (Nota: esta leitura do AsyncStorage aqui é assíncrona, mas 
            // a função não está no useEffect, então a contagem no Header não será reativa)
            const imoveisSalvos = await AsyncStorage.getItem("dadosImoveis");
            const listaImoveis = imoveisSalvos ? JSON.parse(imoveisSalvos) : [];
            const imoveisEditados = listaImoveis.filter((i) => i.editadoOffline);

            if (pendentes.length === 0 && imoveisEditados.length === 0) {
                Alert.alert("Aviso", "Nenhuma alteração para sincronizar.");
                setIsSyncing(false);
                return;
            }
            
            let sucessoVisitas = 0;
            let sucessoImoveis = 0;

            // 🔹 Sincroniza visitas
            await Promise.all(
                pendentes.map(async (v) => {
                    try {
                        const { sincronizado, ...dadosParaEnviar } = v;
                        const res = await fetch(`${API_URL}/cadastrarVisita`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(dadosParaEnviar),
                        });
                        if (res.ok) {
                            v.sincronizado = true;
                            sucessoVisitas++;
                        }
                    } catch (err) {
                        console.error("Erro ao sincronizar visita:", err);
                    }
                })
            );

            // 🔹 Sincroniza imóveis
            await Promise.all(
                imoveisEditados.map(async (i) => {
                    const { editadoOffline, _id, ...dadosParaEnviar } = i;
                    try {
                        const res = await fetch(`${API_URL}/editarImovel/${_id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(dadosParaEnviar),
                        });
                        if (res.ok) {
                            i.editadoOffline = false;
                            sucessoImoveis++;
                        }
                    } catch (err) {
                        console.error("Erro rede imóvel:", err);
                    }
                })
            );

            // Atualiza AsyncStorage
            await AsyncStorage.setItem("visitas", JSON.stringify(listaVisitas));
            await AsyncStorage.setItem("dadosImoveis", JSON.stringify(listaImoveis));

            // Atualiza state
            setVisitas(listaVisitas);

            Alert.alert(
                "Sincronização Concluída", 
                `Sucesso:\n- ${sucessoVisitas} visitas\n- ${sucessoImoveis} imóveis.`
            );
        } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Falha na sincronização.");
        } finally {
            setIsSyncing(false);
        }
    };

    const getPendentesCount = () => {
        return visitas.filter((v) => !v.sincronizado).length;
    };

    const getEditadosCount = () => {
         // Não reativo, mantido por fidelidade ao código original. Retorna 0 no estado atual.
         return 0; 
    }
    
    // Variável para checar se há visitas
    const hasVisitas = visitas.length > 0;

    return (
        <View style={styles.container}>
            <Cabecalho navigation={navigation} />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Visitas Salvas</Text>
                <Text style={styles.headerSubtitle}>
                    Itens pendentes: {getPendentesCount()}
                </Text>
            </View>

            {/* Ajuste no ScrollView para centralizar o conteúdo quando vazio */}
            <ScrollView contentContainerStyle={!hasVisitas ? styles.scrollViewCentralized : styles.scrollView}>
                {Object.keys(agrupadas).length === 0 ? (
                    <View style={styles.emptyMessageContainer}>
                         <Text style={styles.msg}>Nenhuma visita salva ainda.</Text>
                    </View>
                ) : (
                    <>
                        {Object.keys(agrupadas).map((nomeArea) => (
                            <View key={nomeArea} style={styles.areaBox}>
                                {/* Título da Área (Fundo Azul) */}
                                <Text style={styles.areaTitulo}>{nomeArea.toUpperCase()}</Text>
                                
                                {Object.keys(agrupadas[nomeArea]).map((nomeQuarteirao) => (
                                    <View key={nomeQuarteirao} style={styles.quarteiraoBox}>
                                        {/* Título do Quarteirão (Subtítulo com cor diferente) */}
                                        <Text style={styles.quarteiraoTitulo}>
                                            Quarteirão: {nomeQuarteirao}
                                        </Text>
                                        
                                        {agrupadas[nomeArea][nomeQuarteirao].map((v, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={styles.itemContainer}
                                                onPress={() =>
                                                    navigation.navigate("DetalhesVisita", { visita: v })
                                                }
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.logradouroContainer}>
                                                    <Text style={styles.logradouroText}>
                                                        {v.logradouro}, {v.numero} - ({ (v.tipo || 'Tipo não def.').toUpperCase() })
                                                    </Text>
                                                </View>
                                                
                                                {/* Status de Sincronização */}
                                                <View style={styles.syncStatus}>
                                                    {v.sincronizado ? (
                                                        <MaterialCommunityIcons name="check-circle" size={font(2.5)} color="#4CAF50" />
                                                    ) : (
                                                        <MaterialCommunityIcons name="cloud-sync" size={font(2.5)} color="#F44336" />
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        ))}
                        
                        {/* Botões de Ação - Só aparecem se houver visitas */}
                        {hasVisitas && (
                            <>
                                <TouchableOpacity
                                    style={[styles.botao, styles.botaoSincronizar]}
                                    onPress={sincronizarTudo}
                                    disabled={isSyncing}
                                >
                                    {isSyncing ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.textoBotao}>SINCRONIZAR DADOS</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.botao, styles.botaoFinalizar]}
                                    onPress={finalizarDiario}
                                    disabled={isSyncing}
                                >
                                    <Text style={styles.textoBotao}>FINALIZAR DIÁRIO</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.botao, styles.botaoLimpar]}
                                    onPress={limparVisitas}
                                    disabled={isSyncing}
                                >
                                    <Text style={styles.textoBotao}>LIMPAR VISITAS</Text>
                                </TouchableOpacity>
                                
                                <View style={{ height: height(4) }} /> 
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

// ----------------------------------------------------------------------------------
// ESTILOS RESPONSIVOS COM TODAS AS FUNÇÕES (baseado nas proporções anteriores)
// ----------------------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    // Estilo para o ScrollView quando HÁ conteúdo
    scrollView: {
        paddingHorizontal: width(3.75), // ~15px base
        paddingVertical: height(2.5),     // ~10px base
    },
    // NOVO: Estilo para o contentContainerStyle quando NÃO HÁ conteúdo
    scrollViewCentralized: {
        flexGrow: 1, // Permite que o conteúdo ocupe o espaço total
        justifyContent: 'center', // Centraliza o conteúdo verticalmente
        alignItems: 'center', // Centraliza o conteúdo horizontalmente
    },
    
    // --- Header com contagem de pendentes ---
    header: {
        padding: height(3), // ~15px base
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: font(4), // ~20px base
        fontWeight: 'bold',
        color: '#05419A',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: font(2.), // ~14px base
        color: '#F44336',
        fontWeight: '600',
        textAlign: 'center',
    },

    // --- Agrupamento por Área ---
    areaBox: {
        marginBottom: height(1), // ~20px base
    },
    areaTitulo: {
        fontSize: font(2.75), // ~18px base
        fontWeight: "bold",
        backgroundColor: "#05419A",
        color: "white",
        paddingVertical: height(2),   // ~8px base
        paddingHorizontal: width(2.5), // ~10px base
        marginBottom: height(1),    // ~8px base
        borderRadius: width(1),     // ~4px base
    },

    // --- Agrupamento por Quarteirão ---
    quarteiraoBox: {
        paddingLeft: width(1.25), // ~5px base
        borderLeftWidth: width(0.75), // ~3px base
        borderLeftColor: '#ccc',
        marginBottom: height(1), // ~10px base
    },
    quarteiraoTitulo: {
        fontSize: font(2.5), // ~16px base
        fontWeight: "600",
        color: '#333',
        backgroundColor: '#EAEAEA',
        paddingVertical: height(1.25),  // ~5px base
        paddingHorizontal: width(2.5), // ~10px base
        marginBottom: height(0.25),   // ~5px base
        borderRadius: width(1),      // ~2px base
    },

    // --- Item de Visita ---
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: height(1.75),  // ~12px base
        paddingHorizontal: width(3.75), // ~15px base
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        borderRadius: width(2),      // ~4px base
        marginBottom: height(0.25),   // ~2px base
    },
    logradouroContainer: {
        flex: 1,
        marginRight: width(2.5), // ~10px base
    },
    logradouroText: {
        fontSize: font(2.25), // ~15px base
        color: '#333',
    },
    syncStatus: {
        width: width(5), // ~20px base
        alignItems: 'center',
    },

    // --- Mensagem de Vazio ---
    // NOVO: Container para a mensagem de vazio
    emptyMessageContainer: {
        flex: 1, // Ocupa todo o espaço do contentContainerStyle (centralizado)
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width(5),
    },
    msg: {
        textAlign: "center",
        fontSize: font(2.5), // Aumentei um pouco o tamanho para dar destaque
        color: "#777",
    },

    // --- Botões de Ação ---
    botao: {
        padding: height(2.25), // ~15px base
        borderRadius: width(2.25),
        alignItems: "center",
        marginTop: height(2), // ~15px base
        elevation: 2,
    },
    textoBotao: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: font(2.25), // ~16px base
    },
    
    botaoSincronizar: {
        backgroundColor: "#05419A",
    },
    botaoFinalizar: {
        backgroundColor: "#4CAF50",
    },
    botaoLimpar: {
        backgroundColor: "#F44336",
    },
});