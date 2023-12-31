// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./ERC20Mock.sol";


contract FarmingYield is Ownable {
    using SafeMath for uint256;
    // token addresses
    IERC20 public stakingToken;
    ERC20Mock public rewardToken1;
    ERC20Mock public rewardToken2;

    // fee percent
    uint256 public depositFee;
    //  total Staked amount
    uint256 public totalStaked;
    // staker can withdraw after locked period
    uint256 public lockPeriod = 30 days;
    //reward tokens created per block
    uint256 public reward1PerBlock;
    // depositFee will be send to treasury address.
    address public treasury;

    uint256 public lastRewardBlock;
    uint256 public accReward1PerShare;

    struct FundInfo {
        uint256 amount;
        uint256 timestamps;
    }

    struct UserInfo {
        uint256 amount; // How many staking tokens the user has provided.
        uint256 unLockAmount;
        // Reward debt.
        uint256 reward1Debt;
        FundInfo[] fundInfo;
    }

    mapping(address => UserInfo) public userInfo;
    mapping(address => uint256) public lockIndex;
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Claim(address indexed user, uint256 amount1);

    constructor(
        IERC20 _stakingToken,
        ERC20Mock _rewardToken1,
        uint256 _depositFee,
        address _treasury,
        uint256 _reward1PerBlock,
        uint256 _lockPeriod
    ) {
        stakingToken = _stakingToken;
        rewardToken1 = _rewardToken1;
        depositFee = _depositFee;
        treasury = _treasury;
        reward1PerBlock = _reward1PerBlock;
        lastRewardBlock = block.number;
        accReward1PerShare = 0;
        lockPeriod = _lockPeriod;
    }

    function update() public {
        uint256 stakingSupply = stakingToken.balanceOf(address(this));

        if (stakingSupply == 0) {
            lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = block.number - lastRewardBlock;
        uint256 reward1 = multiplier * reward1PerBlock;

        rewardToken1.mint(address(this), reward1);
        accReward1PerShare =
            accReward1PerShare +
            (reward1 * 1e12) /
            stakingSupply;
        lastRewardBlock = block.number;
    }

    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        UserInfo storage user = userInfo[msg.sender];
        update();

        if (user.amount > 0) {
            (uint256 pendingReward1) = pendingReward(
                msg.sender
            );
            rewardToken1.transfer(treasury, (pendingReward1 * 10) / 100);
            rewardToken1.transfer(
                msg.sender,
                pendingReward1 - (pendingReward1 * 10) / 100
            );
        }

        uint256 fee = (amount * depositFee) / 100;
        uint256 netAmount = amount - fee;
        stakingToken.transferFrom(msg.sender, address(this), amount);

        stakingToken.transfer(treasury, fee);

        user.amount = user.amount + netAmount;
        user.reward1Debt = (user.amount * accReward1PerShare) / 1e12;
        user.fundInfo.push(FundInfo(netAmount, block.timestamp));
        emit Deposit(msg.sender, netAmount);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        UserInfo storage user = userInfo[msg.sender];
        (, uint withdrawableAmount) = getFundInfo(msg.sender);
        require(
            amount <= withdrawableAmount,
            "Amount must be less than withdrawable amount"
        );

        update();
        (uint256 pendingReward1) = pendingReward(
            msg.sender
        );
        rewardToken1.transfer(treasury, (pendingReward1 * 10) / 100);
        rewardToken1.transfer(
            msg.sender,
            pendingReward1 - (pendingReward1 * 10) / 100
        );

        user.amount = user.amount - amount;
        user.unLockAmount -= amount;
        user.reward1Debt = (user.amount * accReward1PerShare) / 1e12;
        stakingToken.transfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, amount);
    }

    function claim() public {
        UserInfo storage user = userInfo[msg.sender];
        update();
        (uint256 pendingReward1) = pendingReward(
            msg.sender
        );
        //send pending amount
        rewardToken1.transfer(treasury, (pendingReward1 * 10) / 100);
        pendingReward1 = pendingReward1 - (pendingReward1 * 10) / 100;
        rewardToken1.transfer(msg.sender, pendingReward1);

        user.reward1Debt = (user.amount * accReward1PerShare) / 1e12;
        emit Claim(msg.sender, pendingReward1);
    }

    function getFundInfo(address _user) public returns (uint256, uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 i;
        for (i = lockIndex[_user]; i < user.fundInfo.length; i++) {
            uint256 elapsedTime = block.timestamp - user.fundInfo[i].timestamps;
            if (elapsedTime >= lockPeriod)
                user.unLockAmount += user.fundInfo[i].amount;
            else {
                lockIndex[_user] = i;
                break;
            }
        }
        if (i == user.fundInfo.length) lockIndex[_user] = i;
        return (user.amount - user.unLockAmount, user.unLockAmount);
    }

    function pendingReward(
        address _user
    ) public view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        return (
            (user.amount * accReward1PerShare) / 1e12 - user.reward1Debt
        );
    }
}
