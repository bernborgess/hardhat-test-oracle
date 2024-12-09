// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";
import "../CarRental.sol"; // import the ICarUnlockOracle interface

contract MockCarUnlockOracle is ICarUnlockOracle, MockV3Aggregator {
    event UnlockCommandReceived(address indexed renter);

    constructor(
        uint8 _decimals,
        int256 _initialAnswer
    ) MockV3Aggregator(_decimals, _initialAnswer) {}

    // Simulate sending an unlock command to the IoT system
    function sendUnlockCommand(address renter) external override {
        emit UnlockCommandReceived(renter);
        // In a real-world scenario, this would interact with an IoT system or external service.
    }
}
