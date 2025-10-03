import { View, Text, TouchableOpacity } from "react-native";
import Cabecalho from "../../../Components/Cabecalho";

export default function ImovelOffline({ route, navigation }) {
  const { quarteirao } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Imóveis do Quarteirão {quarteirao.numero} - {quarteirao.nomeArea}
      </Text>
      {quarteirao.imoveis.map((imovel) => (
        <TouchableOpacity
          key={imovel._id}
          style={{
            padding: 12,
            borderBottomWidth: 1,
            borderColor: "#ddd",
            backgroundColor: "#fff",
            marginTop: 8,
            borderRadius: 6,
          }}
          onPress={() =>
            navigation.navigate("Visita", {
              imovel: imovel,
              idArea: quarteirao.idArea,
              nomeArea: quarteirao.nomeArea,
              quarteirao: quarteirao,
            })
          }
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            {imovel.logradouro}, {imovel.numero}
          </Text>
          <Text style={{ color: "gray" }}>Status: {imovel.status}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
