import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { existeToken } from "../../utils/tokenStorage";

export default function Splash({ navigation }) {
  useEffect(() => {
    const verificarToken = async () => {
      const temToken = await existeToken(); // chama a função

      const timer = setTimeout(() => {
        if (temToken) {
          navigation.replace("Home");
        } else {
          navigation.replace("Login");
        }
      }, 2000);

      return () => clearTimeout(timer);
    };
    verificarToken();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/Logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05419A",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
