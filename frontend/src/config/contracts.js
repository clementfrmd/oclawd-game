// Oclawd Smart Contract Addresses - Base Sepolia
export const CONTRACTS = {
  OclawdNFT: "0xE7aeC0BB5bB4A60e48629300d3b09318327f0210",
  OclawdGame: "0x53298c20D3E29F9854A077AfB97dB9b0F713E4DD",
  chainId: 84532,
  network: "Base Sepolia"
};

export const CHAIN_CONFIG = {
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://sepolia.basescan.org" },
  },
  testnet: true,
};
