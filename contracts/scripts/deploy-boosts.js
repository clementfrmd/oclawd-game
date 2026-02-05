const hre = require("hardhat");

async function main() {
  console.log("Deploying VoidBoosts...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  
  const voidTokenAddress = "0x7c010025DD07414E447de1958BfEfE3d1DE553e3";
  
  const VoidBoosts = await hre.ethers.getContractFactory("VoidBoosts");
  const voidBoosts = await VoidBoosts.deploy(
    voidTokenAddress,
    deployer.address, // treasury
    deployer.address  // staking pool
  );
  await voidBoosts.waitForDeployment();
  
  const address = await voidBoosts.getAddress();
  console.log("✅ VoidBoosts deployed to:", address);
  
  return address;
}

main()
  .then((addr) => {
    console.log("Done! Address:", addr);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
