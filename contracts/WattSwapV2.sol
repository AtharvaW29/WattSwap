// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WattSwap
 * @dev Smart contract for energy trading with USDC payments on Avalanche
 * Supports cross-chain payments via Circle CCTP and Circle Gateway
 */
contract WattSwap is ReentrancyGuard, Ownable {
    
    // ============ State Variables ============
    IERC20 public usdcToken;
    
    // Energy listing structure
    struct EnergyListing {
        address seller;
        uint256 quantity;
        uint256 pricePerUnit;
        uint256 availableQuantity;
        bool active;
        string location;
        uint256 timestamp;
    }
    
    // Energy transaction/order structure
    struct Order {
        uint256 listingId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 totalPrice;
        uint8 status; // 0: pending, 1: completed, 2: cancelled, 3: disputed
        uint256 timestamp;
        bool buyerApproved;
        bool sellerApproved;
    }
    
    // Escrow account structure
    struct EscrowAccount {
        uint256 balance;
        uint256 lockedAmount;
        mapping(uint256 => uint256) orderLocked;
    }
    
    // ============ Mappings ============
    mapping(uint256 => EnergyListing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(address => EscrowAccount) public escrowAccounts;
    mapping(address => uint256[]) public userOrders;
    mapping(address => uint256[]) public userListings;
    
    // ============ State Variables ============
    uint256 public listingCounter = 0;
    uint256 public orderCounter = 0;
    uint256 public platformFeePercentage = 2; // 2% platform fee
    address public platformFeeCollector;
    
    // ============ Events ============
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 quantity,
        uint256 pricePerUnit
    );
    
    event OrderPlaced(
        uint256 indexed orderId,
        uint256 indexed listingId,
        address indexed buyer,
        address seller,
        uint256 quantity,
        uint256 totalPrice
    );
    
    event EscrowDeposited(
        address indexed user,
        uint256 amount
    );
    
    event EscrowWithdrawn(
        address indexed user,
        uint256 amount
    );
    
    event OrderCompleted(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller
    );
    
    event OrderCancelled(
        uint256 indexed orderId
    );
    
    // ============ Modifiers ============
    modifier validUSDCAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= usdcToken.balanceOf(msg.sender), "Insufficient USDC balance");
        _;
    }
    
    // ============ Constructor ============
    /**
     * @dev Initialize WattSwap contract with USDC token address
     * @param _usdcAddress Address of USDC token on the deployed chain
     */
    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdcToken = IERC20(_usdcAddress);
        platformFeeCollector = msg.sender;
    }
    
    // ============ Escrow Functions ============
    
    /**
     * @dev Deposit USDC into escrow account
     * @param amount Amount of USDC to deposit
     */
    function depositToEscrow(uint256 amount) external validUSDCAmount(amount) nonReentrant {
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        escrowAccounts[msg.sender].balance += amount;
        emit EscrowDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw USDC from escrow account
     * @param amount Amount of USDC to withdraw
     */
    function withdrawFromEscrow(uint256 amount) external nonReentrant {
        EscrowAccount storage account = escrowAccounts[msg.sender];
        uint256 availableBalance = account.balance - account.lockedAmount;
        
        require(amount <= availableBalance, "Insufficient available balance");
        require(amount > 0, "Amount must be greater than 0");
        
        account.balance -= amount;
        
        require(
            usdcToken.transfer(msg.sender, amount),
            "USDC transfer failed"
        );
        
        emit EscrowWithdrawn(msg.sender, amount);
    }
    
    // ============ Listing Functions ============
    
    /**
     * @dev Create energy listing
     * @param quantity Amount of energy available (in units)
     * @param pricePerUnit Price per unit in USDC (with 6 decimals)
     * @param location Physical location of the energy source
     */
    function createListing(
        uint256 quantity,
        uint256 pricePerUnit,
        string memory location
    ) external returns (uint256) {
        require(quantity > 0, "Quantity must be greater than 0");
        require(pricePerUnit > 0, "Price must be greater than 0");
        
        uint256 listingId = listingCounter++;
        
        listings[listingId] = EnergyListing({
            seller: msg.sender,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            availableQuantity: quantity,
            active: true,
            location: location,
            timestamp: block.timestamp
        });
        
        userListings[msg.sender].push(listingId);
        
        emit ListingCreated(listingId, msg.sender, quantity, pricePerUnit);
        return listingId;
    }
    
    /**
     * @dev Update listing
     */
    function updateListing(
        uint256 listingId,
        uint256 newQuantity,
        uint256 newPrice
    ) external {
        EnergyListing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Only seller can update listing");
        require(listing.active, "Listing is not active");
        
        listing.quantity = newQuantity;
        listing.availableQuantity = newQuantity;
        listing.pricePerUnit = newPrice;
    }
    
    /**
     * @dev Deactivate listing
     */
    function deactivateListing(uint256 listingId) external {
        EnergyListing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Only seller can deactivate listing");
        listing.active = false;
    }
    
    // ============ Order Functions ============
    
    /**
     * @dev Place energy order with USDC payment
     * @param listingId ID of the energy listing
     * @param quantity Amount of energy to purchase
     */
    function placeOrder(uint256 listingId, uint256 quantity) external nonReentrant returns (uint256) {
        EnergyListing storage listing = listings[listingId];
        require(listing.active, "Listing is not active");
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= listing.availableQuantity, "Insufficient available quantity");
        
        address seller = listing.seller;
        require(seller != msg.sender, "Cannot buy from yourself");
        
        // Calculate total price with platform fee
        uint256 totalPrice = (quantity * listing.pricePerUnit) / 1e6;
        uint256 platformFee = (totalPrice * platformFeePercentage) / 100;
        uint256 sellerAmount = totalPrice - platformFee;
        
        // Lock funds in escrow
        EscrowAccount storage buyerEscrow = escrowAccounts[msg.sender];
        require(buyerEscrow.balance >= totalPrice, "Insufficient escrow balance");
        
        uint256 orderId = orderCounter++;
        
        orders[orderId] = Order({
            listingId: listingId,
            buyer: msg.sender,
            seller: seller,
            quantity: quantity,
            totalPrice: totalPrice,
            status: 0, // pending
            timestamp: block.timestamp,
            buyerApproved: false,
            sellerApproved: false
        });
        
        // Lock funds
        buyerEscrow.lockedAmount += totalPrice;
        buyerEscrow.orderLocked[orderId] = totalPrice;
        
        // Update listing availability
        listing.availableQuantity -= quantity;
        
        // Add order to user orders
        userOrders[msg.sender].push(orderId);
        userOrders[seller].push(orderId);
        
        emit OrderPlaced(orderId, listingId, msg.sender, seller, quantity, totalPrice);
        return orderId;
    }
    
    /**
     * @dev Approve order completion by buyer
     * @param orderId ID of the order
     */
    function approveOrderByBuyer(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "Only buyer can approve");
        require(order.status == 0, "Order is not pending");
        
        order.buyerApproved = true;
        
        // Complete order if both parties approved
        if (order.sellerApproved) {
            _completeOrder(orderId);
        }
    }
    
    /**
     * @dev Approve order completion by seller
     * @param orderId ID of the order
     */
    function approveOrderBySeller(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.seller == msg.sender, "Only seller can approve");
        require(order.status == 0, "Order is not pending");
        
        order.sellerApproved = true;
        
        // Complete order if both parties approved
        if (order.buyerApproved) {
            _completeOrder(orderId);
        }
    }
    
    /**
     * @dev Internal function to complete order and distribute USDC
     */
    function _completeOrder(uint256 orderId) internal {
        Order storage order = orders[orderId];
        
        uint256 totalPrice = order.totalPrice;
        uint256 platformFee = (totalPrice * platformFeePercentage) / 100;
        uint256 sellerAmount = totalPrice - platformFee;
        
        // Release funds from escrow
        EscrowAccount storage buyerEscrow = escrowAccounts[order.buyer];
        buyerEscrow.lockedAmount -= totalPrice;
        buyerEscrow.balance -= totalPrice;
        buyerEscrow.orderLocked[orderId] = 0;
        
        // Credit seller escrow
        escrowAccounts[order.seller].balance += sellerAmount;
        
        // Transfer platform fee to collector
        escrowAccounts[platformFeeCollector].balance += platformFee;
        
        order.status = 1; // completed
        
        emit OrderCompleted(orderId, order.buyer, order.seller);
    }
    
    /**
     * @dev Cancel order
     * @param orderId ID of the order to cancel
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(
            order.buyer == msg.sender || order.seller == msg.sender,
            "Only buyer or seller can cancel"
        );
        require(order.status == 0, "Order cannot be cancelled");
        
        // Release locked funds back to buyer
        EscrowAccount storage buyerEscrow = escrowAccounts[order.buyer];
        uint256 lockedAmount = buyerEscrow.orderLocked[orderId];
        
        buyerEscrow.lockedAmount -= lockedAmount;
        buyerEscrow.orderLocked[orderId] = 0;
        
        // Restore listing availability
        listings[order.listingId].availableQuantity += order.quantity;
        
        order.status = 2; // cancelled
        
        emit OrderCancelled(orderId);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get escrow balance for user
     */
    function getEscrowBalance(address user) external view returns (uint256 available, uint256 locked) {
        EscrowAccount storage account = escrowAccounts[user];
        available = account.balance - account.lockedAmount;
        locked = account.lockedAmount;
    }
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 listingId) external view returns (EnergyListing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Get order details
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
    
    /**
     * @dev Get user listings
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    /**
     * @dev Get user orders
     */
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update platform fee percentage
     */
    function setPlatformFeePercentage(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 100, "Fee cannot exceed 100%");
        platformFeePercentage = newPercentage;
    }
    
    /**
     * @dev Update platform fee collector address
     */
    function setPlatformFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        platformFeeCollector = newCollector;
    }
}
