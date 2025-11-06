import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Platform,
    ActivityIndicator,
} from "react-native";

import Cabecalho from "../../../Components/Cabecalho";
import { height, width, font } from "../../../utils/responsive.js";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { API_URL } from "./../../../config/config.js";

export default function CadastrarArea({ navigation }) {
    const [nome, setNome] = useState("");
    const [codigo, setCodigo] = useState("");
    const [zona, setZona] = useState("");
    const [categoria, setCategoria] = useState("");
    const [mapaUrl, setMapaUrl] = useState("");
    const [agentes, setAgentes] = useState([]);
    const [agenteSelecionado, setAgenteSelecionado] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingAgentes, setLoadingAgentes] = useState(true);

    useEffect(() => {
        const fetchAgentes = async () => {
            setLoadingAgentes(true);
            try {
                const response = await fetch(`${API_URL}/listarUsuarios?funcao=agente`);
                const data = await response.json();

                if (response.ok) {
                    setAgentes(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingAgentes(false);
            }
        };

        fetchAgentes();
    }, []);

    const handleCadastrar = async () => {
        if (!nome || !codigo || !zona || !categoria || !mapaUrl) {
            Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/cadastrarArea`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    codigo,
                    zona,
                    categoria,
                    mapaUrl,
                    idResponsavel: agenteSelecionado,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Erro", data.message || "Falha ao cadastrar");
                return;
            }

            Alert.alert("Sucesso", "Área cadastrada com sucesso!");
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    const preventPlaceholderReSelection = (itemValue, currentState) => {
        if (itemValue === "" && currentState !== "") {
            return currentState;
        }
        return itemValue;
    }

    const handleCategoriaChange = (itemValue) => {
        setCategoria(preventPlaceholderReSelection(itemValue, categoria));
    }

    const handleAgenteChange = (itemValue) => {
        setAgenteSelecionado(preventPlaceholderReSelection(itemValue, agenteSelecionado));
    }

    const isPlaceholderDisabled = (currentValue) => {
        return currentValue !== "" && Platform.OS === 'ios';
    }

    return (
        <View style={styles.mainContainer}>
            <Cabecalho navigation={navigation} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Cadastrar Área</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nome da Área"
                    placeholderTextColor="#666"
                    value={nome}
                    onChangeText={setNome}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Código da Área"
                    placeholderTextColor="#666"
                    value={codigo}
                    onChangeText={setCodigo}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Zona"
                    placeholderTextColor="#666"
                    value={zona}
                    onChangeText={setZona}
                />

                <View
                    style={[
                        styles.dropdownContainer,
                        categoria === "" && styles.dropdownPlaceholder
                    ]}
                >
                    <Picker
                        selectedValue={categoria}
                        style={styles.pickerStyle}
                        onValueChange={handleCategoriaChange}
                        mode="dropdown"
                    >
                        <Picker.Item
                            label="Selecione a Categoria (Obrigatório)"
                            value=""
                            color={categoria ? "#000" : "#666"}
                            enabled={!isPlaceholderDisabled(categoria)}
                        />
                        <Picker.Item label="Bairro" value="Bairro" />
                        <Picker.Item label="Povoado" value="Povoado" />
                    </Picker>

                </View>

                <TextInput
                    style={styles.input}
                    placeholder="URL do Mapa (Opcional)"
                    placeholderTextColor="#666"
                    value={mapaUrl}
                    onChangeText={setMapaUrl}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Agente Responsável:</Text>
                <View
                    style={[
                        styles.dropdownContainer,
                        agenteSelecionado === "" && styles.dropdownPlaceholder
                    ]}
                >
                    {loadingAgentes ? (
                        <View style={styles.loadingPicker}>
                            <ActivityIndicator size="small" color="#05419A" />
                            <Text style={{ fontSize: font(2), marginLeft: width(2) }}>Carregando agentes...</Text>
                        </View>
                    ) : (
                        <>
                            <Picker
                                selectedValue={agenteSelecionado}
                                style={styles.pickerStyle}
                                onValueChange={handleAgenteChange}
                                mode="dropdown"
                            >
                                <Picker.Item
                                    label="Selecione um agente (Opcional)"
                                    value=""
                                    color={agenteSelecionado ? "#000" : "#666"}
                                    enabled={!isPlaceholderDisabled(agenteSelecionado)}
                                />
                                {agentes.map((agente) => (
                                    <Picker.Item
                                        key={agente._id}
                                        label={agente.nome}
                                        value={agente._id}
                                    />
                                ))}
                            </Picker>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleCadastrar}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Cadastrando..." : "Cadastrar Área"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: width(5),
        paddingVertical: height(2.5),
        backgroundColor: "#fff",
    },
    title: {
        fontSize: font(4),
        fontWeight: "bold",
        color: "#05419A",
        textAlign: "center",
        marginBottom: height(3),
        marginTop: height(1),
    },
    label: {
        fontSize: font(2.25),
        color: '#05419A',
        marginBottom: height(0.75),
        paddingHorizontal: width(1),
    },
    input: {
        borderWidth: 1,
        borderColor: "#05419A",
        borderRadius: width(2),
        paddingHorizontal: width(3),
        paddingVertical: height(1.5),
        fontSize: font(2.25),
        marginBottom: height(2),
        color: '#000',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: "#05419A",
        borderRadius: width(2),
        marginBottom: height(2),
        justifyContent: 'center',
        height: height(6.5),
    },
    dropdownPlaceholder: {
        color: "#666",
    },
    pickerStyle: {
        height: height(6.5),
        width: '100%',
        color: '#000',
        ...Platform.select({
            android: {
                paddingVertical: 0,
                paddingHorizontal: width(1),
            },
        }),
    },
    dropdownIcon: {
        position: 'absolute',
        right: width(3),
        top: '50%',
        marginTop: -font(2.5) / 2,
    },
    loadingPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    button: {
        backgroundColor: "#05419A",
        paddingVertical: height(2),
        borderRadius: width(2),
        alignItems: "center",
        marginTop: height(1),
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9',
    },
    buttonText: {
        color: "#fff",
        fontSize: font(2.5),
        fontWeight: "bold",
    },
});