var WattSwapToken = artifacts.require("WattSwapToken");

module.exports = function(deployer) {
  deployer.deploy(WattSwapToken);
}

