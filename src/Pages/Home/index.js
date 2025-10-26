import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
// 🆕 Importa o Icon. Estou usando 'Ionicons' para os ícones da imagem
import Icon from 'react-native-vector-icons/Ionicons'; 
import { height, width, font } from "../../utils/responsive.js";
import { getFuncao, getNome, getId } from "../../utils/tokenStorage.js";
import Cabecalho from "../../Components/Cabecalho.js"; // Supondo que Cabecalho é o componente azul no topo

// Função auxiliar para renderizar cada botão/item do menu
const MenuItem = ({ iconName, iconColor, bgColor, text, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.menuItemWrapper}>
        <View style={[styles.menuIconContainer, { backgroundColor: bgColor }]}>
            {/* O ícone será uma imagem placeholder ou um ícone real */}
            <Icon name={iconName} size={font(8)} color={iconColor} />
        </View>
        <Text style={styles.menuText}>{text}</Text>
    </TouchableOpacity>
);

export default function Home({ navigation }) {
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [funcao, setFuncao] = useState(false);
    const [idUsuario, setIdUsuario] = useState("");

    useEffect(() => {
        const fetchNome = async () => {
            const nome = await getNome();
            const userFuncao = await getFuncao();
            const userId = await getId();
            if (nome) setNomeUsuario(nome);
            if (userFuncao) setFuncao(userFuncao);
            if (userId) setIdUsuario(userId);
        };
        fetchNome();
    }, []);

    // Definição dos itens de menu com base na função
    const menuItems = (funcao) => {
        if (funcao === "agente") {
            return [
                { 
                    text: "REALIZAR VISITAS", 
                    onPress: () => navigation.navigate("QuarteiraoOffline"), 
                    bgColor: "#2CA856", // Verde
                    iconName: "home-outline", // Ícone de casa 
                    iconColor: '#333',
                },
                { 
                    text: "MINHA ÁREA", 
                    onPress: () => navigation.navigate("ListarAreas", { modo: "visualizar", idUsuario, modoI: "Editar" }), 
                    bgColor: "#CEC931", // Amarelo/Cáqui
                    iconName: "map-outline", // Ícone de mapa 
                    iconColor: '#333',
                },
                { 
                    text: "ÁREAS DO MUNICÍPIO", 
                    onPress: () => navigation.navigate("ListarAreas", { modo: "visualizar", modoI: "Visualizar" }), 
                    bgColor: "#D38B17", // Laranja/Marrom
                    iconName: "map-sharp", // Ícone de mapa com pin
                    iconColor: '#333',
                },
                { 
                    text: "DIÁRIOS", 
                    onPress: () => navigation.navigate("ListarVisitas", { modo: "visualizar" }), 
                    bgColor: "#8ABDE0", // Azul claro
                    iconName: "timer-outline", // Ícone de relógio
                    iconColor: '#333',
                },
            ];
        } 
        
        // Exemplo de itens para ADM, para manter 4 botões na tela
        if (funcao === "adm") {
            return [
                 { 
                    text: "ÁREAS", 
                    onPress: () => navigation.navigate("ListarAreas", { modo: "visualizar", modoI: "Editar" }), 
                    bgColor: "#CEC931", 
                    iconName: "map-outline", 
                    iconColor: '#333',
                },
                { 
                    text: "EQUIPE", 
                    onPress: () => navigation.navigate("ListarAgentes"), 
                    bgColor: "#D38B17", 
                    iconName: "people-outline", 
                    iconColor: '#333',
                },
                { 
                    text: "DEFINIR QUARTEIRÕES", 
                    onPress: () => navigation.navigate("ListarAgentes"), 
                    bgColor: "#2CA856", 
                    iconName: "grid-outline", 
                    iconColor: '#333',
                },
                { 
                    text: "RESUMO CICLO", 
                    onPress: () => navigation.navigate("ResumoCiclo"), 
                    bgColor: "#d3175fff", 
                    iconName: "analytics-outline", 
                    iconColor: '#333',
                },
            ];
        }

        return [];
    };
    
    const menu = menuItems(funcao);
    
    return (
        <View style={styles.container}>
            <Cabecalho usuario={nomeUsuario} navigation={navigation} />
            
            <View style={styles.containerBotoes}>
                {menu.map((item, index) => (
                    <MenuItem
                        key={index}
                        iconName={item.iconName}
                        iconColor={item.iconColor}
                        bgColor={item.bgColor}
                        text={item.text}
                        onPress={item.onPress}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
    },
    containerBotoes: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around', // Distribui os itens horizontalmente
        alignContent: 'center', // Centraliza as linhas verticalmente no espaço
        paddingHorizontal: width(5), // Adiciona um padding nas laterais
        gap: width(5), // Espaçamento entre as linhas (vertical) e colunas (horizontal)
    },
    
    // Container de cada item do menu (responsável pelo layout vertical: bloco + texto)
    menuItemWrapper: {
        width: width(40), // Define a largura para 40% (2 items + espaçamento = 100%)
        alignItems: 'center',
        marginBottom: height(2), // Adiciona espaçamento na parte inferior para o texto
    },

    // Bloco quadrado colorido com o ícone
    menuIconContainer: {
        width: width(40), // Mesmo que o wrapper para ser quadrado
        height: width(40), // Define a altura igual à largura
        borderRadius: width(5), // Borda mais arredondada
        alignItems: "center",
        justifyContent: "center",
        elevation: 5, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    
    // Estilo do texto do botão, centralizado e em maiúsculas
    menuText: {
        fontSize: font(2.5), // Fonte um pouco menor e adequada
        fontWeight: "bold",
        textAlign: 'center',
        marginTop: height(1), // Espaçamento entre o bloco e o texto
        color: '#333',
    },
});