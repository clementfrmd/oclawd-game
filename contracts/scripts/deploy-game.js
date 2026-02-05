const hre = require("hardhat");

async function main() {
  console.log("Deploying OclawdGame to Base Sepolia...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Use a dummy token address for now
  const dummyTokenAddress = "0x0000000000000000000000000000000000000001";

  // Deploy OclawdGame
  console.log("Deploying OclawdGame...");
  const OclawdGame = await hre.ethers.getContractFactory("OclawdGame");
  const game = await OclawdGame.deploy(
    "Oclawd Ships",
    "OCLAWD",
    dummyTokenAddress
  );
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("OclawdGame deployed to:", gameAddress);

  // Previously deployed OclawdNFT
  const nftAddress = "0xE7aeC0BB5bB4A60e48629300d3b09318327f0210";

  console.log("\n=== Deployment Complete ===");
  console.log("OclawdNFT:", nftAddress);
  console.log("OclawdGame:", gameAddress);
  console.log("\nView on BaseScan:");
  console.log("https://sepolia.basescan.org/address/" + nftAddress);
  console.log("https://sepolia.basescan.org/address/" + gameAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
