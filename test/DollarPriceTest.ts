import { expect } from "chai";
import { ethers } from "hardhat";

// npx hardhat test test/OracleTest
describe("DollarPriceTest", function () {
    async function deployContractsFixture() {
        const MockOracleFactory = await ethers.getContractFactory("MockV3Aggregator");
        const mockOracle = await MockOracleFactory.deploy(
            "18", // decimals
            "607"// initialAnswer 1 USD = 6.07 BRL
        );

        const PriceConsumerFactory = await ethers.getContractFactory("DollarPriceConsumer");
        const address = await mockOracle.getAddress();
        const priceConsumer = await PriceConsumerFactory.deploy(address);

        return { mockOracle, priceConsumer };
    }

    it("get oracle initial answer", async function () {
        const { priceConsumer } = await deployContractsFixture();
        const dollarPrice = await priceConsumer.getLatestDollarPrice();
        expect(Number(dollarPrice)).to.equal(607);
    });

    it("change mock data and get new oracle answer", async function () {
        const { mockOracle, priceConsumer } = await deployContractsFixture();
        await mockOracle.updateAnswer("700");
        const dollarPrice = await priceConsumer.getLatestDollarPrice();
        expect(Number(dollarPrice)).to.equal(700);
    });
})