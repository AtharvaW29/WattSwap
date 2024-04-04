const energyAvailability = artifacts.require("energyAvailability");

module.exports = function(deployer, network) {
  deployer.deploy(energyAvailability);
};
