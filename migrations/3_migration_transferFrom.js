const TransferHelper = artifacts.require("TransferHelper");
const WTSWPToken = artifacts.require("WTSWPToken");


module.exports = function (deployer) {
  // Use deployer.deployedAddresses to access deployed contract addresses
  const WTSWPTokenAddress = "0x9194055AD6a3caD31EE938DEcb85852A81bE092f";


  // Only deploy WTSWPToken if it hasn't been deployed yet
  if (!WTSWPTokenAddress) {
    deployer.deploy(WTSWPToken);
  }

  // Pass the WTSWPToken address to the TransferHelper constructor
  deployer.deploy(TransferHelper, WTSWPTokenAddress);
};
