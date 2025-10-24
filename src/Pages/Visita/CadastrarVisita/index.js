import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    SafeAreaView,
    Platform,
    Dimensions,
    KeyboardAvoidingView, // <-- Importação adicionada
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getId } from "../../../utils/tokenStorage.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Cabecalho from "../../../Components/Cabecalho";
import { height, width, font } from "../../../utils/responsive.js"; 



const screenWidth = Dimensions.get('window').width;
const IS_SMALL_SCREEN = screenWidth < 400; 
const FONT_MULTIPLIER = 1; 

const getFontSize = (size) => {
    if (typeof font === 'function') {
        return font(size);
    }
    return size * FONT_MULTIPLIER; 
};

// ... (mapearTipoImovel e ValueBox permanecem inalterados)

const mapearTipoImovel = (tipo) => {
    const tipos = {
        r: "RESIDÊNCIA",
        c: "COMÉRCIO",
        tb: "TERRENO BALDIO",
        pe: "P. ESTRATÉGICO",
        out: "OUTROS",
    };
    const chave = tipo ? String(tipo).toLowerCase().trim() : "";
    return tipos[chave] || (tipo ? String(tipo).toUpperCase() : "NÃO ESPECIFICADO");
};

const ValueBox = ({ label, value, isInput = false, isPicker = false, isDeposito = false, isSpecialInput = false, isRounded = false, onChangeText, onValueChange, keyboardType = 'numeric', style, options = [], isBlueTheme = false }) => {
    let content;

    const useSpecialStyle = isDeposito || isSpecialInput; 

    const labelFundo = useSpecialStyle ? '#05419A' : 'transparent';
    const labelColor = useSpecialStyle ? '#fff' : (isBlueTheme ? '#fff' : '#000');
    
    const inputBackgroundColor = useSpecialStyle ? '#E0E0E0' : (isBlueTheme ? '#fff' : '#E0E0E0');
    const inputTextColor = '#05419A'; 

    const labelStyle = useSpecialStyle ? styles.depositoValueBoxLabel : styles.valueBoxLabel;

    const finalInputStyle = [
        styles.valueBoxInput, 
        { 
            backgroundColor: inputBackgroundColor, 
            color: inputTextColor,
        }
    ];

    if (isInput) {
        if (isBlueTheme) {
            finalInputStyle.push({ borderRadius: 5 }); 
        } else if (useSpecialStyle) {
            finalInputStyle.push({
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5,
            });
        }
    }


    if (isPicker) {
        content = (
            <View style={[styles.pickerWrapper, isBlueTheme && styles.pickerWrapperRounded, { backgroundColor: inputBackgroundColor }]}>
                <Text style={[styles.pickerSelectedValue, { color: inputTextColor }]}>{value.toUpperCase()}</Text>
                <Picker
                    selectedValue={value}
                    onValueChange={onValueChange}
                    style={styles.picker}
                    dropdownIconColor="#000"
                    mode="dropdown"
                >
                    {options.map((item) => (
                        <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                </Picker>
            </View>
        );
    } else if (isInput) {
        content = (
            <TextInput
                style={finalInputStyle}
                keyboardType={keyboardType}
                value={String(value)}
                onChangeText={onChangeText}
                textAlign="center"
                maxLength={30}
            />
        );
    } else {
        content = <Text style={[styles.valueBoxValue, { color: labelColor }]}>{value}</Text>;
    }

    return (
        <View style={[styles.valueBox, style, { backgroundColor: 'transparent' }]}>
            <View style={[styles.labelWrapper, { 
                backgroundColor: labelFundo,
                width: '100%', 
                borderTopLeftRadius: useSpecialStyle ? 5 : 0,
                borderTopRightRadius: useSpecialStyle ? 5 : 0,
            }]}>
                <Text style={[labelStyle, { color: labelColor }]}>{label}</Text>
            </View>
            {content}
        </View>
    );
};


export default function Visita({ route, navigation }) {
    const { imovel, idArea, nomeArea, quarteirao } = route.params;
    const [agenteId, setAgenteId] = useState(null);
    
    const tipoOpcoes = [
        { label: "R", value: "r" },
        { label: "C", value: "c" },
        { label: "P.E", value: "pe" },
        { label: "Out", value: "out" },
        { label: "TB", value: "tb" },
    ];

    useEffect(() => {
        const fetchNome = async () => {
            const userId = await getId();
            if (userId) setAgenteId(userId);
        };
        fetchNome();
    }, []);

    const [form, setForm] = useState({
        depositosInspecionados: {
            a1: "", a2: "", b: "", c: "", d1: "", d2: "", e: "",
        },
        numero: imovel.numero || "",
        tipo: (imovel.complemento || imovel.tipo) ? (imovel.complemento || imovel.tipo).toLowerCase().trim() : "r",
        qtdHabitantes: "",
        qtdCaes: "",
        qtdGatos: "",
        amostrasInicial: "",
        amostrasFinal: "",
        foco: "",
        qtdLarvicida: "",
        qtdDepTratado: "",
        qtdDepEliminado: "",
    });
    
    const handleInputChange = (campo, valor) => {
        const numericFields = ['qtdHabitantes', 'qtdCaes', 'qtdGatos', 'amostrasInicial', 'amostrasFinal', 'foco', 'qtdLarvicida', 'qtdDepTratado', 'qtdDepEliminado'];
        let finalValue = valor;
        if (numericFields.includes(campo)) {
            finalValue = valor.replace(/[^0-9]/g, '');
        }
        setForm({ ...form, [campo]: finalValue });
    };
    
    const handleDepositoChange = (campo, valor) => {
        const finalValue = valor.replace(/[^0-9]/g, '');
        setForm((prev) => ({
            ...prev,
            depositosInspecionados: {
                ...prev.depositosInspecionados,
                [campo]: finalValue,
            },
        }));
    };

    const salvarVisita = async (statusAcao) => {
        // ... (lógica de salvar visita inalterada)
        if (!agenteId) {
            Alert.alert("Erro", "ID do agente não carregado ainda.");
            return;
        }
        
        if (statusAcao === 'visitado') {
            try {
                const visita = {
                    idImovel: imovel._id,
                    idAgente: agenteId,
                    idArea: idArea,
                    idQuarteirao: quarteirao._id,
                    tipo: form.tipo,
                    numero: form.numero,
                    dataVisita: new Date(),
                    depositosInspecionados: Object.entries(form.depositosInspecionados).reduce((acc, [key, val]) => ({...acc, [key]: Number(val) || 0}), {}),
                    qtdHabitantes: Number(form.qtdHabitantes) || 0,
                    qtdCaes: Number(form.qtdCaes) || 0,
                    qtdGatos: Number(form.qtdGatos) || 0,
                    amostrasInicial: Number(form.amostrasInicial) || 0,
                    amostrasFinal: Number(form.amostrasFinal) || 0,
                    foco: Number(form.foco) || 0,
                    qtdLarvicida: Number(form.qtdLarvicida) || 0,
                    qtdDepTratado: Number(form.qtdDepTratado) || 0,
                    qtdDepEliminado: Number(form.qtdDepEliminado) || 0,
                    sincronizado: false,
                    status: "visitado",
                    nomeArea: nomeArea,
                    nomeQuarteirao: quarteirao.numero,
                    logradouro: imovel.logradouro,
                };
        
                const visitasSalvas = await AsyncStorage.getItem("visitas");
                const lista = visitasSalvas ? JSON.parse(visitasSalvas) : [];
        
                lista.push(visita);
                await AsyncStorage.setItem("visitas", JSON.stringify(lista));
                
                const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
                if (rawImoveis) {
                    let listaImoveis = JSON.parse(rawImoveis);
                    listaImoveis = listaImoveis.map((i) =>
                        i._id === imovel._id
                            ? { 
                                ...i, 
                                status: "visitado", 
                                numero: form.numero,
                                tipo: form.tipo,
                                editadoOffline: true 
                            }
                            : i
                    );
                    await AsyncStorage.setItem("dadosImoveis", JSON.stringify(listaImoveis));
                }
        
                Alert.alert("Sucesso", "Visita salva localmente!");
                navigation.goBack();
            } catch (error) {
                Alert.alert("Erro", "Não foi possível salvar a visita localmente.");
                console.error(error);
            }
        } else {
            try {
                const rawImoveis = await AsyncStorage.getItem("dadosImoveis");
                if (rawImoveis) {
                    let listaImoveis = JSON.parse(rawImoveis);
                    listaImoveis = listaImoveis.map((i) =>
                        i._id === imovel._id
                            ? { ...i, status: statusAcao, editadoOffline: true }
                            : i
                    );
                    await AsyncStorage.setItem("dadosImoveis", JSON.stringify(listaImoveis));
                }
                Alert.alert("Atenção", `Imóvel marcado como: ${statusAcao.toUpperCase()}.`);
                navigation.goBack();
            } catch (error) {
                Alert.alert("Erro", "Não foi possível atualizar o status do imóvel.");
                console.error(error);
            }
        }
    };

    const depositosKeys = Object.keys(form.depositosInspecionados);
    const firstRowKeys = depositosKeys.slice(0, 3);
    const secondRowKeys = depositosKeys.slice(3);


    return (
        // 1. O safeArea agora tem flex: 1
        <SafeAreaView style={styles.safeArea}>
            
            <Cabecalho navigation={navigation} /> 
            
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingContainer} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0} 
            >
                <ScrollView 
                    contentContainerStyle={styles.containerScrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    
                    <View style={styles.simpleTitleContainer}>
                        <Text style={styles.simpleTitle}>
                            {quarteirao.nomeArea} - {quarteirao.numero}
                        </Text>
                        <Text style={styles.simpleSubtitle}>
                            Código {quarteirao.codigoArea} - Zona {quarteirao.zonaArea}
                        </Text>
                    </View>

                    <View style={styles.blueInfoSection}>
                        
                        <View style={styles.headerRow}>
                            
                            <View style={styles.streetBox}>
                                <Text style={styles.streetHeaderBlueCompact}>{imovel.logradouro}</Text>
                            </View>
                            
                            <ValueBox 
                                label="Nº" 
                                value={form.numero} 
                                isInput={true}
                                onChangeText={(v) => handleInputChange("numero", v)}
                                keyboardType="default"
                                style={styles.smallBoxCompact}
                                isBlueTheme={true}
                            />
                            
                            <ValueBox 
                                label="Tipo" 
                                value={form.tipo}
                                isPicker={true}
                                onValueChange={(v) => handleInputChange("tipo", v)}
                                options={tipoOpcoes}
                                style={styles.mediumBoxCompact}
                                isBlueTheme={true}
                            />
                        </View>
                        
                        <View style={styles.infoRow}>
                            
                            <ValueBox 
                                label="Habitantes" 
                                value={form.qtdHabitantes} 
                                isInput={true} 
                                onChangeText={(v) => handleInputChange("qtdHabitantes", v)}
                                keyboardType="numeric"
                                style={styles.smallBox}
                                isBlueTheme={true}
                            />
                            
                            <ValueBox 
                                label="Cães" 
                                value={form.qtdCaes} 
                                isInput={true} 
                                onChangeText={(v) => handleInputChange("qtdCaes", v)}
                                keyboardType="numeric"
                                style={styles.smallBox}
                                isBlueTheme={true}
                            />
                            
                            <ValueBox 
                                label="Gatos" 
                                value={form.qtdGatos} 
                                isInput={true} 
                                onChangeText={(v) => handleInputChange("qtdGatos", v)}
                                keyboardType="numeric"
                                style={styles.smallBox}
                                isBlueTheme={true}
                            />
                        </View>
                    </View>

                    <View style={styles.contentSections}>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Depósitos inspecionados</Text>
                            
                            <View style={styles.depositosRow}>
                                {(IS_SMALL_SCREEN ? firstRowKeys : depositosKeys).map((campo) => (
                                    <ValueBox
                                        key={campo}
                                        label={campo.toUpperCase()}
                                        value={form.depositosInspecionados[campo]}
                                        isInput={true}
                                        isDeposito={true} 
                                        onChangeText={(v) => handleDepositoChange(campo, v)}
                                        keyboardType="numeric"
                                        style={IS_SMALL_SCREEN ? styles.depositoBoxSmall : styles.depositoBoxLarge}
                                    />
                                ))}
                            </View>

                            {IS_SMALL_SCREEN && (
                                <View style={styles.depositosRowSecond}> 
                                    {secondRowKeys.map((campo) => (
                                        <ValueBox
                                            key={campo}
                                            label={campo.toUpperCase()}
                                            value={form.depositosInspecionados[campo]}
                                            isInput={true}
                                            isDeposito={true} 
                                            onChangeText={(v) => handleDepositoChange(campo, v)}
                                            keyboardType="numeric"
                                            style={styles.depositoBoxSmall} 
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Depósitos eliminados</Text>
                            <View style={styles.infoRowCampos}>
                                <ValueBox 
                                    label="Quantidade" 
                                    value={form.qtdDepEliminado} 
                                    isInput={true} 
                                    isSpecialInput={true}
                                    onChangeText={(v) => handleInputChange("qtdDepEliminado", v)}
                                    keyboardType="numeric"
                                    style={styles.halfWidthSpecial}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Amostras</Text>
                            <View style={styles.infoRowCampos}>
                                <ValueBox 
                                    label="Inicial" 
                                    value={form.amostrasInicial} 
                                    isInput={true} 
                                    isSpecialInput={true} 
                                    onChangeText={(v) => handleInputChange("amostrasInicial", v)}
                                    keyboardType="numeric"
                                    style={styles.halfWidthSpecial} 
                                />
                                <ValueBox 
                                    label="Final" 
                                    value={form.amostrasFinal} 
                                    isInput={true} 
                                    isSpecialInput={true} 
                                    onChangeText={(v) => handleInputChange("amostrasFinal", v)}
                                    keyboardType="numeric"
                                    style={styles.halfWidthSpecial} 
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Foco</Text>
                            <View style={styles.infoRowCampos}>
                                <ValueBox 
                                    label="Quantidade" 
                                    value={form.foco} 
                                    isInput={true} 
                                    isSpecialInput={true} 
                                    onChangeText={(v) => handleInputChange("foco", v)}
                                    keyboardType="numeric"
                                    style={styles.fullWidthSpecial} 
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Larvicida</Text>
                            <View style={styles.infoRowCampos}>
                                <ValueBox 
                                    label="Gramas" 
                                    value={form.qtdLarvicida} 
                                    isInput={true} 
                                    isSpecialInput={true} 
                                    onChangeText={(v) => handleInputChange("qtdLarvicida", v)}
                                    keyboardType="numeric"
                                    style={styles.halfWidthSpecial} 
                                />
                                <ValueBox 
                                    label="Depósitos" 
                                    value={form.qtdDepTratado} 
                                    isInput={true} 
                                    isSpecialInput={true} 
                                    onChangeText={(v) => handleInputChange("qtdDepTratado", v)}
                                    keyboardType="numeric"
                                    style={styles.halfWidthSpecial} 
                                />
                            </View>
                        </View>
                    </View>
                    
                </ScrollView>
              </KeyboardAvoidingView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={[styles.bottomButton, styles.buttonFechada]} onPress={() => salvarVisita('fechado')}>
                    <Text style={styles.buttonText}>Fechada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bottomButton, styles.buttonRecusa]} onPress={() => salvarVisita('recusa')}>
                    <Text style={styles.buttonText}>Recusa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bottomButton, styles.buttonVisita]} onPress={() => salvarVisita('visitado')}>
                    <Text style={styles.buttonText}>Realizar visita</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1, // É crucial para que o KeyboardAvoidingView funcione
        backgroundColor: "#fff",
    },
    keyboardAvoidingContainer: {
        flex: 1, 
    },
    containerScrollContent: {
        flexGrow: 1,
        backgroundColor: "#fff",
        paddingBottom: 50, 
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
        fontSize: getFontSize(3.5),
        fontWeight: "bold",
        color: "#05419A",
        textTransform: 'uppercase',
    },
    simpleSubtitle: {
        fontSize: getFontSize(2.25),
        color: "#666",
        textTransform: 'uppercase',
    },
    
    blueInfoSection: {
        backgroundColor: "#05419A",
        padding: 10,
    },
    
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", 
        marginBottom: 10,
        minHeight: 50, 
    },
    
    streetBox: {
        width: "50%",
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    streetHeaderBlueCompact: {
        fontSize: getFontSize(3.5),
        fontWeight: "bold",
        color: "#fff",
    },
    
    smallBoxCompact: {
        width: "18%",
        height: 60, 
        paddingVertical: 5, 
        paddingHorizontal: 3, 
    },
    
    mediumBoxCompact: {
        width: "30%",
        height: 60, 
        padding: 5,
    },
    
    contentSections: {
        paddingHorizontal: 10,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
        gap: 5,
    },
    
    infoRowCampos: {
        flexDirection: "row",
        marginBottom: 10,
        gap: 20,
    },
    
    smallBox: {
        width: "30%",
        borderRadius: 5,
        paddingVertical: 5, 
        paddingHorizontal: 3, 
    },
    mediumBox: {
        width: "65%",
        borderRadius: 5,
        padding: 5,
    },
    
    halfWidthSpecial: {
        width: "35%",
        minHeight: 80,
        borderRadius: 5,
        overflow: 'hidden',
    },
    fullWidthSpecial: {
        width: "48%",
        minHeight: 80,
        borderRadius: 5,
        overflow: 'hidden',
    },

    section: {
        borderTopWidth: 1,
        alignItems:"center",
        borderTopColor: "#05419A",
        paddingTop: 10,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: getFontSize(2.5),
        fontWeight: "bold",
        color: "#05419A",
        marginBottom: 10,
    },
    
    depositosRow: {
        flexDirection: "row",
        gap: 15,
        justifyContent: IS_SMALL_SCREEN ? "space-around" : "space-between",
        flexWrap: IS_SMALL_SCREEN ? 'nowrap' : 'nowrap', 
        marginBottom: IS_SMALL_SCREEN ? 5 : 10,
    },
    depositosRowSecond: {
        flexDirection: "row",
        justifyContent: "space-around",
        flexWrap: 'nowrap',
        gap: 15,
        marginBottom: 10,
    },
    depositoBoxSmall: {
        width: "18%", 
        minHeight: 80,
        borderRadius: 5,
        marginBottom: 5,
        overflow: 'hidden',
        marginHorizontal: IS_SMALL_SCREEN ? 2 : 0, 
    },
    depositoBoxLarge: {
        width: `${(100 / 7) - 1}%`, 
        minHeight: 80,
        borderRadius: 5,
        marginBottom: 5,
        overflow: 'hidden',
    },
    
    valueBox: {
        alignItems: "center",
        justifyContent: "center",
        height: 60, 
        minWidth: 50,
    },
    labelWrapper: {
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueBoxLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    depositoValueBoxLabel: {
        fontSize: getFontSize(2.0),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    valueBoxInput: {
        width: '100%',
        height: 30,
        borderRadius: 0, 
        fontSize: 18,
        fontWeight: "bold",
        padding: 0,
        textAlign: 'center',
    },

    pickerWrapper: {
        width: '100%',
        height: 30,
        borderRadius: 5, 
        justifyContent: 'center',
        overflow: 'hidden',
    },
    pickerWrapperRounded: {
        borderRadius: 5, 
    },
    pickerSelectedValue: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 2, 
    },
    picker: {
        width: '100%',
        height: 30,
        opacity: Platform.OS === 'ios' ? 0.01 : 1, 
        position: 'absolute',
        top: 0,
        left: 0,
        ...(Platform.OS === 'android' && {
            color: 'transparent',
            transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
            top: -5
        }),
    },

    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#05419A",
        backgroundColor: "#fff",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        width: '30%',
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: "bold",
        color: "#fff",
        fontSize: 12,
    },
    buttonFechada: {
        backgroundColor: "#96bc25ff", 
    },
    buttonRecusa: {
        backgroundColor: "#D32F2F", 
    },
    buttonVisita: {
        backgroundColor: "#05419A", 
    },
});