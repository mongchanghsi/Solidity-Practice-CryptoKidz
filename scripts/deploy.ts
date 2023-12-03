import { ethers, network, run } from "hardhat";

const CONFIRMATION_BLOCKS = 6;

async function main() {
  const cryptoKidz = await ethers.deployContract("CryptoKidz");

  await cryptoKidz.waitForDeployment();

  console.log(
    `Deployed contract with ${await cryptoKidz.getAddress()} under ${await cryptoKidz.getOwner()}`
  );

  const deploymentReceipt = cryptoKidz.deploymentTransaction();
  if (!deploymentReceipt) return;

  let gasUsed;

  // TODO: Improve gas used calculations
  // Should be gasUsed * effectiveGasPrice
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    const txn = await deploymentReceipt.wait(CONFIRMATION_BLOCKS);
    if (!txn) return;
    gasUsed = BigInt(txn.cumulativeGasUsed) * BigInt(txn.gasPrice);
    await verify(await cryptoKidz.getAddress(), []);
  } else {
    // Local
    const txn = await deploymentReceipt.wait();
    if (!txn) return;
    gasUsed = BigInt(txn.cumulativeGasUsed) * BigInt(txn.gasPrice);
  }

  console.log(`Gas used for deployment - ${gasUsed} wei`);
}

async function verify(contractAddress: string, args: string[]) {
  console.log(`Verifying ${contractAddress}`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified.");
    } else {
      console.log("Verification error", error);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
