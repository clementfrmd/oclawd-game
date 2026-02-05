// Void Conquest Contract Addresses - Base Sepolia
export const CONTRACTS = {
  voidToken: "0x7c010025DD07414E447de1958BfEfE3d1DE553e3",
  voidGame: "0x2E93692fD8a859A8882B5B0fc3753D97A29b92Ea",
  voidBoosts: "0x0ebC3201aaD226f933e256c6FDC0c55Ed9290934",
};

export const CHAIN_ID = 84532; // Base Sepolia

// Block explorer
export const EXPLORER_URL = "https://sepolia.basescan.org";

// Contract links
export const getTokenUrl = () => `${EXPLORER_URL}/token/${CONTRACTS.voidToken}`;
export const getGameUrl = () => `${EXPLORER_URL}/address/${CONTRACTS.voidGame}`;
export const getBoostsUrl = () => `${EXPLORER_URL}/address/${CONTRACTS.voidBoosts}`;
