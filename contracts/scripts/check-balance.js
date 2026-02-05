const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Address:", signer.address);
  const balance = await signer.provider.getBalance(signer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
