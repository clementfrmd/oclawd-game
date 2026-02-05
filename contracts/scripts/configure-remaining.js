const hre = require("hardhat");

const ADDRESSES = {
  voidToken: "0x7c010025DD07414E447de1958BfEfE3d1DE553e3",
  voidGame: "0x2E93692fD8a859A8882B5B0fc3753D97A29b92Ea",
  voidBoosts: "0x0ebC3201aaD226f933e256c6FDC0c55Ed9290934"
};

async function main() {
  console.log("⚙️  Finishing configuration...\n");
  
  const VoidGame = await hre.ethers.getContractFactory("VoidGame");
  const voidGame = VoidGame.attach(ADDRESSES.voidGame);
  
  const VoidBoosts = await hre.ethers.getContractFactory("VoidBoosts");
  const voidBoosts = VoidBoosts.attach(ADDRESSES.voidBoosts);
  
  // 2. Set boosts contract in game
  console.log("Setting VoidBoosts in VoidGame...");
  const tx2 = await voidGame.setBoostsContract(ADDRESSES.voidBoosts);
  await tx2.wait();
  console.log("✅ Done");
  
  // 3. Set game contract in boosts
  console.log("Setting VoidGame in VoidBoosts...");
  const tx3 = await voidBoosts.setGameContract(ADDRESSES.voidGame);
  await tx3.wait();
  console.log("✅ Done");
  
  console.log("\n🎉 All configured!");
}

main().then(() => process.exit(0)).catch(console.error);
