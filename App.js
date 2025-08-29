import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";

export default function App() {
  const BACKEND_URL = "http://192.168.1.10:3333"; // troca pro IP da tua máquina

  useEffect(() => {
    // Teste GET
    fetch(`${BACKEND_URL}/`)
      .then((res) => res.json())
      .then((data) => console.log("GET:", data))
      .catch((err) => console.log(err));
  }, []);

  const testePost = () => {
    fetch(`${BACKEND_URL}/echo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: "Oi backend!" }),
    })
      .then((res) => res.json())
      .then((data) => console.log("POST:", data))
      .catch((err) => console.log(err));
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Teste Front ↔ Back</Text>
      <Button title="Testar POST" onPress={testePost} />
    </View>
  );
}
