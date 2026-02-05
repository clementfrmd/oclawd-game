const hre = require("hardhat");

async function main() {
  console.log("🌌 Deploying Void Conquest contracts to", hre.network.name);
  console.log("=".repeat(50));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // 1. Deploy VoidToken ($VOID)
  console.log("1️⃣  Deploying VoidToken ($VOID)...");
  const VoidToken = await hre.ethers.getContractFactory("VoidToken");
  const voidToken = await VoidToken.deploy();
  await voidToken.waitForDeployment();
  const voidTokenAddress = await voidToken.getAddress();
  console.log("   ✅ VoidToken deployed to:", voidTokenAddress);
  console.log("");

  // 2. Deploy VoidGame (main game contract)
  console.log("2️⃣  Deploying VoidGame...");
  const VoidGame = await hre.ethers.getContractFactory("VoidGame");
  const voidGame = await VoidGame.deploy(voidTokenAddress);
  await voidGame.waitForDeployment();
  const voidGameAddress = await voidGame.getAddress();
  console.log("   ✅ VoidGame deployed to:", voidGameAddress);
  console.log("");

  // 3. Deploy VoidBoosts (token utility)
  console.log("3️⃣  Deploying VoidBoosts...");
  const VoidBoosts = await hre.ethers.getContractFactory("VoidBoosts");
  // Treasury and staking pool = deployer for now
  const voidBoosts = await VoidBoosts.deploy(
    voidTokenAddress,
    deployer.address, // treasury
    deployer.address  // staking pool
  );
  await voidBoosts.waitForDeployment();
  const voidBoostsAddress = await voidBoosts.getAddress();
  console.log("   ✅ VoidBoosts deployed to:", voidBoostsAddress);
  console.log("");

  // 4. Configure contracts
  console.log("4️⃣  Configuring contracts...");
  
  // Add VoidGame as minter for rewards
  await voidToken.addMinter(voidGameAddress);
  console.log("   ✅ VoidGame added as $VOID minter");
  
  // Set boosts contract in game
  await voidGame.setBoostsContract(voidBoostsAddress);
  console.log("   ✅ VoidBoosts set in VoidGame");
  
  // Set game contract in boosts
  await voidBoosts.setGameContract(voidGameAddress);
  console.log("   ✅ VoidGame set in VoidBoosts");
  console.log("");

  // Summary
  console.log("=".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("");
  console.log("Contract Addresses:");
  console.log("  VoidToken ($VOID):", voidTokenAddress);
  console.log("  VoidGame:         ", voidGameAddress);
  console.log("  VoidBoosts:       ", voidBoostsAddress);
  console.log("");
  console.log("Save these addresses for frontend configuration!");
  console.log("");

  // Return addresses for programmatic use
  return {
    voidToken: voidTokenAddress,
    voidGame: voidGameAddress,
    voidBoosts: voidBoostsAddress,
    network: hre.network.name
  };
}

main()
  .then((addresses) => {
    console.log("Deployment addresses:", JSON.stringify(addresses, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
