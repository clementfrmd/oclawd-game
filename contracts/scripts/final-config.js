const hre = require("hardhat");
async function main() {
  const VoidBoosts = await hre.ethers.getContractFactory("VoidBoosts");
  const voidBoosts = VoidBoosts.attach("0x0ebC3201aaD226f933e256c6FDC0c55Ed9290934");
  console.log("Setting VoidGame in VoidBoosts...");
  const tx = await voidBoosts.setGameContract("0x2E93692fD8a859A8882B5B0fc3753D97A29b92Ea");
  await tx.wait();
  console.log("✅ Done!");
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
