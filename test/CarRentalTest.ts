import { expect } from "chai";
import { ethers } from "hardhat";

describe("CarRental Contract", function () {
    const rentalPrice = ethers.parseEther("0.01"); // Rent price 0.01 ETH ~ $30

    async function deployContractsFixture() {
        const MockOracleFactory = await ethers.getContractFactory("MockCarUnlockOracle");
        const mockOracle = await MockOracleFactory.deploy("18", "1000");

        const CarRentalFactory = await ethers.getContractFactory("CarRental");
        const oracleAddress = await mockOracle.getAddress();
        const initialRentalPrice = rentalPrice;
        const carRental = await CarRentalFactory.deploy(initialRentalPrice, oracleAddress);

        return { mockOracle, carRental };
    }

    it("should initialize the contract with the correct values", async function () {
        const { mockOracle, carRental } = await deployContractsFixture();
        const oracleAddress = await mockOracle.getAddress()
        expect(await carRental.rentalPrice()).to.equal(rentalPrice);
        expect(await carRental.oracle()).to.equal(oracleAddress);
    });

    it("should refuse rent without sufficient funds", async function () {
        const [owner, renter] = await ethers.getSigners();

        const { carRental } = await deployContractsFixture();

        // Renter without funds
        await ethers.provider.send("hardhat_setBalance", [
            renter.address,
            ethers.toBeHex(ethers.parseEther("0.005")), // Less than rentalPrice (0.01 ETH)
        ]);

        // Try to rent car, expect failure
        await expect(
            carRental.connect(renter).rentCar({ value: rentalPrice })
        ).to.eventually.be.rejected;
    });

    it("should emit an event and unlock the car after payment", async function () {
        const { mockOracle, carRental } = await deployContractsFixture();
        const [owner, renter] = await ethers.getSigners();

        // renter has enough money
        await ethers.provider.send("hardhat_setBalance", [
            renter.address,
            ethers.toBeHex(ethers.parseEther("1.0")),
        ]);

        await expect(carRental.connect(renter).rentCar({ value: rentalPrice }))
            .to.emit(carRental, "PaymentReceived")
            .withArgs(renter, rentalPrice)
            .to.emit(carRental, "CarUnlocked")
            .withArgs(renter);

        // Check that the car is unlocked
        expect(await carRental.carUnlocked()).to.be.true;

        // Check if the unlock command was sent
        const unlockEvent = await mockOracle.queryFilter(mockOracle.filters.UnlockCommandReceived(renter));
        expect(unlockEvent.length).to.equal(1);
    });

    it("should allow the owner to withdraw funds", async function () {
        const { carRental } = await deployContractsFixture();
        const [owner, renter] = await ethers.getSigners();

        // Before the withdraw
        const initialOwnerBalance = await ethers.provider.getBalance(owner);

        // Car was rented
        await ethers.provider.send("hardhat_setBalance", [
            renter.address,
            ethers.toBeHex(ethers.parseEther("1.0")),
        ]);

        await expect(carRental.connect(renter).rentCar({ value: rentalPrice }))
            .to.emit(carRental, "PaymentReceived")
            .withArgs(renter, rentalPrice)

        // Owner withdraws funds
        await carRental.connect(owner).withdraw();

        const finalOwnerBalance = await ethers.provider.getBalance(owner);
        expect(finalOwnerBalance).to.be.above(initialOwnerBalance);
    });
});
