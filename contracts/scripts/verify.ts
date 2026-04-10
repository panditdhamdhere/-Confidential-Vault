import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import { Wallet } from "ethers";
import * as dotenv from "dotenv";
import hre from "hardhat";

dotenv.config();

const VAULT_FQN = "src/ConfidentialComplianceVault.sol:ConfidentialComplianceVault";

function normalizePrivateKey(raw: string | undefined): string {
  if (raw === undefined || raw === "") {
    throw new Error("DEPLOYER_PRIVATE_KEY is empty");
  }
  return raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");
}

function constructorArgsFromEnv(): [string, string] {
  const owner = process.env.VAULT_OWNER_ADDRESS?.trim();
  const officer = process.env.VAULT_COMPLIANCE_OFFICER_ADDRESS?.trim();
  if (owner && officer) {
    return [owner, officer];
  }
  const pk = normalizePrivateKey(process.env.DEPLOYER_PRIVATE_KEY);
  const deployer = new Wallet(pk).address;
  return [deployer, deployer];
}

async function main() {
  const address = process.env.VAULT_CONTRACT_ADDRESS?.trim();
  if (!address) {
    throw new Error("Set VAULT_CONTRACT_ADDRESS in contracts/.env (deployed vault address).");
  }
  const constructorArgs = constructorArgsFromEnv();
  await verifyContract(
    {
      address,
      constructorArgs,
      contract: VAULT_FQN,
      provider: "etherscan",
    },
    hre,
  );
  console.log("Verification submitted successfully (or contract was already verified).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
