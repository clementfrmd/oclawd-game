const hre = require("hardhat");

async function main() {
  console.log("Deploying Oclawd contracts to Base Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy OclawdNFT first
  console.log("Deploying OclawdNFT...");
  const OclawdNFT = await hre.ethers.getContractFactory("OclawdNFT");
  const nft = await OclawdNFT.deploy("Oclawd Fleet Ships", "OCLSHIP");
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("OclawdNFT deployed to:", nftAddress);

  // Use a dummy token address for now (can be updated later)
  // On Base Sepolia, we'll use a placeholder
  const dummyTokenAddress = "0x0000000000000000000000000000000000000001";

  // Deploy OclawdGame (main contract)
  console.log("\nDeploying OclawdGame...");
  const OclawdGame = await hre.ethers.getContractFactory("OclawdGame");
  const game = await OclawdGame.deploy(
    "Oclawd Ships",     // name
    "OCLAWD",           // symbol
    dummyTokenAddress   // resource token (placeholder)
  );
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("OclawdGame deployed to:", gameAddress);

  console.log("\n=== Deployment Complete ===");
  console.log("OclawdNFT:", nftAddress);
  console.log("OclawdGame:", gameAddress);
  console.log("\nView on BaseScan:");
  console.log("https://sepolia.basescan.org/address/" + nftAddress);
  console.log("https://sepolia.basescan.org/address/" + gameAddress);
  
  // Save addresses
  const fs = require("fs");
  const addresses = {
    network: "base-sepolia",
    chainId: 84532,
    OclawdNFT: nftAddress,
    OclawdGame: gameAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };
  fs.writeFileSync("./deployed-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
