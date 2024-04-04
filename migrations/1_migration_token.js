const WTSWPToken = artifacts.require("WTSWPToken");

module.exports = function(deployer, network) {
  // Change initial supply as needed
  const initialSupply = 100000000; // 100 million tokens

  deployer.deploy(WTSWPToken, initialSupply);
};
