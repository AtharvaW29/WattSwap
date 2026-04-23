// test/WattSwap.test.js
// Unit tests for WattSwap V2 smart contract

const WattSwap = artifacts.require("WattSwap");
const MockUSDC = artifacts.require("MockUSDC"); // Mock USDC for testing

contract("WattSwap", accounts => {
  let wattswap;
  let usdc;
  const seller = accounts[1];
  const buyer = accounts[2];
  const owner = accounts[0];

  // Initialize contract before each test
  beforeEach(async () => {
    // Deploy mock USDC
    usdc = await MockUSDC.new();
    
    // Deploy WattSwap with mock USDC address
    wattswap = await WattSwap.new(usdc.address);

    // Mint USDC to test accounts
    await usdc.mint(seller, web3.utils.toWei('1000', 'mwei'));
    await usdc.mint(buyer, web3.utils.toWei('1000', 'mwei'));
  });

  describe("Listing Creation", () => {
    it("should create an energy listing", async () => {
      const quantity = 100;
      const pricePerUnit = web3.utils.toWei('10', 'mwei'); // 10 USDC per unit
      const location = "Solar Farm A";

      const tx = await wattswap.createListing(
        quantity,
        pricePerUnit,
        location,
        { from: seller }
      );

      assert.isTrue(tx.receipt.status, "Transaction should succeed");

      // Verify listing was created
      const listing = await wattswap.getListing(0);
      assert.equal(listing.seller, seller, "Seller should match");
      assert.equal(listing.quantity, quantity, "Quantity should match");
      assert.equal(listing.pricePerUnit, pricePerUnit, "Price should match");
      assert.equal(listing.availableQuantity, quantity, "Available quantity should equal total quantity");
      assert.equal(listing.location, location, "Location should match");
      assert.equal(listing.active, true, "Listing should be active");
    });

    it("should fail to create listing with zero quantity", async () => {
      try {
        await wattswap.createListing(0, web3.utils.toWei('10', 'mwei'), "Location", { from: seller });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Quantity must be greater than 0", "Error message should mention quantity");
      }
    });

    it("should fail to create listing with zero price", async () => {
      try {
        await wattswap.createListing(100, 0, "Location", { from: seller });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Price must be greater than 0", "Error message should mention price");
      }
    });
  });

  describe("USDC Deposit to Escrow", () => {
    it("should deposit USDC to escrow", async () => {
      const amount = web3.utils.toWei('100', 'mwei'); // 100 USDC

      // Approve USDC transfer
      await usdc.approve(wattswap.address, amount, { from: buyer });

      // Deposit to escrow
      const tx = await wattswap.depositToEscrow(amount, { from: buyer });
      assert.isTrue(tx.receipt.status, "Deposit should succeed");

      // Verify escrow balance
      const [available, locked] = await wattswap.getEscrowBalance(buyer);
      assert.equal(available.toString(), amount.toString(), "Available balance should match deposit");
      assert.equal(locked, 0, "Locked amount should be zero");
    });

    it("should fail to deposit without approval", async () => {
      const amount = web3.utils.toWei('100', 'mwei');
      
      try {
        await wattswap.depositToEscrow(amount, { from: buyer });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "transfer failed", "Error should mention transfer failure");
      }
    });

    it("should withdraw USDC from escrow", async () => {
      const depositAmount = web3.utils.toWei('100', 'mwei');
      const withdrawAmount = web3.utils.toWei('50', 'mwei');

      // Deposit first
      await usdc.approve(wattswap.address, depositAmount, { from: buyer });
      await wattswap.depositToEscrow(depositAmount, { from: buyer });

      // Withdraw
      const tx = await wattswap.withdrawFromEscrow(withdrawAmount, { from: buyer });
      assert.isTrue(tx.receipt.status, "Withdrawal should succeed");

      // Verify remaining balance
      const [available, locked] = await wattswap.getEscrowBalance(buyer);
      const expectedRemaining = (BigInt(depositAmount) - BigInt(withdrawAmount)).toString();
      assert.equal(available.toString(), expectedRemaining, "Remaining balance should be correct");
    });
  });

  describe("Order Placement", () => {
    beforeEach(async () => {
      // Create listing
      const quantity = 100;
      const pricePerUnit = web3.utils.toWei('10', 'mwei');
      await wattswap.createListing(quantity, pricePerUnit, "Test Location", { from: seller });

      // Deposit buyer funds to escrow
      const depositAmount = web3.utils.toWei('2000', 'mwei');
      await usdc.approve(wattswap.address, depositAmount, { from: buyer });
      await wattswap.depositToEscrow(depositAmount, { from: buyer });
    });

    it("should place an order", async () => {
      const listingId = 0;
      const quantity = 50;

      const tx = await wattswap.placeOrder(listingId, quantity, { from: buyer });
      assert.isTrue(tx.receipt.status, "Order placement should succeed");

      // Verify order was created
      const order = await wattswap.getOrder(0);
      assert.equal(order.buyer, buyer, "Buyer should match");
      assert.equal(order.seller, seller, "Seller should match");
      assert.equal(order.quantity, quantity, "Quantity should match");
      assert.equal(order.status, 0, "Status should be pending");
    });

    it("should fail to place order with insufficient escrow balance", async () => {
      try {
        // Try to order more than available escrow balance
        await wattswap.placeOrder(0, 300, { from: buyer });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Insufficient escrow balance", "Error should mention balance");
      }
    });

    it("should fail to place order with exceeding available quantity", async () => {
      try {
        await wattswap.placeOrder(0, 150, { from: buyer }); // Listing only has 100 units
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Insufficient available quantity", "Error should mention quantity");
      }
    });

    it("should not allow seller to buy their own listing", async () => {
      try {
        // Deposit seller funds to escrow
        const depositAmount = web3.utils.toWei('2000', 'mwei');
        await usdc.approve(wattswap.address, depositAmount, { from: seller });
        await wattswap.depositToEscrow(depositAmount, { from: seller });

        await wattswap.placeOrder(0, 50, { from: seller });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "Cannot buy from yourself", "Error should prevent self-purchase");
      }
    });
  });

  describe("Order Completion", () => {
    beforeEach(async () => {
      // Setup: Create listing and place order
      const quantity = 100;
      const pricePerUnit = web3.utils.toWei('10', 'mwei');
      await wattswap.createListing(quantity, pricePerUnit, "Test Location", { from: seller });

      const depositAmount = web3.utils.toWei('2000', 'mwei');
      await usdc.approve(wattswap.address, depositAmount, { from: buyer });
      await wattswap.depositToEscrow(depositAmount, { from: buyer });

      await wattswap.placeOrder(0, 50, { from: buyer });
    });

    it("should complete order when both parties approve", async () => {
      const orderId = 0;

      // Buyer approves
      await wattswap.approveOrderByBuyer(orderId, { from: buyer });
      let order = await wattswap.getOrder(orderId);
      assert.equal(order.buyerApproved, true, "Buyer should be marked as approved");
      assert.equal(order.status, 0, "Status should still be pending");

      // Seller approves - this should complete the order
      const tx = await wattswap.approveOrderBySeller(orderId, { from: seller });
      assert.isTrue(tx.receipt.status, "Approval should succeed");

      // Verify order is completed
      order = await wattswap.getOrder(orderId);
      assert.equal(order.status, 1, "Status should be completed");
    });

    it("should cancel order and return funds", async () => {
      const orderId = 0;
      const initialBalance = await usdc.balanceOf(buyer);

      // Cancel order
      const tx = await wattswap.cancelOrder(orderId, { from: buyer });
      assert.isTrue(tx.receipt.status, "Cancellation should succeed");

      // Verify order is cancelled
      const order = await wattswap.getOrder(orderId);
      assert.equal(order.status, 2, "Status should be cancelled");

      // Verify funds are not locked
      const [available, locked] = await wattswap.getEscrowBalance(buyer);
      assert.equal(locked, 0, "No funds should be locked");
    });
  });

  describe("Platform Fee", () => {
    it("should collect platform fee on order completion", async () => {
      const quantity = 100;
      const pricePerUnit = web3.utils.toWei('10', 'mwei');
      await wattswap.createListing(quantity, pricePerUnit, "Test Location", { from: seller });

      const depositAmount = web3.utils.toWei('2000', 'mwei');
      await usdc.approve(wattswap.address, depositAmount, { from: buyer });
      await wattswap.depositToEscrow(depositAmount, { from: buyer });

      const orderQuantity = 50;
      await wattswap.placeOrder(0, orderQuantity, { from: buyer });

      // Approve and complete order
      await wattswap.approveOrderByBuyer(0, { from: buyer });
      await wattswap.approveOrderBySeller(0, { from: seller });

      // Check that platform fee collector received funds
      const [platformBalance] = await wattswap.getEscrowBalance(owner);
      assert.isTrue(platformBalance > 0, "Platform should have collected fee");
    });

    it("should allow owner to update platform fee percentage", async () => {
      const newFeePercentage = 5;
      const tx = await wattswap.setPlatformFeePercentage(newFeePercentage, { from: owner });
      assert.isTrue(tx.receipt.status, "Fee update should succeed");
    });

    it("should prevent non-owner from updating fee", async () => {
      try {
        await wattswap.setPlatformFeePercentage(5, { from: seller });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert.include(error.message, "revert", "Should revert non-owner call");
      }
    });
  });

  describe("View Functions", () => {
    it("should return user listings", async () => {
      // Create multiple listings
      const pricePerUnit = web3.utils.toWei('10', 'mwei');
      await wattswap.createListing(100, pricePerUnit, "Location 1", { from: seller });
      await wattswap.createListing(200, pricePerUnit, "Location 2", { from: seller });

      const listings = await wattswap.getUserListings(seller);
      assert.equal(listings.length, 2, "Should return both listings");
    });

    it("should return user orders", async () => {
      // Setup and create order
      const quantity = 100;
      const pricePerUnit = web3.utils.toWei('10', 'mwei');
      await wattswap.createListing(quantity, pricePerUnit, "Test Location", { from: seller });

      const depositAmount = web3.utils.toWei('2000', 'mwei');
      await usdc.approve(wattswap.address, depositAmount, { from: buyer });
      await wattswap.depositToEscrow(depositAmount, { from: buyer });

      await wattswap.placeOrder(0, 50, { from: buyer });

      const orders = await wattswap.getUserOrders(buyer);
      assert.equal(orders.length, 1, "Should return user's order");
    });
  });
});
