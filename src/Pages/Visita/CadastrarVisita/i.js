refaca esse codigo aqui mas atualize a estilizacao da quantidade de amostras, foco e larvicida para ficar igual ao de depositos inspecionados, mas nao precisa tratar em diferentes tamanhos de tela

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
  Dimensions, // Adicionado Dimensions para responsividade mais robusta
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getId } from "../../../utils/tokenStorage.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Cabecalho from "../../../Components/Cabecalho";
// Importações de utilitários responsive (mantidas, mas usando Dimensions como fallback se não houver)
import { height, width, font } from "../../../utils/responsive.js"; 


const screenWidth = Dimensions.get('window').width;
const IS_SMALL_SCREEN = screenWidth < 400; // Breakpoint para a responsividade 3+4 nos depósitos
const FONT_MULTIPLIER = 1; // Usar valor 1 se 'font' não estiver definido, ou se for uma constante.

// Função auxiliar para garantir o uso de 'font' se estiver disponível
const getFontSize = (size) => {
    // Usando a função 'font' se ela for definida e válida, senão usa um valor fixo baseado na proporção
    if (typeof font === 'function') {
        return font(size);
    }
    // Fallback simples
    return size * FONT_MULTIPLIER; 
};


// Mapeamento de abreviação para nome completo (para salvar)
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

// Componente para o layout dos inputs de Depósito/Amostra/Foco/Larvicida
const ValueBox = ({ label, value, isInput = false, isPicker = false, isDeposito = false, onChangeText, onValueChange, keyboardType = 'numeric', style, options = [], isBlueTheme = false }) => {
    let content;

    // Define cores baseadas no tema ou se é um Depósito
    // Depósito: labelFundo=Azul, labelCor=Branco, inputFundo=Cinza, inputCor=Azul
    const labelFundo = isDeposito ? '#05419A' : 'transparent';
    const labelColor = isDeposito ? '#fff' : (isBlueTheme ? '#fff' : '#000');
    const inputBackgroundColor = isDeposito ? '#E0E0E0' : (isBlueTheme ? '#fff' : '#E0E0E0');
    const inputTextColor = '#05419A'; // Cor do texto no input

    const labelStyle = isDeposito ? styles.depositoValueBoxLabel : styles.valueBoxLabel;

    if (isPicker) {
        content = (
            <View style={[styles.pickerWrapper, { backgroundColor: inputBackgroundColor }]}>
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
                style={[styles.valueBoxInput, { 
                    backgroundColor: inputBackgroundColor, 
                    color: inputTextColor,
                    borderBottomLeftRadius: isDeposito ? 5 : 0,
                    borderBottomRightRadius: isDeposito ? 5 : 0,
                }]}
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
            {/* Rótulo com fundo Azul para depósitos */}
            <View style={[styles.labelWrapper, { 
                backgroundColor: labelFundo,
                width: '100%', 
                // Apenas a parte superior é arredondada no Depósito
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
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
  
  // Opções para o Picker do Tipo de Imóvel
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
    // Encontra o tipo existente e garante que seja uma das opções válidas, senão usa 'r'
    tipo: (imovel.complemento || imovel.tipo) ? (imovel.complemento || imovel.tipo).toLowerCase().trim() : "r",
    qtdHabitantes: "",
    qtdCaes: "",
    qtdGatos: "",
    amostrasInicial: "",
    amostrasFinal: "",
    foco: "",
    qtdLarvicida: "",
    qtdDepTratado: "",
  });
  
  const handleInputChange = (campo, valor) => {
    const numericFields = ['qtdHabitantes', 'qtdCaes', 'qtdGatos', 'amostrasInicial', 'amostrasFinal', 'foco', 'qtdLarvicida', 'qtdDepTratado'];
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
    <SafeAreaView style={styles.safeArea}>
      
      {/* CABEÇALHO IMPORTADO */}
      <Cabecalho navigation={navigation} /> 
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* TÍTULO SIMPLES PARA ÁREA E QUARTEIRÃO */}
        <View style={styles.simpleTitleContainer}>
            <Text style={styles.simpleTitle}>
                {quarteirao.nomeArea} - {quarteirao.numero}
            </Text>
            <Text style={styles.simpleSubtitle}>
                Código {quarteirao.codigoArea} - Zona {quarteirao.zonaArea}
            </Text>
        </View>

        {/* SEÇÃO AZUL PARA ENDEREÇO E QUANTIDADES */}
        <View style={styles.blueInfoSection}>
            <Text style={styles.streetHeaderBlue}>{imovel.logradouro}</Text>
            <View style={styles.infoRow}>
                {/* Campo de Número Editável */}
                <ValueBox 
                    label="Nº" 
                    value={form.numero} 
                    isInput={true}
                    onChangeText={(v) => handleInputChange("numero", v)}
                    keyboardType="default"
                    style={styles.smallBox}
                    isBlueTheme={true} // Aplica o tema azul (texto branco, input branco)
                />
                
                {/* Campo de Tipo (Picker) */}
                <ValueBox 
                    label="Tipo do Imóvel" 
                    value={form.tipo}
                    isPicker={true}
                    onValueChange={(v) => handleInputChange("tipo", v)}
                    options={tipoOpcoes}
                    style={styles.mediumBox}
                    isBlueTheme={true} // Aplica o tema azul
                />
            </View>
            <View style={styles.infoRow}>
                {/* Campo Habitantes */}
                <ValueBox 
                    label="Habitantes" 
                    value={form.qtdHabitantes} 
                    isInput={true} 
                    onChangeText={(v) => handleInputChange("qtdHabitantes", v)}
                    keyboardType="numeric"
                    style={styles.smallBox}
                    isBlueTheme={true} // Aplica o tema azul
                />
                {/* Campo Cães */}
                <ValueBox 
                    label="Cães" 
                    value={form.qtdCaes} 
                    isInput={true} 
                    onChangeText={(v) => handleInputChange("qtdCaes", v)}
                    keyboardType="numeric"
                    style={styles.smallBox}
                    isBlueTheme={true} // Aplica o tema azul
                />
                {/* Campo Gatos */}
                <ValueBox 
                    label="Gatos" 
                    value={form.qtdGatos} 
                    isInput={true} 
                    onChangeText={(v) => handleInputChange("qtdGatos", v)}
                    keyboardType="numeric"
                    style={styles.smallBox}
                    isBlueTheme={true} // Aplica o tema azul
                />
            </View>
        </View>

        {/* SEÇÕES BRANCAS ABAIXO */}
        <View style={styles.contentSections}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Depósitos inspecionados</Text>
            
            {/* LINHA 1 DE DEPÓSITOS (3 itens ou todos em tela grande) */}
            <View style={styles.depositosRow}>
                {(IS_SMALL_SCREEN ? firstRowKeys : depositosKeys).map((campo) => (
                    <ValueBox
                        key={campo}
                        label={campo.toUpperCase()}
                        value={form.depositosInspecionados[campo]}
                        isInput={true}
                        isDeposito={true} // NOVO ESTILO: Label Azul / Input Cinza
                        onChangeText={(v) => handleDepositoChange(campo, v)}
                        keyboardType="numeric"
                        // Largura responsiva
                        style={IS_SMALL_SCREEN ? styles.depositoBoxSmall : styles.depositoBoxLarge}
                    />
                ))}
            </View>

            {/* LINHA 2 DE DEPÓSITOS (Apenas os 4 restantes em tela pequena) */}
            {IS_SMALL_SCREEN && (
                <View style={styles.depositosRowSecond}> 
                    {secondRowKeys.map((campo) => (
                        <ValueBox
                            key={campo}
                            label={campo.toUpperCase()}
                            value={form.depositosInspecionados[campo]}
                            isInput={true}
                            isDeposito={true} // NOVO ESTILO: Label Azul / Input Cinza
                            onChangeText={(v) => handleDepositoChange(campo, v)}
                            keyboardType="numeric"
                            style={styles.depositoBoxSmall} // Mesma largura da linha de cima
                        />
                    ))}
                </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amostras</Text>
            <View style={styles.infoRow}>
              <ValueBox 
                  label="Inicial" 
                  value={form.amostrasInicial} 
                  isInput={true} 
                  onChangeText={(v) => handleInputChange("amostrasInicial", v)}
                  keyboardType="numeric"
                  style={styles.mediumBoxWhite}
                  isBlueTheme={false}
              />
              <ValueBox 
                  label="Final" 
                  value={form.amostrasFinal} 
                  isInput={true} 
                  onChangeText={(v) => handleInputChange("amostrasFinal", v)}
                  keyboardType="numeric"
                  style={styles.mediumBoxWhite}
                  isBlueTheme={false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foco</Text>
            <View style={styles.infoRow}>
              <ValueBox 
                  label="Quantidade" 
                  value={form.foco} 
                  isInput={true} 
                  onChangeText={(v) => handleInputChange("foco", v)}
                  keyboardType="numeric"
                  style={styles.fullBox}
                  isBlueTheme={false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Larvicida</Text>
            <View style={styles.infoRow}>
              <ValueBox 
                  label="Gramas" 
                  value={form.qtdLarvicida} 
                  isInput={true} 
                  onChangeText={(v) => handleInputChange("qtdLarvicida", v)}
                  keyboardType="numeric"
                  style={styles.mediumBoxWhite}
                  isBlueTheme={false}
              />
              <ValueBox 
                  label="Depósitos" 
                  value={form.qtdDepTratado} 
                  isInput={true} 
                  onChangeText={(v) => handleInputChange("qtdDepTratado", v)}
                  keyboardType="numeric"
                  style={styles.mediumBoxWhite}
                  isBlueTheme={false}
              />
            </View>
          </View>
        </View>
        
        {/* Espaço para o formulário não ficar atrás da barra de botões */}
        <View style={{ height: 80 }} /> 
      </ScrollView>
      
      {/* Barra de Botões de Ação Fixa na parte inferior */}
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
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  
  // TÍTULO SIMPLES PARA ÁREA E QUARTEIRÃO
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
  
  // SEÇÃO AZUL PARA ENDEREÇO E QUANTIDADES
  blueInfoSection: {
    backgroundColor: "#05419A",
    padding: 10,
  },
  streetHeaderBlue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    paddingVertical: 5,
  },
  contentSections: {
    paddingHorizontal: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
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
  mediumBoxWhite: {
    width: "48%",
    borderRadius: 5,
    padding: 5,
    backgroundColor: "#E0E0E0", 
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
  
  // ESTILOS RESPONSIVOS E VISUAIS PARA DEPÓSITOS
  depositosRow: {
    flexDirection: "row",
    gap: 15,
    justifyContent: IS_SMALL_SCREEN ? "space-around" : "space-between",
    flexWrap: IS_SMALL_SCREEN ? 'nowrap' : 'nowrap', // Usado now-wrap nas duas linhas pequenas e one-line na tela grande
    marginBottom: IS_SMALL_SCREEN ? 5 : 10,
  },
  depositosRowSecond: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: 'nowrap',
    gap: 15,
    marginBottom: 10,
  },
  // Largura para 3 ou 4 itens em tela pequena
  depositoBoxSmall: {
    width: "18%", // 3 itens: 30%, 4 itens: 23%
    minHeight: 80,
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
    marginHorizontal: IS_SMALL_SCREEN ? 2 : 0, // Pequeno margin para espaçar os 4 itens
  },
  // Largura para 7 itens em tela grande
  depositoBoxLarge: {
    width: `${(100 / 7) - 1}%`, // 100/7 = ~14.28%. Subtrai 1% para espaçamento
    minHeight: 80,
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  
  // Estilização das caixas de valor
  valueBox: {
    alignItems: "center",
    justifyContent: "center",
    height: 60, 
    minWidth: 50,
  },
  // Estilo Wrapper para o Label (permite fundo azul)
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
  // Estilo específico para o label do Depósito (fonte menor para caber)
  depositoValueBoxLabel: {
    fontSize: getFontSize(2.0),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  valueBoxInput: {
    width: '100%',
    height: 30,
    borderRadius: 0, // Removido o border radius aqui para manter apenas no wrapper/input
    fontSize: 18,
    fontWeight: "bold",
    padding: 0,
    textAlign: 'center',
  },

  // Estilização específica do Picker (mantida)
  pickerWrapper: {
    width: '100%',
    height: 30,
    borderRadius: 5,
    justifyContent: 'center',
    overflow: 'hidden',
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

  // Estilização da barra inferior (botões de ação)
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
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
    backgroundColor: "#8BC34A", 
  },
  buttonRecusa: {
    backgroundColor: "#D32F2F", 
  },
  buttonVisita: {
    backgroundColor: "#05419A", 
  },
});