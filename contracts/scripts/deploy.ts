import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({ network: "sepolia" });
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with: ${deployer.address}`);

  const vaultFactory = await ethers.getContractFactory("ConfidentialComplianceVault");
  const vault = await vaultFactory.deploy(deployer.address, deployer.address);

  await vault.waitForDeployment();
  const address = await vault.getAddress();
  console.log(`ConfidentialComplianceVault deployed at: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
