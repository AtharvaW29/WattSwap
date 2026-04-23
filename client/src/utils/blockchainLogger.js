/**
 * Blockchain Debugging Logger
 * Logs provider, chain, signer, and contract details for troubleshooting
 */

export const BlockchainLogger = {
  log: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = `[BLOCKCHAIN ${timestamp}]`;
    console.log(`${prefix} ${message}`, data || '');
  },

  logProviderInfo: async (provider, label = 'Provider') => {
    try {
      if (!provider) {
        BlockchainLogger.log(`⚠️  ${label} is null`);
        return;
      }
      const network = await provider.getNetwork();
      BlockchainLogger.log(`✅ ${label} Network Info:`, {
        name: network.name,
        chainId: network.chainId,
        ensAddress: network.ensAddress,
      });
    } catch (err) {
      BlockchainLogger.log(`❌ ${label} Error:`, err.message);
    }
  },

  logSignerInfo: async (signer, label = 'Signer') => {
    try {
      if (!signer) {
        BlockchainLogger.log(`⚠️  ${label} is null`);
        return;
      }
      const address = await signer.getAddress();
      BlockchainLogger.log(`✅ ${label} Address:`, address);
    } catch (err) {
      BlockchainLogger.log(`❌ ${label} Error:`, err.message);
    }
  },

  logContractInfo: (contract, address, methodNames = [], label = 'Contract') => {
    try {
      if (!contract) {
        BlockchainLogger.log(`⚠️  ${label} instance is null`);
        return;
      }
      BlockchainLogger.log(`✅ ${label} Info:`, {
        address,
        methods: methodNames.length > 0 ? methodNames : 'See ABI in contract instance',
      });
    } catch (err) {
      BlockchainLogger.log(`❌ ${label} Error:`, err.message);
    }
  },

  logError: (context, error) => {
    BlockchainLogger.log(`❌ ERROR in ${context}:`, {
      message: error.message,
      code: error.code,
      reason: error.reason,
      stack: error.stack ? error.stack.split('\n').slice(0, 3) : 'N/A',
    });
  },
};

export default BlockchainLogger;
