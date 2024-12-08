// import { expect } from "chai";
import { ethers } from "hardhat";


describe("TestOracle", function () {
    async function deployContractsFixture() {
        //deploy mock oracle
        const MockOracle = await ethers.getContractFactory("MockV3Aggregator");
        const mockOracle = await MockOracle.deploy(
            "18", // decimals
            "1000"// initialAnswer
        );

        const PriceConsumer = await ethers.getContractFactory("PriceConsumerV3");
        const address = await mockOracle.getAddress();
        const priceConsumer = await PriceConsumer.deploy(address);

        return { mockOracle, priceConsumer };
    }

    it("get oracle initial answer", async function () {
        const { mockOracle, priceConsumer } = await deployContractsFixture();
        const answer = await priceConsumer.getLatestPrice();
        console.log(answer);
    });
})