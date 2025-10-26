import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

export const salvarToken = async (token) => {
  try {
    await SecureStore.setItemAsync("token", token);
    console.log("Token salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar token:", error);
  }
};

export const logout = async (navigation) => {
  try {
    await SecureStore.deleteItemAsync("token");
    console.log("Token removido com sucesso!");
    navigation.replace("Login");
  } catch (error) {
    console.error("Erro ao remover token:", error);
  }
};

export const existeToken = async () => {
  const token = await SecureStore.getItemAsync("token");
  return !!token; 
};


export const getUsuarioFromToken = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return null;

    return jwtDecode(token);
  } catch (error) {
    console.error("Erro ao recuperar token:", error);
    return null;
  }
};

export const getNome = async () => {
  const usuario = await getUsuarioFromToken();
  return usuario?.nome || null;
};

export const getId = async () => {
  const usuario = await getUsuarioFromToken();
  return usuario?.id || null;
};

export const getFuncao = async () => {
  const usuario = await getUsuarioFromToken();
  return usuario?.funcao || null;
};

export const isAdm = async () => {
  const funcao = await getFuncao();

  if ((funcao = "Agente")) {
    return false;
  }
};
