// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConsumerV3.sol";

interface ICarUnlockOracle {
    function sendUnlockCommand(address renter) external;
}

contract CarRental {
    address public owner;
    uint256 public rentalPrice;
    address public oracle;
    bool public carUnlocked;

    event PaymentReceived(address indexed payer, uint256 amount);
    event CarUnlocked(address indexed renter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(uint256 _rentalPrice, address _oracle) {
        owner = msg.sender;
        rentalPrice = _rentalPrice;
        oracle = _oracle;
        carUnlocked = false;
    }

    // Function to make payment for renting the car
    function rentCar() external payable {
        require(msg.value >= rentalPrice, "Insufficient payment");
        emit PaymentReceived(msg.sender, msg.value);

        // Simulate interaction with the oracle to unlock the car
        unlockCar();
    }

    // Internal function that calls the oracle to unlock the car
    function unlockCar() internal {
        // Call the oracle to unlock the car
        ICarUnlockOracle(oracle).sendUnlockCommand(msg.sender);

        // Set the car to unlocked
        carUnlocked = true;

        // Emit event
        emit CarUnlocked(msg.sender);
    }

    // Function to withdraw funds by the owner
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
