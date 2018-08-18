import Web3 from 'web3'
const util = require('util')
const exec = util.promisify(require('child_process').exec)
ISSUE_CANDY_COMMAND = '/home/pi/run.sh'


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
		if (result.to.toLocaleLowerCase() === '0x950807aeaccb5e66dc09e9f99a7d559a880d8b14'.toLocaleLowerCase()) {
      console.log('transaction: ' + transaction + ', to: ' + result.to)
      issueCandy()
    }
  })
})

console.log('hello world')
