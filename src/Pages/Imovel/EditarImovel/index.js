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
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "./../../../config/config.js";
import Cabecalho from "../../../Components/Cabecalho.js";
// Importações adicionadas para o estilo responsivo
import { height, width, font } from "../../../utils/responsive.js";

// Função para mapear o tipo de imóvel, se necessário, como no offline
const mapearTipoImovel = (tipoAbreviado) => {
    const tipos = {
        r: "Residência",
        c: "Comércio",
        tb: "Terreno Baldio",
        pe: "Ponto Estratégico",
        out: "Outros",
    };
    const chave = tipoAbreviado ? String(tipoAbreviado).toLowerCase().trim() : "";
    return tipos[chave] || (tipoAbreviado ? String(tipoAbreviado).toUpperCase() : "NÃO ESPECIFICADO");
};

export default function EditarImovelOnline({ route, navigation }) {
    const { imovel } = route.params;

    const [form, setForm] = useState({
        logradouro: imovel.logradouro || "",
        numero: String(imovel.numero || ""),
        tipo: imovel.tipo || "",
        qtdHabitantes: String(imovel.qtdHabitantes || ""),
        qtdCachorros: String(imovel.qtdCachorros || ""),
        qtdGatos: String(imovel.qtdGatos || ""),
        observacao: imovel.observacao || "",
        status: imovel.status || "Pendente",
    });

    const [loading, setLoading] = useState(false);

    function handleChange(field, value) {
        setForm({ ...form, [field]: value });
    }

    async function handleSubmit() {
        // Validação básica
        if (!form.logradouro || !form.numero || !form.tipo) {
            return Alert.alert("Erro", "Preencha os campos obrigatórios!");
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/editarImovel/${imovel._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                return Alert.alert("Erro", data.message || "Falha ao atualizar imóvel");
            }

            Alert.alert("Sucesso", "Imóvel atualizado com sucesso!", [
                { text: "Ok", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error("Erro ao editar imóvel online:", error);
            Alert.alert(
                "Erro",
                "Não foi possível atualizar o imóvel. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    }

    // Informações do Imóvel para o cabeçalho/título
    const tipoMapeado = mapearTipoImovel(imovel.tipo);
    const tipoOuComplemento = imovel.complemento || imovel.tipo;
    const tipoMapeadoDetalhado = mapearTipoImovel(tipoOuComplemento);


    return (
        <View style={styles.container}>
            <Cabecalho navigation={navigation} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? height(8) : 0} // Ajuste conforme a altura do seu Cabecalho
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Estilo do título replicado do ImovelOffline */}
                    <View style={styles.simpleTitleContainer}>
                        <Text style={styles.simpleTitle}>
                            Editar Imóvel (Online)
                        </Text>
                        <Text style={styles.simpleSubtitle}>
                            Nº **{imovel.numero}** - {tipoMapeadoDetalhado}
                        </Text>
                    </View>

                    {/* Campo Logradouro */}
                    <Text style={styles.inputLabel}>Logradouro</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Logradouro"
                        value={form.logradouro}
                        onChangeText={(v) => handleChange("logradouro", v)}
                    />

                    {/* Campo Número */}
                    <Text style={styles.inputLabel}>Número</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Número"
                        keyboardType="numeric"
                        value={form.numero}
                        onChangeText={(v) => handleChange("numero", v)}
                    />

                    {/* Campo Tipo (Picker) */}
                    <Text style={styles.inputLabel}>Tipo de Imóvel</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.tipo}
                            style={styles.picker}
                            onValueChange={(v) => handleChange("tipo", v)}
                        >
                            <Picker.Item label="Selecione o tipo" value="" />
                            <Picker.Item label="Residência" value="r" />
                            <Picker.Item label="Comércio" value="c" />
                            <Picker.Item label="Terreno baldio" value="tb" />
                            <Picker.Item label="Ponto estratégico" value="pe" />
                            <Picker.Item label="Outro" value="out" />
                        </Picker>
                    </View>


                    {/* Campo Qtd. Habitantes */}
                    <Text style={styles.inputLabel}>Qtd. Habitantes</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Qtd. Habitantes"
                        keyboardType="numeric"
                        value={form.qtdHabitantes}
                        onChangeText={(v) => handleChange("qtdHabitantes", v)}
                    />
                    
                    {/* Campo Qtd. Cachorros */}
                    <Text style={styles.inputLabel}>Qtd. Cachorros</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Qtd. Cachorros"
                        keyboardType="numeric"
                        value={form.qtdCachorros}
                        onChangeText={(v) => handleChange("qtdCachorros", v)}
                    />

                    {/* Campo Qtd. Gatos */}
                    <Text style={styles.inputLabel}>Qtd. Gatos</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Qtd. Gatos"
                        keyboardType="numeric"
                        value={form.qtdGatos}
                        onChangeText={(v) => handleChange("qtdGatos", v)}
                    />

                    {/* Campo Observação */}
                    <Text style={styles.inputLabel}>Observação</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Observação"
                        multiline
                        numberOfLines={4}
                        value={form.observacao}
                        onChangeText={(v) => handleChange("observacao", v)}
                    />

                    {/* Botão de Submissão */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.7}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff", // Fundo branco
    },
    scrollContent: {
        flexGrow: 1,
        padding: width(3.75), // Padding consistente
        paddingBottom: height(3),
    },

    // Estilos do título e subtítulo (do ImovelOffline)
    simpleTitleContainer: {
        paddingHorizontal: width(3.75),
        alignItems: "center",
        paddingVertical: height(1.25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginHorizontal: -width(3.75), // Compensar o padding do scrollContent
        marginBottom: height(2.5),
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
    // Fim dos estilos do título

    inputLabel: {
        fontSize: font(1.8),
        color: '#05419A',
        fontWeight: 'bold',
        marginBottom: height(0.5),
        marginTop: height(1),
    },
    input: {
        backgroundColor: "#fff",
        padding: height(1.5), // Padding vertical
        paddingHorizontal: width(3), // Padding horizontal
        borderRadius: 5, // Borda mais suave
        marginBottom: height(1.5),
        borderWidth: 1,
        borderColor: "#ddd",
        fontSize: font(1.9), // Tamanho da fonte
        color: '#333',
    },
    textArea: {
        height: height(10), // Altura maior para observação
        textAlignVertical: 'top', // Texto começa no topo
    },
    pickerContainer: {
        backgroundColor: "#fff",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: height(1.5),
        overflow: 'hidden', // Para garantir que o Picker respeite o borderRadius
    },
    picker: {
        height: height(6), // Altura consistente com o input
        width: '100%',
        color: '#333',
    },
    button: {
        backgroundColor: "#2CA856", // Cor do botão de 'Editar' do ImovelOffline
        padding: height(1.5),
        borderRadius: 5,
        marginTop: height(2),
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: font(2.2), // Fonte um pouco maior para destaque
    },
});