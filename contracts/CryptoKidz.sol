// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CryptoKidz {
    address public owner;

    constructor() {
        owner = msg.sender;
        kids.push(Kid("", "", 0, 0));
    }

    struct Kid {
        string firstName;
        string lastName;
        uint releaseTime;
        uint amount;
    }

    mapping(address => uint) public kidIds;
    Kid[] public kids;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function addKid(
        address _walletAddress,
        string memory _firstName,
        string memory _lastName,
        uint _releaseTime
    ) public onlyOwner {
        Kid memory _kid = Kid(_firstName, _lastName, _releaseTime, 0);

        kidIds[_walletAddress] = kids.length;
        kids.push(_kid);
    }

    function deposit(address _walletAddress) public payable {
        require(
            kidIds[_walletAddress] != 0,
            "CryptoKidz - Kid does not exist."
        );
        uint currentKidId = kidIds[_walletAddress];
        kids[currentKidId].amount += msg.value;
    }

    function availableToWithdraw(
        address _walletAddress
    ) public view returns (bool) {
        require(
            kidIds[_walletAddress] != 0,
            "CryptoKidz - Kid does not exist."
        );

        if (kids[kidIds[_walletAddress]].releaseTime <= block.timestamp) {
            return true;
        }
        return false;
    }

    function withdraw(address _walletAddress) public payable {
        require(
            kidIds[_walletAddress] != 0,
            "CryptoKidz - Kid does not exist."
        );
        require(
            msg.sender == _walletAddress,
            "CryptoKidz - You must be the owner of this account to withdraw."
        );
        require(
            availableToWithdraw(_walletAddress) == true,
            "CryptoKidz - Kid is unable to withdraw."
        );

        uint currentKidId = kidIds[_walletAddress];
        payable(_walletAddress).transfer(kids[currentKidId].amount);
        kids[currentKidId].amount = 0;
    }

    receive() external payable {
        // TODO
    }

    fallback() external payable {
        // TODO
    }
}
