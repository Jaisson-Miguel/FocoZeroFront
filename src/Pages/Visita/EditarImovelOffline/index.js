import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Cabecalho from "../../../Components/Cabecalho";
import { Picker } from "@react-native-picker/picker";
// Funções Responsivas importadas
import { height, width, font } from "../../../utils/responsive.js"; 

export default function EditarImovelOffline({ route, navigation }) {
    const { imovel } = route.params;

    const [form, setForm] = useState({
        logradouro: imovel.logradouro || "",
        numero: String(imovel.numero || ""),
        tipo: imovel.tipo || "r",
        qtdHabitantes: String(imovel.qtdHabitantes || ""),
        qtdCachorros: String(imovel.qtdCachorros || ""),
        qtdGatos: String(imovel.qtdGatos || ""),
        // Se for "Nenhuma observação.", inicia como string vazia para usar placeholder
        observacao: imovel.observacao === "Nenhuma observação." ? "" : imovel.observacao || "", 
        status: imovel.status || "Pendente",
    });

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSave = async () => {
        try {
            const raw = await AsyncStorage.getItem("dadosImoveis");
            let imoveis = raw ? JSON.parse(raw) : [];
            
            // Tratamento final: se a observação estiver vazia ao salvar, use "Nenhuma observação."
            const observacaoFinal = form.observacao.trim() === "" ? "Nenhuma observação." : form.observacao;

            const index = imoveis.findIndex(
                (i) => String(i._id) === String(imovel._id)
            );

            if (index !== -1) {
                imoveis[index] = { ...imoveis[index], ...form, observacao: observacaoFinal, editadoOffline: true };
            } else {
                imoveis.push({ ...imovel, ...form, observacao: observacaoFinal, editadoOffline: true });
            }

            await AsyncStorage.setItem("dadosImoveis", JSON.stringify(imoveis));

            Alert.alert("Sucesso", "Imóvel atualizado offline!");
            navigation.goBack();
        } catch (err) {
            console.error("Erro ao salvar imóvel offline:", err);
            Alert.alert("Erro", "Não foi possível salvar o imóvel.");
        }
    };

    const camposTexto = [
        { field: "logradouro", placeholder: "Logradouro (Rua, Av.)", keyboardType: "default" },
        { field: "numero", placeholder: "Número", keyboardType: "numeric" },
        { field: "qtdHabitantes", placeholder: "Qtd. Habitantes", keyboardType: "numeric" },
        { field: "qtdCachorros", placeholder: "Qtd. Cães", keyboardType: "numeric" },
        { field: "qtdGatos", placeholder: "Qtd. Gatos", keyboardType: "numeric" },
    ];
    
    const tipoOpcoes = [
        { label: "Residencial", value: "r" },
        { label: "Comércio", value: "c" },
        { label: "Ponto Estratégico", value: "pe" },
        { label: "Outro", value: "out" },
        { label: "Terreno Baldio", value: "tb" },
    ];


    return (
        <SafeAreaView style={styles.safeArea}>
            <Cabecalho navigation={navigation} />
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView contentContainerStyle={styles.containerScrollContent}>
                    
                    {/* Título Padronizado */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Editar Imóvel (Offline)</Text>
                        <Text style={styles.subtitle}>Quarteirão: {imovel.numeroQuarteirao || 'N/A'}</Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.formSection}>
                        
                        {/* Tipo (Picker) */}
                        <Text style={styles.inputLabel}>Tipo de Imóvel</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={form.tipo}
                                style={styles.picker}
                                // Usamos itemStyle para iOS e o estilo do Picker para Android
                                itemStyle={styles.pickerItem} 
                                onValueChange={(v) => handleChange("tipo", v)}
                                dropdownIconColor="#05419A"
                            >
                                {tipoOpcoes.map((item) => (
                                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                                ))}
                            </Picker>
                        </View>
                        
                        {/* Inputs de Texto */}
                        {camposTexto.map(({ field, placeholder, keyboardType }) => (
                            <View key={field}>
                                <Text style={styles.inputLabel}>{placeholder.replace('Qtd.', 'Quantidade').replace(' ', ' de ')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={placeholder}
                                    keyboardType={keyboardType}
                                    value={form[field]}
                                    onChangeText={(v) => handleChange(field, v)}
                                    placeholderTextColor="#999"
                                />
                            </View>
                        ))}
                        
                        {/* Observação (Multiline) */}
                        <Text style={styles.inputLabel}>Observação</Text>
                        <TextInput
                            style={[styles.textInput, styles.multilineInput]}
                            placeholder={form.observacao === "" ? "Adicione observações importantes..." : undefined} 
                            multiline
                            value={form.observacao}
                            onChangeText={(v) => handleChange("observacao", v)}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />

                    </View>
                    
                    {/* Espaço para o botão */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.buttonText}>SALVAR ALTERAÇÕES</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    containerScrollContent: {
        flexGrow: 1,
        backgroundColor: "#fff",
        paddingBottom: height(3), // Usando height()
    },
    
    // --- Header / Títulos Padronizados (com font()) ---
    headerSection: {
        paddingHorizontal: width(5), // Usando width()
        paddingVertical: height(2), // Usando height()
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    title: {
        fontSize: font(3), 
        fontWeight: "bold",
        color: "#05419A",
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: font(2.25), 
        color: "#666",
        marginTop: height(0.5), // Usando height()
    },
    
    // --- Seção do Formulário ---
    formSection: {
        padding: width(5), // Usando width()
    },
    
    inputLabel: {
        fontSize: font(2.25), 
        fontWeight: 'bold',
        color: '#05419A',
        marginBottom: height(0.5), // Usando height()
        marginTop: height(2), // Usando height()
        textTransform: 'uppercase',
    },

    // --- Estilo Padronizado de Input de Texto (com font() e height()) ---
    textInput: {
        backgroundColor: "#E0E0E0",
        paddingHorizontal: width(3.5), // Usando width()
        paddingVertical: Platform.OS === 'ios' ? height(1.5) : height(1), // Usando height()
        borderRadius: 5,
        marginBottom: height(1.5), // Usando height()
        fontSize: font(2.25), 
        color: "#05419A", 
        borderWidth: 1,
        borderColor: "#ccc",
    },
    multilineInput: {
        height: height(12), // Altura responsiva (aprox. 100)
    },

    // --- Estilo Padronizado de Picker (com font() e height()) ---
    pickerWrapper: {
        backgroundColor: "#E0E0E0",
        borderRadius: 5,
        marginBottom: height(1.5), // Usando height()
        borderWidth: 1,
        borderColor: "#ccc",
        overflow: 'hidden',
        height: height(6), // Altura responsiva para o wrapper
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        color: "#05419A",
        height: height(6), // Altura responsiva para o Picker
    },
    // Estilo EXCLUSIVO para o texto do Picker (necessário para iOS e para aumentar o texto)
    pickerItem: {
        fontSize: font(3.2), // Fonte AUMENTADA para as opções
        height: height(6), // Garante que o item caiba na altura do Picker
    },

    // --- Botão Salvar Padronizado (com font() e width()) ---
    buttonContainer: {
        paddingHorizontal: width(5), // Usando width()
        marginTop: height(1), // Usando height()
    },
    saveButton: {
        backgroundColor: "#05419A",
        padding: height(2), // Usando height()
        borderRadius: 5,
        alignItems: "center",
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: font(2.5),
        textTransform: 'uppercase',
    },
});