import { ethers, network, run } from "hardhat";

async function main() {
  const cryptoKidz = await ethers.deployContract("CryptoKidz");

  await cryptoKidz.waitForDeployment();

  console.log(`Deployed contract with ${await cryptoKidz.getAddress()}`);

  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    await verify(await cryptoKidz.getAddress(), []);
  }
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
      console.log(error);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
