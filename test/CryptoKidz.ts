import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CryptoKidz", function () {
  async function deployFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const RELEASE_TIME = (await time.latest()) + ONE_YEAR_IN_SECS;

    const [owner, account1, account2] = await ethers.getSigners();

    const CryptoKidzContract = await ethers.getContractFactory("CryptoKidz");
    const cryptoKidz = await CryptoKidzContract.deploy();

    return { cryptoKidz, owner, account1, account2, RELEASE_TIME, ONE_GWEI };
  }

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { cryptoKidz, owner } = await loadFixture(deployFixture);
      expect(await cryptoKidz.owner()).to.equal(owner.address);
    });

    it("Should kids array have 1 default empty kid", async () => {
      const { cryptoKidz } = await loadFixture(deployFixture);
      const _firstKid = await cryptoKidz.kids(0);
      expect(_firstKid.firstName).to.equal("");
    });
  });

  describe("Add Kid", async () => {
    it("Should able to add kid by owner", async () => {
      const { cryptoKidz, account1, RELEASE_TIME } = await loadFixture(
        deployFixture
      );
      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );
      const _secondKid = await cryptoKidz.kids(1);
      expect(_secondKid.firstName).to.equal("Test First Name");
    });

    it("Should not allow any other person to add kid", async () => {
      const { cryptoKidz, account1, account2, RELEASE_TIME } =
        await loadFixture(deployFixture);

      await expect(
        cryptoKidz
          .connect(account1)
          .addKid(account2, "Test First Name", "Test Last Name", RELEASE_TIME)
      ).to.be.revertedWith("Only contract owner can call");
    });
  });

  describe("Available to Withdraw", async () => {
    it("Should show that kid is able to release his funds", async () => {
      const { cryptoKidz, account1, RELEASE_TIME } = await loadFixture(
        deployFixture
      );
      await time.increaseTo(RELEASE_TIME);
      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );
      expect(await cryptoKidz.availableToWithdraw(account1)).to.true;
    });

    it("Should show that kid is not able to release his funds", async () => {
      const { cryptoKidz, account1, RELEASE_TIME } = await loadFixture(
        deployFixture
      );
      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );
      expect(await cryptoKidz.availableToWithdraw(account1)).to.false;
    });

    it("Should throw error for kid does not exist", async () => {
      const { cryptoKidz, account1 } = await loadFixture(deployFixture);

      let _error: any;

      try {
        await cryptoKidz.availableToWithdraw(account1);
      } catch (error) {
        _error = error;
      }
      expect(_error.message).to.includes("Kid does not exist");
    });
  });

  describe("Deposit", () => {
    it("Should allow despoit to an address", async () => {
      const { cryptoKidz, account1, RELEASE_TIME, ONE_GWEI } =
        await loadFixture(deployFixture);
      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );

      await expect(
        cryptoKidz.connect(account1).deposit(account1, { value: ONE_GWEI })
      ).to.changeEtherBalances([cryptoKidz, account1], [ONE_GWEI, -ONE_GWEI]);

      const _firstKid = await cryptoKidz.kids(1);
      expect(_firstKid.amount).to.equal(ONE_GWEI);
    });

    it("Should throw error for kid does not exist", async () => {
      const { cryptoKidz, account1 } = await loadFixture(deployFixture);

      await expect(cryptoKidz.deposit(account1)).to.be.revertedWith(
        "Kid does not exist"
      );
    });
  });

  describe("Withdraw", async () => {
    it("Should allow kid to withdraw", async () => {
      const { cryptoKidz, account1, RELEASE_TIME, ONE_GWEI } =
        await loadFixture(deployFixture);

      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );

      await expect(
        cryptoKidz.connect(account1).deposit(account1, { value: ONE_GWEI })
      ).to.changeEtherBalances([cryptoKidz, account1], [ONE_GWEI, -ONE_GWEI]);

      const _firstKid = await cryptoKidz.kids(1);
      expect(_firstKid.amount).to.equal(ONE_GWEI);

      await time.increaseTo(RELEASE_TIME);

      await expect(
        cryptoKidz.connect(account1).withdraw(account1)
      ).to.changeEtherBalances([account1, cryptoKidz], [ONE_GWEI, -ONE_GWEI]);
    });

    it("Should throw error for kid does not exist", async () => {
      const { cryptoKidz, account1 } = await loadFixture(deployFixture);

      await expect(cryptoKidz.withdraw(account1)).to.be.revertedWith(
        "Kid does not exist"
      );
    });

    it("Should be the kid himself to withdraw", async () => {
      const { cryptoKidz, account1, RELEASE_TIME } = await loadFixture(
        deployFixture
      );
      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );
      // Still connected to the owner account
      await expect(cryptoKidz.withdraw(account1)).to.be.revertedWith(
        "Not the owner for this address"
      );
    });

    it("Should not allow kid to withdraw due to not the time yet", async () => {
      const { cryptoKidz, account1, RELEASE_TIME } = await loadFixture(
        deployFixture
      );
      await cryptoKidz.addKid(
        account1,
        "Test First Name",
        "Test Last Name",
        RELEASE_TIME
      );

      await expect(
        cryptoKidz.connect(account1).withdraw(account1)
      ).to.be.revertedWith("Kid is unable to withdraw");
    });
  });
});
