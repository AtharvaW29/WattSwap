import { Connect, SimpleSigner } from 'uport-connect'

// Connect to the uPort application.
export let uport = new Connect('Peer-To-Peer Energy Trading', {
  clientId: '',
  network: 'ganache',
  signer: SimpleSigner('')
})

// Web3 Ethereum JavaScript API.
export const web3 = uport.getWeb3()