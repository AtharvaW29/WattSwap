const TransferHelper = artifacts.require("TransferHelper");
const WTSWPToken = artifacts.require("WTSWPToken");


module.exports = function (deployer) {
  // Use deployer.deployedAddresses to access deployed contract addresses
  const WTSWPTokenAddress = "0x10d2FF6a2cDd158EA21195c93061d32301093aC9";


  // Only deploy WTSWPToken if it hasn't been deployed yet
  if (!WTSWPTokenAddress) {
    deployer.deploy(WTSWPToken);
  }

  // Pass the WTSWPToken address to the TransferHelper constructor
  deployer.deploy(TransferHelper, WTSWPTokenAddress);
};
