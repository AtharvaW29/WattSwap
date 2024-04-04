const BalanceViewer = artifacts.require("BalanceViewer");

module.exports = function (deployer) {
  deployer.deploy(BalanceViewer);
};
