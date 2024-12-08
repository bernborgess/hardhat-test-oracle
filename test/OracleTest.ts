import { expect } from "chai";
import { ethers } from "hardhat";

// npx hardhat test test/OracleTest
describe("TestOracle", function () {
    async function deployContractsFixture() {
        const MockOracleFactory = await ethers.getContractFactory("MockV3Aggregator");
        const mockOracle = await MockOracleFactory.deploy(
            "18", // decimals
            "1000"// initialAnswer
        );

        const PriceConsumerFactory = await ethers.getContractFactory("PriceConsumerV3");
        const address = await mockOracle.getAddress();
        const priceConsumer = await PriceConsumerFactory.deploy(address);

        return { mockOracle, priceConsumer };
    }

    it("get oracle initial answer", async function () {
        const { priceConsumer } = await deployContractsFixture();
        const answer = await priceConsumer.getLatestPrice();
        expect(Number(answer)).to.equal(1000);
    });

    it("change mock data and get new oracle answer", async function () {
        const { mockOracle, priceConsumer } = await deployContractsFixture();
        await mockOracle.updateAnswer("2000");
        const answer = await priceConsumer.getLatestPrice();
        expect(Number(answer)).to.equal(2000);
    });
})