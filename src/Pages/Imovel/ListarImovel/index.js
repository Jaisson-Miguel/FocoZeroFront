import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cabecalho from "../../../Components/Cabecalho";
import { useFocusEffect } from "@react-navigation/native";
// MaterialCommunityIcons foi removido, pois o checkbox foi retirado.
// import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import { height, width, font } from "../../../utils/responsive.js"; // Mantido se você usa estas utilities

const mapearTipoImovel = (tipoAbreviado) => {
    const tipos = {
        'c': 'Comércio', 
        'r': 'Residência', 
        'tb': 'Terreno Baldio', 
        'pe': 'P. Estratégico',
        'out': 'Outros', 
    };
    
    // Tenta mapear diretamente. Se não, tenta mapear por algumas strings comuns.
    const getTipo = (valor) => {
        if (!valor) return "NÃO ESPECIFICADO";
        const v = String(valor).toLowerCase().trim();
        
        // Mapeamento por substring ou valor direto (ajuste conforme a real lógica da API)
        if (v.includes('comércio') || v.includes('c')) return 'Comércio';
        if (v.includes('residência') || v.includes('r')) return 'Residência';
        if (v.includes('terreno') || v.includes('tb')) return 'Terreno Baldio';
        if (v.includes('estratégico') || v.includes('pe')) return 'P. Estratégico';
        if (v.includes('outros') || v.includes('out')) return 'Outros';

        return tipos[v] || (tipoAbreviado ? String(tipoAbreviado).toUpperCase() : "NÃO ESPECIFICADO");
    };

    return getTipo(tipoAbreviado) || "NÃO ESPECIFICADO";
};

const screenWidth = Dimensions.get('window').width;

export default function ImovelOffline({ route, navigation }) {
    const { quarteirao } = route.params;
    const { idArea, nomeArea } = route.params; // <-- Exemplo de como obter
    const [imoveis, setImoveis] = useState({});
    const [loading, setLoading] = useState(true);
    const offline = true;

    const agruparImoveisPorRua = (imoveisArray) => {
        return imoveisArray.reduce((acc, imovel) => {
            // A imagem mostra a rua com o nome completo
            const rua = imovel.logradouro || "Rua Desconhecida"; 
            if (!acc[rua]) {
                acc[rua] = [];
            }
            acc[rua].push(imovel);
            return acc;
        }, {});
    };

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;

            const carregarImoveis = async () => {
                setLoading(true);
                try {
                    const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
                    let todos = rawImoveis ? JSON.parse(rawImoveis) : [];

                    const filtrados = todos.filter(
                        (i) => i.idQuarteirao === quarteirao._id
                    );

                    filtrados.sort((a, b) => {
                        const numA = parseInt(String(a.numero).replace(/[^0-9]/g, '')) || 0;
                        const numB = parseInt(String(b.numero).replace(/[^0-9]/g, '')) || 0;
                        return numA - numB;
                    });


                    const agrupados = agruparImoveisPorRua(filtrados);

                    if (isActive) setImoveis(agrupados);
                } catch (err) {
                    console.log("Erro ao carregar imóveis offline:", err);
                    if (isActive) setImoveis({});
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            carregarImoveis();

            return () => {
                isActive = false;
            };
        }, [quarteirao])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#05419A" />
            </View>
        );
    }

    const ruas = Object.keys(imoveis);

    return (
        <View style={styles.container}>
            <Cabecalho navigation={navigation} /> 

            <ScrollView style={styles.scrollView}>
                {/* Cabeçalho da Área: Agora puxado dos dados do quarteirão */}
            <View style={styles.simpleTitleContainer}>
              
              <Text style={styles.simpleTitle}>
                {quarteirao.nomeArea} - {quarteirao.numero}
              </Text>
              <Text style={styles.simpleSubtitle}>
                Código {quarteirao.codigoArea} - Zona {quarteirao.zonaArea}
              </Text>
            </View>

                {ruas.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum imóvel encontrado.</Text>
                ) : (
                    ruas.map((rua) => (
                        <View key={rua}>
                            {/* Cabeçalho de Rua (Rua Alves Brito, Rua G) */}
                            <Text style={styles.streetHeader}>{rua}</Text> 
                            
                            {imoveis[rua].map((imovel) => {
                                // Lógica de status
                                const isDisabled = imovel.status === "visitado"; 
                                const tipoDoImovel = imovel.complemento || imovel.tipo;
                                const tipoMapeado = mapearTipoImovel(tipoDoImovel); 
                                const contentText = `Nº ${imovel.numero} - ${tipoMapeado}`;

                                return (
                                    <View key={imovel._id} style={styles.imovelItem}>
                                        <View style={styles.imovelLeft}>
                                            <TouchableOpacity 
                                                style={styles.imovelTextTouchable}
                                                onPress={() =>
                                                    navigation.navigate("Visita", {
                                                        imovel,
                                                        idArea: quarteirao.idArea,
                                                        nomeArea: quarteirao.nomeArea,
                                                        quarteirao,
                                                    })
                                                }
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.imovelText, isDisabled && styles.imovelTextVisited]}>
                                                    {contentText}
                                                </Text>
                                                {/* Se houver recusa, pode ser exibido aqui */}
                                                {/* {imovel.status === "recusa" && <Text style={styles.recusaText}>Recusa</Text>} */}
                                            </TouchableOpacity>
                                        </View>

                                        {/* Botão Editar (na direita, como na imagem) */}
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() =>
                                                navigation.navigate("EditarImovelOffline", {
                                                    imovel,
                                                    offline,
                                                })
                                            }
                                        >
                                            <Text style={styles.editText}>Editar</Text>
                                        </TouchableOpacity>

                                    </View>
                                );
                            })}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5", // Fundo levemente cinza
    },
    scrollView: {
        flex: 1,
    },
    
    // --- Estilos do Cabeçalho da Área (Título Dinâmico) ---
    areaHeaderContainer: {
        paddingVertical: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    areaTitle: {
        fontSize: 18, 
        fontWeight: "bold",
        color: "#05419A", // Azul escuro
        textTransform: 'uppercase',
    },
    areaSubtitle: {
        fontSize: 12, 
        color: "#666",
        textTransform: 'uppercase',
        marginTop: 2,
    },

    // --- Estilos do Cabeçalho de Rua (Rua Alves Brito) ---
    streetHeader: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white", // Letra branca
        backgroundColor: "#05419A", // Fundo azul
        paddingVertical: 10,
        paddingHorizontal: 15,
    },

    // --- Estilos da Linha de Imóvel ---
    imovelItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8, 
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingLeft: 30, // Recuo de 15px para a direita (ajuste conforme necessário)
    },
    imovelLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    imovelTextTouchable: {
        flex: 1, // Permite que o texto ocupe o espaço
        paddingVertical: 5, // Ajusta a área de toque
    },
    
    // --- Estilos do Texto do Imóvel (Nº 01 - Comércio) ---
    imovelText: {
        fontSize: 15, 
        color: "#333", 
    },
    imovelTextVisited: {
        color: 'gray', // Exemplo de estilo para indicar visitado sem checkbox
    },
    
    // --- Estilos do Botão Editar ---
    editButton: {
        backgroundColor: "#4CAF50", // Verde vibrante da imagem
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    editText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14, 
    },
    
    // --- Outros ---
    emptyText: {
        textAlign: "center",
        color: "gray",
    },
    simpleTitleContainer: {
            paddingHorizontal: 15,
            alignItems:"center",
            paddingVertical: 10,
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
        },
        simpleTitle: {
            fontSize: font(3.5),
            fontWeight: "bold",
            color: "#05419A",
            textTransform: 'uppercase',
        },
        simpleSubtitle: {
            fontSize: font(2.25),
            color: "#666",
            textTransform: 'uppercase',
        },
});