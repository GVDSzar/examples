const xar = require('@xar-network/javascript-sdk')

/* make sure the address from the mnemonic has balances, or the case will failed */
const root_mnemonic = ""
const nominee_mnemonic = ""
const issuer_mnemonic = ""
const oracle_mnemonic = ""
const RPC_URL = ""

/* testnet setup variables these should be keys - can be the same key */

const root = ""
const nominee = ""
const oracle = ""
const issuer = ""

const getClient = async (mnemonic) => {
  const client = new xar(RPC_URL)
  await client.initChain()
  const privateKey = xar.crypto.getPrivateKeyFromMnemonic(mnemonic)
  await client.setPrivateKey(privateKey)
  // use default delegates (signing, broadcast)
  client.useDefaultSigningDelegate()
  client.useDefaultBroadcastDelegate()
  return client
}

//setupEmptyTestnet(root_mnemonic)
//setupTokens(nominee_mnemonic)
//setupOracles(nominee_mnemonic)
//testTokens(issuer_mnemonic)
//postPrice(oracle_mnemonic)

manageCSDT(root_mnemonic)

async function manageCSDT(mnemonic) {
  const client = await getClient(mnemonic)

  res = await client.getCSDT("xar1ye5yutzp4c7hnnlyfu424r08l6dg9fp97g86eh","uftm")
  console.log(res.result.result)

  msg = client.CSDT.depositCollateral(root, "uftm", "1000000")
  res = await client.sendTx(msg, root)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)

  res = await client.getCSDT("xar1ye5yutzp4c7hnnlyfu424r08l6dg9fp97g86eh","uftm")
  console.log(res.result.result)

  msg = client.CSDT.withdrawDebt(root, "uftm", "ucsdt", "500000")
  res = await client.sendTx(msg, root)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)

  res = await client.getCSDT("xar1ye5yutzp4c7hnnlyfu424r08l6dg9fp97g86eh","uftm")
  console.log(res.result.result)

  msg = client.CSDT.settleDebt(root, "uftm", "ucsdt", "250000")
  res = await client.sendTx(msg, root)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)

  res = await client.getCSDT("xar1ye5yutzp4c7hnnlyfu424r08l6dg9fp97g86eh","uftm")
  console.log(res.result.result)

  msg = client.CSDT.withdrawCollateral(root, "uftm", "500000")
  res = await client.sendTx(msg, root)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)

  res = await client.getCSDT("xar1ye5yutzp4c7hnnlyfu424r08l6dg9fp97g86eh","uftm")
  console.log(res.result.result)

}

async function setupEmptyTestnet(mnemonic) {
  const client = await getClient(mnemonic)

  // Check that we have balances
  res = await client.getAccount(root)
  if (res.status != 200) {
    return console.log(res)
  }

  if (res.result.result.value.coins.length == 0) {
    return console.log(res)
  }
  // Send funds to each setup account
  res = await client.transfer(root, nominee, 1000000, "uftm", "nominee setup")
  if (res.status != 200) {
    return console.log(res)
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    return console.log(res)
  }

  await sleep(4000)

  res = await client.transfer(root, oracle, 1000000, "uftm", "oracle setup")
  if (res.status != 200) {
    return console.log(res)
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    return console.log(res)
  }

  await sleep(4000)

  res = await client.transfer(root, issuer, 1000000, "uftm", "issuer setup")
  if (res.status != 200) {
    return console.log(res)
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    return console.log(res)
  }

  // Create a uftm token

  // Make sure uftm token does not exist yet
  res = await client.getToken("uftm")

  if (!res.toString().includes("could not find Token for symbol")) {
    return console.log(res)
  }
}

async function setupTokens(mnemonic) {
  const client = await getClient(mnemonic)

  // Create a uftm token

  // Make sure uftm token does not exist yet
  res = await client.getToken("uftm")

  if (!res.toString().includes("could not find Token for symbol")) {
    console.log(res)
    return
  }

  msg = client.Denominations.issueToken(nominee, issuer, "Fantom", "uftm", "FTM", "1000000", "3175000000000000", true)
  res = await client.sendTx(msg, nominee)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)
  res = await client.getToken("uftm")

  if (res.toString().includes("could not find Token for symbol")) {
    console.log(res)
    return
  }
  console.log(res)

}

async function setupOracles(mnemonic) {
  const client = await getClient(mnemonic)

  // Create a uftm token

  // Make sure uftm token does not exist yet
  res = await client.getOracleAssets()
  console.log(res)

  msg = client.Oracle.addAsset(nominee, "uftm", "uftm", "uftm", "ucsdt", [{address:oracle}], true)
  res = await client.sendTx(msg, nominee)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)

  // Make sure uftm token does not exist yet
  res = await client.getOracleAssets()
  console.log(res)

}


async function postPrice(mnemonic) {
  const client = await getClient(mnemonic)

  // Create a uftm token

  // Make sure uftm token does not exist yet
  res = await client.getCurrentPrice("uftm")
  console.log(res)

  var date = new Date().getTime()
  date += (2 * 60 * 60 * 1000)

  var price = 1

  msg = client.Oracle.postPrice(oracle, "uftm", price.toFixed(18).toString(), new Date(new Date(date).toUTCString()).toISOString().replace(".000Z","Z"))
  res = await client.sendTx(msg, oracle)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)

  // Make sure uftm token does not exist yet
  res = await client.getCurrentPrice("uftm")
  console.log(res)

}


async function testTokens(mnemonic) {
  const client = await getClient(mnemonic)

  // Create a uftm token

  // Make sure uftm token does not exist yet
  res = await client.getAccount(issuer)
  if (res.status !== 200) {
    console.log(res)
    return
  }
  console.log(res.result.result.value)

  msg = client.Denominations.mintCoins(issuer, "uftm", "3000000")
  console.log(msg)
  res = await client.sendTx(msg, issuer)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)
  res = await client.getAccount(issuer)
  if (res.status !== 200) {
    console.log(res)
    return
  }
  console.log(res.result.result.value)

  msg = client.Denominations.burnCoins(issuer, "uftm", "1000000")
  console.log(msg)
  res = await client.sendTx(msg, issuer)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)
  res = await client.getAccount(issuer)
  if (res.status !== 200) {
    console.log(res)
    return
  }
  console.log(res.result.result.value)

  msg = client.Denominations.freezeCoins(issuer, "uftm", "1000000", issuer)
  console.log(msg)
  res = await client.sendTx(msg, issuer)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)
  res = await client.getAccount(issuer)
  if (res.status !== 200) {
    console.log(res)
    return
  }
  console.log(res.result.result.value)

  msg = client.Denominations.burnCoins(issuer, "uftm", "1000000")
  console.log(msg)
  res = await client.sendTx(msg, issuer)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)
  res = await client.getAccount(issuer)
  if (res.status !== 200) {
    console.log(res)
    return
  }
  console.log(res.result.result.value)

  msg = client.Denominations.unfreezeCoins(issuer, "uftm", "1000000", issuer)
  console.log(msg)
  res = await client.sendTx(msg, issuer)
  if (res.status != 200) {
    console.log(res)
    return
  }
  res = await waitForTxHash(client, res.result.txhash)
  if (!res.result.raw_log.includes("true")) {
    console.log(res)
    return
  }
  await sleep(4000)
  res = await client.getAccount(issuer)
  if (res.status !== 200) {
    console.log(res)
    return
  }
  console.log(res.result.result.value)
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function waitForTxHash (client, txhash) {
  return new Promise((resolve) => {
    client.getTx(txhash)
    .then((data) => {
      resolve(res)
    })
    .catch((err) => {
      if (err.toString().includes("not found")) {
        setTimeout(() => {
          waitForTxHash(client, txhash), 5000
        })
      }
    })
  })
}
