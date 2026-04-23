const WattSwapV2 = artifacts.require("WattSwap");

module.exports = function(deployer, network) {
  // USDC addresses on different networks
  const usdcAddresses = {
    fuji: "0x5425890298aed601595a70ab815c96711a756003", // USDC.e on Avalanche Fuji
    avalanche: "0xB97EF9Ef8734C71904D8002F1e9bB1E1f341F8c", // USDC on Avalanche Mainnet
    development: "0x5425890298aed601595a70ab815c96711a756003" // Use Fuji address for testing
  };

  const usdcAddress = usdcAddresses[network] || usdcAddresses.development;

  console.log(`Deploying WattSwap on ${network} with USDC: ${usdcAddress}`);
  
  deployer.deploy(WattSwapV2, usdcAddress);
};
