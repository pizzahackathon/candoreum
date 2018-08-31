import Web3 from 'web3'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const ISSUE_CANDY_COMMAND = './issue_candy.sh'
const RECEIVER_ADDRESS = '0x7357c4eb39e8e7c4d66635e2d76b343be759c88b'


// Issue candy command, use IR transmit to send signal to candy machine.
async function issueCandy() {
  const { stdout, stderr } = await exec(ISSUE_CANDY_COMMAND)
  console.log('stdout:', stdout)
  console.log('stderr:', stderr)
}

// Initial web3
// const web3 = new Web3('wss://mainnet.infura.io/_ws')
// const web3 = new Web3('wss://ropsten.infura.io/_ws')
// const web3 = new Web3('wss://rinkeby.infura.io/_ws')
// const web3 = new Web3('wss://pzcethnode.afourleaf.com:28546')
const web3 = new Web3('wss://kovan.infura.io/ws')

// Subsribe to pending transaciton
var subscription = web3.eth.subscribe('pendingTransactions')
.on("data", transaction => {
  web3.eth.getTransaction(transaction).then(result => {
    // Found a new transaciton
    // Validate transaction info
    if (typeof result === 'undefined' || result == null || typeof result.to === 'undefined' || result.to === null) {
      return
    }

    // For debug uncomment this line
    // console.log('from: ' + result.from + ' to: ' + result.to + ' tx: ' + transaction)

    // Watch on incoming ether to RECEIVER_ADDRESS
    if (result.to.toLocaleLowerCase() === RECEIVER_ADDRESS.toLocaleLowerCase()) {
      console.log('from: ' + result.from + ' to: ' + result.to + ' tx: ' + transaction)
      issueCandy()
    }
  })
})

console.log(`Ready, feed me some ETHs to ${RECEIVER_ADDRESS}`)
