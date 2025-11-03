import * as FileSystem from "expo-file-system/legacy"; // Mudado para /legacy para evitar o aviso de depreciação

// Define o diretório onde os mapas serão salvos.
// FileSystem.documentDirectory é o local seguro para arquivos persistentes do app.
const MAPS_DIRECTORY = FileSystem.documentDirectory + "offline_maps/";

/**
 * Baixa um arquivo de mapa de uma URL remota para o sistema de arquivos local.
 *
 * @param {string} url - A URL remota do arquivo do mapa (e.g., Cloudinary).
 * @returns {Promise<string|null>} A URI do arquivo local (file://...) ou null em caso de falha.
 */
export async function downloadMapForOffline(url) {
  if (!url) {
    console.warn("URL do mapa inválida ou nula.");
    return null;
  }

  // Define o nome do arquivo de destino antecipadamente, caso precise deletá-lo em caso de erro.
  const filename = `mapa-${Date.now()}.png`; // Usamos timestamp para garantir unicidade
  const localUri = MAPS_DIRECTORY + filename;

  try {
    // 1. Garante que o diretório de mapas exista
    // Usando getInfoAsync, que agora vem da importação /legacy
    const dirInfo = await FileSystem.getInfoAsync(MAPS_DIRECTORY);
    if (!dirInfo.exists) {
      console.log("Criando diretório para mapas offline...");
      await FileSystem.makeDirectoryAsync(MAPS_DIRECTORY, {
        intermediates: true,
      });
    }

    // 2. Executa o download usando expo-file-system
    const { uri: finalUri, status } = await FileSystem.downloadAsync(
      url,
      localUri
    );

    if (status === 200) {
      console.log(`[Download] Mapa baixado com sucesso para: ${finalUri}`);
      return finalUri;
    } else {
      // Falha no download (ex: 404, 500)
      console.error(
        `[Download] Falha no download do mapa. Status: ${status}. Tentando limpar arquivo parcial.`
      );

      // Tenta remover o arquivo parcial se o download falhou
      try {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      } catch (e) {
        // Ignora erro ao deletar
      }
      return null;
    }
  } catch (error) {
    // Falha de rede, permissão, etc.
    console.error(
      `[Download Error] Erro crítico ao baixar mapa: ${error.message}`
    );

    // Tenta remover o arquivo parcial se ele foi criado antes de falhar
    try {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch (e) {
      // Ignora erro ao deletar
    }
    return null;
  }
}
