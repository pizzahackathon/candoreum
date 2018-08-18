import Web3 from 'web3'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const ISSUE_CANDY_COMMAND = '/home/pi/run.sh'
const RECEIVER_ADDRESS = '0x7357c4eb39e8e7c4d66635e2d76b343be759c88b'


// Issue candy command
async function issueCandy() {
  const { stdout, stderr } = await exec(ISSUE_CANDY_COMMAND)
  console.log('stdout:', stdout)
  console.log('stderr:', stderr)
}

// Initial web3
const web3 = new Web3('wss://ropsten.infura.io/_ws')

// Subsribe to pending transaciton
var subscription = web3.eth.subscribe('pendingTransactions')
.on("data", transaction => {
	web3.eth.getTransaction(transaction).then(result => { 
    if (typeof result === 'undefined' || result == null || typeof result.to === 'undefined' || result.to === null) {
      return
    }

    // Watch on incoming ether to 0x950807aeaccb5e66dc09e9f99a7d559a880d8b14
		if (result.to.toLocaleLowerCase() === RECEIVER_ADDRESS.toLocaleLowerCase()) {
      console.log('from: ' + result.from + ' to: ' + result.to + ' tx: ' + transaction)
      issueCandy()
    }
  })
})

console.log('hello world')
