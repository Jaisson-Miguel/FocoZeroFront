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
  KeyboardAvoidingView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { getId } from "../../../utils/tokenStorage.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Cabecalho from "../../../Components/Cabecalho";
import { height, width, font } from "../../../utils/responsive.js";

const screenWidth = Dimensions.get("window").width;
const IS_SMALL_SCREEN = screenWidth < 400;

const mapearTipoImovel = (tipo) => {
  const tipos = {
    r: "R",
    c: "C",
    tb: "TB",
    pe: "P.E",
    out: "Out",
  };
  const chave = tipo ? String(tipo).toLowerCase().trim() : "";
  return tipos[chave] || "SELECIONE";
};

const ElementDropdown = ({
  value,
  onValueChange,
  options,
  inputBackgroundColor,
  inputTextColor,
}) => {
  const renderItem = (item) => {
    return (
      <View style={styles.dropdownItem}>
        <Text style={styles.dropdownItemText}>{item.label}</Text>
      </View>
    );
  };

  const renderValue = () => {
    return (
      <View style={styles.selectedWrapper}>
        <Text
          style={[styles.selectedValueDisplayed, { color: inputTextColor }]}
        >
          {mapearTipoImovel(value)}
        </Text>
      </View>
    );
  };

  return (
    <Dropdown
      style={[styles.dropdown, { backgroundColor: inputBackgroundColor }]}
      placeholderStyle={[styles.placeholderStyle, { color: inputTextColor }]}
      selectedTextStyle={styles.hiddenSelectedTextStyle}
      iconStyle={styles.iconStyle}
      data={options}
      maxHeight={height(25)}
      labelField="label"
      valueField="value"
      value={value}
      onChange={(item) => {
        onValueChange(item.value);
      }}
      renderItem={renderItem}
      renderLeftIcon={renderValue}
      iconColor={inputTextColor}
      dropdownPosition="bottom"
      placeholder={value ? "" : "SELECIONE"}
      flatListProps={{
        style: {
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: font(0.5),
        },
      }}
    />
  );
};

const ValueBox = ({
  label,
  value,
  isInput = false,
  isPicker = false,
  isDeposito = false,
  isSpecialInput = false,
  isRounded = false,
  onChangeText,
  onValueChange,
  keyboardType = "numeric",
  style,
  options = [],
  isBlueTheme = false,
}) => {
  let content;

  const useSpecialStyle = isDeposito || isSpecialInput;

  const labelFundo = useSpecialStyle ? "#05419A" : "transparent";
  const labelColor = useSpecialStyle ? "#fff" : isBlueTheme ? "#fff" : "#000";

  const inputBackgroundColor = useSpecialStyle
    ? "#E0E0E0"
    : isBlueTheme
      ? "#fff"
      : "#E0E0E0";
  const inputTextColor = "#05419A";

  const labelStyle = useSpecialStyle
    ? styles.depositoValueBoxLabel
    : styles.valueBoxLabel;

  const finalInputStyle = [
    styles.valueBoxInput,
    {
      backgroundColor: inputBackgroundColor,
      color: inputTextColor,
    },
  ];

  if (isInput) {
    if (isBlueTheme) {
      finalInputStyle.push({ borderRadius: font(0.5) });
    } else if (useSpecialStyle) {
      finalInputStyle.push({
        borderBottomLeftRadius: font(0.5),
        borderBottomRightRadius: font(0.5),
      });
    }
  }

  if (isPicker) {
    content = (
      <ElementDropdown
        value={value}
        onValueChange={onValueChange}
        options={options}
        inputBackgroundColor={inputBackgroundColor}
        inputTextColor={inputTextColor}
        isBlueTheme={isBlueTheme}
      />
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
    content = (
      <View
        style={[
          styles.valueBoxValueWrapper,
          { backgroundColor: inputBackgroundColor },
        ]}
      >
        <Text style={[styles.valueBoxValue, { color: inputTextColor }]}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.valueBox,
        style,
        { backgroundColor: "transparent", height: height(10) },
      ]}
    >
      <View
        style={[
          styles.labelWrapper,
          {
            backgroundColor: labelFundo,
            width: "100%",
            borderTopLeftRadius: useSpecialStyle ? font(0.5) : 0,
            borderTopRightRadius: useSpecialStyle ? font(0.5) : 0,
          },
        ]}
      >
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
      a1: "",
      a2: "",
      b: "",
      c: "",
      d1: "",
      d2: "",
      e: "",
    },
    numero: imovel.numero || "",
    tipo:
      imovel.complemento || imovel.tipo
        ? (imovel.complemento || imovel.tipo).toLowerCase().trim()
        : "r",
    qtdHabitantes: imovel.qtdHabitantes || "",
    qtdCachorros: imovel.qtdCachorros || "",
    qtdGatos: imovel.qtdGatos || "",
    amostrasInicial: "",
    amostrasFinal: "",
    qtdFoco: "",
    qtdLarvicida: "",
    qtdDepTratado: "",
    qtdDepEliminado: "",
  });
  const handleInputChange = (campo, valor) => {
    const numericFields = [
      "qtdHabitantes",
      "qtdCachorros",
      "qtdGatos",
      "amostrasInicial",
      "amostrasFinal",
      "qtdFoco",
      "qtdLarvicida",
      "qtdDepTratado",
      "qtdDepEliminado",
    ];
    let finalValue = valor;
    if (numericFields.includes(campo)) {
      finalValue = valor.replace(/[^0-9]/g, "");
    }
    setForm({ ...form, [campo]: finalValue });
  };

  const handleDepositoChange = (campo, valor) => {
    const finalValue = valor.replace(/[^0-9]/g, "");
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

    if (statusAcao === "visitado") {
      try {
        const visita = {
          idImovel: imovel._id,
          idAgente: agenteId,
          idArea: idArea,
          idQuarteirao: quarteirao._id,
          tipo: form.tipo,
          numero: form.numero,
          dataVisita: new Date(),
          depositosInspecionados: Object.entries(
            form.depositosInspecionados
          ).reduce(
            (acc, [key, val]) => ({ ...acc, [key]: Number(val) || 0 }),
            {}
          ),
          qtdHabitantes: Number(form.qtdHabitantes) || 0,
          qtdCachorros: Number(form.qtdCachorros) || 0,
          qtdGatos: Number(form.qtdGatos) || 0,
          amostrasInicial: Number(form.amostrasInicial) || 0,
          amostrasFinal: Number(form.amostrasFinal) || 0,
          qtdFoco: Number(form.qtdFoco) || 0,
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
                editadoOffline: true,
              }
              : i
          );
          await AsyncStorage.setItem(
            "dadosImoveis",
            JSON.stringify(listaImoveis)
          );
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
          await AsyncStorage.setItem(
            "dadosImoveis",
            JSON.stringify(listaImoveis)
          );
        }
        Alert.alert(
          "Atenção",
          `Imóvel marcado como: ${statusAcao.toUpperCase()}.`
        );
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
    <View style={styles.safeArea}>
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
                <Text style={styles.streetHeaderBlueCompact}>
                  {imovel.logradouro}
                </Text>
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
                value={form.qtdCachorros}
                isInput={true}
                onChangeText={(v) => handleInputChange("qtdCachorros", v)}
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
                {(IS_SMALL_SCREEN ? firstRowKeys : depositosKeys).map(
                  (campo) => (
                    <ValueBox
                      key={campo}
                      label={campo.toUpperCase()}
                      value={form.depositosInspecionados[campo]}
                      isInput={true}
                      isDeposito={true}
                      onChangeText={(v) => handleDepositoChange(campo, v)}
                      keyboardType="numeric"
                      style={
                        IS_SMALL_SCREEN
                          ? styles.depositoBoxSmall
                          : styles.depositoBoxLarge
                      }
                    />
                  )
                )}
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
                  value={form.qtdFoco}
                  isInput={true}
                  isSpecialInput={true}
                  onChangeText={(v) => handleInputChange("qtdFoco", v)}
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
        <TouchableOpacity
          style={[styles.bottomButton, styles.buttonFechada]}
          onPress={() => salvarVisita("fechado")}
        >
          <Text style={styles.buttonText}>Fechada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.buttonRecusa]}
          onPress={() => salvarVisita("recusa")}
        >
          <Text style={styles.buttonText}>Recusa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.buttonVisita]}
          onPress={() => salvarVisita("visitado")}
        >
          <Text style={styles.buttonText}>Realizar visita</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: height(10),
  },

  simpleTitleContainer: {
    paddingHorizontal: width(4),
    alignItems: "center",
    paddingVertical: height(1.2),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  simpleTitle: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#05419A",
    textTransform: "uppercase",
  },
  simpleSubtitle: {
    fontSize: font(2.5),
    color: "#666",
    textTransform: "uppercase",
  },

  blueInfoSection: {
    backgroundColor: "#05419A",
    padding: width(2.5),
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height(1),
    minHeight: height(6),
  },

  streetBox: {
    width: width(38),
    justifyContent: "center",
    paddingHorizontal: width(1),
  },
  streetHeaderBlueCompact: {
    fontSize: font(4),
    fontWeight: "bold",
    color: "#fff",
  },

  smallBoxCompact: {
    width: width(18),
    height: height(10),
    paddingVertical: height(0.5),
    paddingHorizontal: width(0.5),
  },

  mediumBoxCompact: {
    width: width(35),
    height: height(10),
    padding: width(1.25),
  },

  contentSections: {
    paddingHorizontal: width(2.5),
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height(1),
    gap: width(1.5),
  },

  infoRowCampos: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: height(1),
    gap: width(5),
  },

  smallBox: {
    width: width(28),
    borderRadius: font(0.5),
    paddingVertical: height(0.5),
    paddingHorizontal: width(0.5),
  },
  mediumBox: {
    width: width(60),
    borderRadius: font(0.5),
    padding: width(1.25),
  },

  halfWidthSpecial: {
    width: width(40),
    minHeight: height(12),
    borderRadius: font(0.5),
    overflow: "hidden",
  },
  fullWidthSpecial: {
    width: width(48),
    minHeight: height(12),
    borderRadius: font(0.5),
    overflow: "hidden",
  },

  section: {
    borderTopWidth: 1,
    alignItems: "center",
    borderTopColor: "#05419A",
    paddingTop: height(1),
    marginBottom: height(1),
  },
  sectionTitle: {
    fontSize: font(3),
    fontWeight: "bold",
    color: "#05419A",
    marginBottom: height(1),
  },

  depositosRow: {
    flexDirection: "row",
    gap: width(2),
    justifyContent: IS_SMALL_SCREEN ? "space-around" : "space-between",
    flexWrap: IS_SMALL_SCREEN ? "nowrap" : "nowrap",
    marginBottom: IS_SMALL_SCREEN ? height(0.5) : height(1),
  },
  depositosRowSecond: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "nowrap",
    gap: width(3),
    marginBottom: height(1),
  },
  depositoBoxSmall: {
    width: width(18),
    minHeight: height(12),
    borderRadius: font(0.5),
    marginBottom: height(0.5),
    overflow: "hidden",
    marginHorizontal: IS_SMALL_SCREEN ? width(0.5) : 0,
  },
  depositoBoxLarge: {
    width: width(7),
    minHeight: height(12),
    borderRadius: font(0.5),
    marginBottom: height(0.5),
    overflow: "hidden",
    paddingHorizontal: width(1),
  },

  valueBox: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: height(10),
    minWidth: width(12),
  },
  labelWrapper: {
    paddingVertical: height(0.5),
    paddingHorizontal: width(1),
    alignItems: "center",
    justifyContent: "center",
  },
  valueBoxLabel: {
    fontSize: font(1.8),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: font(2.2),
  },
  depositoValueBoxLabel: {
    fontSize: font(2.0),
    fontWeight: "bold",
    height: height(3),
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: height(3),
  },
  valueBoxInput: {
    width: "100%",
    height: height(5),
    borderRadius: 0,
    fontSize: font(2.5),
    fontWeight: "bold",
    padding: 0,
    textAlign: "center",
  },
  valueBoxValueWrapper: {
    width: "100%",
    height: height(5),
    justifyContent: "center",
    alignItems: "center",
  },
  valueBoxValue: {
    fontSize: font(2.5),
    fontWeight: "bold",
    textAlign: "center",
  },

  dropdown: {
    height: height(5),
    width: "100%",
    borderRadius: font(0.5),
    paddingHorizontal: width(1),
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderStyle: {
    fontSize: font(2.5),
    fontWeight: "bold",
    textAlign: "center",
    color: "#05419A",
  },
  hiddenSelectedTextStyle: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  selectedWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    paddingHorizontal: width(1),
  },
  selectedValueDisplayed: {
    fontSize: font(2.5),
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  iconStyle: {
    width: font(3),
    height: font(3),
    marginRight: width(2),
  },
  dropdownItem: {
    padding: height(1.5),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownItemText: {
    fontSize: font(2.25),
    color: "#05419A",
    fontWeight: "bold",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: height(1),
    borderTopWidth: 1,
    borderTopColor: "#05419A",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: height(5),
  },
  bottomButton: {
    paddingVertical: height(1),
    paddingHorizontal: width(3),
    borderRadius: font(0.5),
    width: width(30),
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: font(1.8),
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
