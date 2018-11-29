import Web3 from 'web3'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const ISSUE_CANDY_COMMAND = './issue_candy.sh'
const RECEIVER_ADDRESS = '0x7357c4eb39e8e7c4d66635e2d76b343be759c88b'

const enableERC20Receiver = true

let erc20 = null
const erc20Address = '0x10be9de395276482721e102de303316a384c0c9b'
let latestFetchBlockHeight = 3397268
const erc20Abi = require('./erc20abi.json')

// Initial web3
// const web3 = new Web3('wss://mainnet.infura.io/_ws')
// const web3 = new Web3('wss://ropsten.infura.io/_ws')
// const web3 = new Web3('wss://rinkeby.infura.io/_ws')
const web3 = new Web3('wss://kovan.infura.io/ws')
// const web3 = new Web3('https://public-node.testnet.rsk.co/')

// Issue candy command, use IR transmit to send signal to candy machine.
async function issueCandy() {
  const { stdout, stderr } = await exec(ISSUE_CANDY_COMMAND)
  console.log('stdout:', stdout)
  console.log('stderr:', stderr)
}

async function startCheckingERC20 () {
  let currentBlockHeight = await web3.eth.getBlockNumber()
  latestFetchBlockHeight = currentBlockHeight - 1
  checkReceiveNewERC20()
}

async function checkReceiveNewERC20 () {
  let currentBlockHeight = await web3.eth.getBlockNumber()

  // No need to fetch when no new block
  if (latestFetchBlockHeight + 1 > currentBlockHeight) {
    setTimeout(() => {
      checkReceiveNewERC20()
    }, 1000)
  } else {
    erc20.getPastEvents('Transfer', {
      filter: {
        to: '0x7357c4eb39e8e7c4d66635e2d76b343be759c88b'
      },
      fromBlock: latestFetchBlockHeight + 1,
      toBlock: currentBlockHeight
    }).then(events => {
      // Received ERC20 from new blocks
      console.log(`found ${events.length} txs in blocks ${latestFetchBlockHeight} - ${currentBlockHeight}`) // same results as the optional callback above

      // issue candy if any payment found
      if (events.length >= 1) {
        issueCandy()
      }

      latestFetchBlockHeight = currentBlockHeight
      setTimeout(() => {
        checkReceiveNewERC20()
      }, 1000)
    })
  }
}

// Accept ERC20
if (enableERC20Receiver) {
  erc20 = new web3.eth.Contract(erc20Abi, erc20Address)
  console.log(`Ready, feed me some ERC20 to ${RECEIVER_ADDRESS}`)
  startCheckingERC20()

// Accept eth
} else {
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
}
