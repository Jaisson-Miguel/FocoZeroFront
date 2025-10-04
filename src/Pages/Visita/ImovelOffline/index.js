import { View, Text, TouchableOpacity } from "react-native";
import Cabecalho from "../../../Components/Cabecalho";

export default function ImovelOffline({ route, navigation }) {
  const { quarteirao } = route.params;
  const offline = true;

  return (
    <View style={{ flex: 1 }}>
      <Cabecalho navigation={navigation} />
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Imóveis do Quarteirão {quarteirao.numero} - {quarteirao.nomeArea}
      </Text>
      {quarteirao.imoveis.map((imovel) => (
        <View
          key={imovel._id}
          style={{
            padding: 12,
            borderBottomWidth: 1,
            borderColor: "#ddd",
            backgroundColor: "#fff",
            marginTop: 8,
            borderRadius: 6,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            {imovel.logradouro}, {imovel.numero}
          </Text>
          <Text style={{ color: "gray" }}>Status: {imovel.status}</Text>
          <TouchableOpacity
            // key={imovel._id}
            onPress={() =>
              navigation.navigate("Visita", {
                imovel: imovel,
                idArea: quarteirao.idArea,
                nomeArea: quarteirao.nomeArea,
                quarteirao: quarteirao,
              })
            }
          >
            <Text style={{ fontSize: 16, fontWeight: "500" }}>Visitar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditarImovel", {
                imovel: imovel,
                offline,
              })
            }
          >
            <Text> Editar</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
