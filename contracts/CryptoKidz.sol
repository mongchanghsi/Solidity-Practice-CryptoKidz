// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CryptoKidz {
  address private owner;

  constructor() {
    owner = msg.sender;
    kids.push(Kid("", "", 0, 0));
  }

  struct Kid {
    string firstName;
    string lastName;
    uint256 releaseTime;
    uint256 amount;
  }

  mapping(address => uint256) private kidIds;
  Kid[] private kids;

  modifier onlyOwner() {
    require(msg.sender == owner, "Only contract owner can call");
    _;
  }

  function addKid(
    address _walletAddress,
    string memory _firstName,
    string memory _lastName,
    uint256 _releaseTime
  ) public onlyOwner {
    Kid memory _kid = Kid(_firstName, _lastName, _releaseTime, 0);

    kidIds[_walletAddress] = kids.length;
    kids.push(_kid);
  }

  function deposit(address _walletAddress) public payable {
    require(kidIds[_walletAddress] != 0, "Kid does not exist");
    uint256 currentKidId = kidIds[_walletAddress];
    kids[currentKidId].amount += msg.value;
  }

  function availableToWithdraw(
    address _walletAddress
  ) public view returns (bool) {
    require(kidIds[_walletAddress] != 0, "Kid does not exist");

    if (kids[kidIds[_walletAddress]].releaseTime <= block.timestamp) {
      return true;
    }
    return false;
  }

  function withdraw(address _walletAddress) public payable {
    require(kidIds[_walletAddress] != 0, "Kid does not exist");
    require(msg.sender == _walletAddress, "Not the owner for this address");
    require(
      availableToWithdraw(_walletAddress) == true,
      "Kid is unable to withdraw"
    );

    uint256 currentKidId = kidIds[_walletAddress];
    payable(_walletAddress).transfer(kids[currentKidId].amount);
    kids[currentKidId].amount = 0;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function getKid(uint256 _id) public view returns (Kid memory) {
    return kids[_id];
  }

  function getKidIdByAddress(address _address) public view returns (uint256) {
    return kidIds[_address];
  }

  receive() external payable {
    // TODO
  }

  fallback() external payable {
    // TODO
  }
}
