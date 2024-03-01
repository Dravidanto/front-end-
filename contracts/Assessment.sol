// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    uint256[12] public monthlyExpenses; // Array to store monthly expenses

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    // Function to analyze and store monthly expenses
    function analyzeExpenses(uint8 _month, uint256 _expense) public {
        require(_month >= 1 && _month <= 12, "Invalid month"); // Month should be between 1 and 12
        monthlyExpenses[_month - 1] = _expense; // Store the expense for the specified month
    }

    // Function to print the expenses of each month in text form
    function printMonthlyExpenses() public view returns (string memory) {
        string memory result;
        for (uint8 i = 0; i < 12; i++) {
            result = string(abi.encodePacked(result, getMonthName(i + 1), ": $", toString(monthlyExpenses[i]), "<br/>"));
        }
        return result;
    }

    // Internal function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        // Convert uint to string
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Internal function to get the name of the month from its number
    function getMonthName(uint8 _month) internal pure returns (string memory) {
        require(_month >= 1 && _month <= 12, "Invalid month"); // Month should be between 1 and 12
        string[12] memory months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[_month - 1];
    }
}
