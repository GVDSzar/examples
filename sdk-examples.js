const xar = require('@xar-network/javascript-sdk')

/* make sure the address from the mnemonic has balances, or the case will failed */
const mnemonic = "<MNEMONIC>"
const RPC_URL = "<RPC_URL>"

const getClient = async (useAwaitSetPrivateKey = true, doNotSetPrivateKey = false) => {
  const client = new xar(RPC_URL)
  await client.initChain()
  const privateKey = xar.crypto.getPrivateKeyFromMnemonic(mnemonic)
  if (!doNotSetPrivateKey) {
    if (useAwaitSetPrivateKey) {
      await client.setPrivateKey(privateKey)
    } else {
      client.setPrivateKey(privateKey) // test without `await`
    }
  }
  // use default delegates (signing, broadcast)
  client.useDefaultSigningDelegate()
  client.useDefaultBroadcastDelegate()
  return client
}

async function getTokens() {
  const client = await getClient(true)
  const res = await client.getTokens()
}

async function getToken() {
  const client = await getClient(true)
  const res = await client.getToken("uftm")
}


async function getAccount() {
  const client = await getClient(true)
  const res = await client.getAccount("xar14nh6rs0wyxl8t6rlv962dsv5sg644xj7d9h6jq")
}

async function getNodeInfo() {
  const client = await getClient(true)
  const res = await client.getNodeInfo()
}

async function getSupply() {
  const client = await getClient(true)
  const res = await client.getSupply()
}

async function getValidators() {
  const client = await getClient(true)
  const res = await client.getValidators()
}

async function getStakingParameters() {
  const client = await getClient(true)
  const res = await client.getStakingParameters()
}

async function getMintinParameters() {
  const client = await getClient(true)
  const res = await client.getMintinParameters()
}

async function getInflation() {
  const client = await getClient(true)
  const res = await client.getInflation()
}

async function getAssets() {
  const client = await getClient(true)
  const res = await client.getAssets()
}

async function getTx() {
  const client = await getClient(true)
  const res = await client.getTx("8A80D64C536B496D91FE9C1707706B2AE887F60138CD5BA9550E4D3385D998CA")
}

async function getCurrentPrice() {
  const client = await getClient(true)
  const res = await client.getCurrentPrice("uftm")
}

async function getCSDT() {
  const client = await getClient(true)
  const res = await client.getCSDT("xar1n4avxelsujq8chr7jh2qgf4gcttuxkxdv40rdj","uftm")
}

async function createOrModifyCSDT() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const collateralDenom = "uftm"
  const collateralChange = "10000"
  const debtChange = "100"

  const msg = client.CSDT.createOrModifyCSDT(fromAddress, collateralDenom, collateralChange, debtChange)
  const res = await client.sendTx(msg, fromAddress)
}

async function record() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const name = "123"
  const author = "bob"
  const hash = "e1273esa"
  const recordNo = "1"
  const recordType = "123"
  const description = "lorem ipsum"

  const msg = client.Record.record(fromAddress, name, author, hash, recordNo, recordType, description)
  const res = await client.sendTx(msg, fromAddress)
}


async function createOracle() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const oracleAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.Authority.createOracle(fromAddress, oracleAddress)
  const res = await client.sendTx(msg, fromAddress)
}

async function createMarket() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const baseAsset = "uftm"
  const quoteAsset = "ucsdt"

  const msg = client.Authority.createMarket(fromAddress, baseAsset, quoteAsset)
  const res = await client.sendTx(msg, fromAddress)
}

async function transfer() {
  const client = await getClient(false)
  const addr = crypto.getAddressFromPrivateKey(client.privateKey)
  const res = await client.transfer(addr, targetAddress, 1, "coin174876e800", "hello world")
}

async function issue() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const symbol = "MINT"
  const tokenName = "test issue token"
  const totalSupply = 21000000

  const msg = client.Issue.issue(fromAddress, tokenName, symbol, totalSupply, false)
  const res = await client.sendTx(msg, fromAddress)
}

async function mint() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const to = "xar13jnw7klahe60tzu70a8mwg5qcf8444uwha9tma"
  const symbol = "coin174876e800"
  const amount = 10000000

  const msg = client.Issue.mint(fromAddress, symbol, amount, to)
  const res = await client.sendTx(msg, fromAddress)
}

async function burn() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"
  const symbol = "coin174876e800"
  const amount = 10000

  const msg = client.Issue.burn(fromAddress, symbol, amount)
  const res = await client.sendTx(msg, fromAddress)
}

async function createAccount() {
  const client = await getClient(false)
  const res = client.createAccount()
}

async function createAccountWithKeystore() {
  const client = await getClient(false, true)
  const res = client.createAccountWithKeystore("12345678")
}

async function createAccountWithMneomnic() {
  const client = await getClient(false)
  const res = client.createAccountWithMneomnic()
}

async function recoverAccountFromMneomnic() {
  jest.setTimeout(50000)
  const client = await getClient(false)
  const res = client.recoverAccountFromMneomnic(mnemonic)
}

async function recoverAccountFromPrivateKey() {
  jest.setTimeout(50000)
  const client = await getClient(false)
  const pk = crypto.generatePrivateKey()
  const res = client.recoverAccountFromPrivateKey(pk)
}

async function getCSDTParameters() {
  const client = await getClient(true)
  const res = await client.getCSDTParameters()
}

async function getOracleAssets() {
  const client = await getClient(true)
  const res = await client.getOracleAssets()
  try {
    console.log(JSON.stringify(res))
  } catch (err) {

  }
}

async function depositCollateral() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.CSDT.depositCollateral(fromAddress, "tst", "1000000")
  const res = await client.sendTx(msg, fromAddress)
}

async function withdrawCollateral() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.CSDT.withdrawCollateral(fromAddress, "tst", "1000000")
  const res = await client.sendTx(msg, fromAddress)
}

async function settleDebt() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.CSDT.settleDebt(fromAddress, "tst", "csdt", "1000000")
  const res = await client.sendTx(msg, fromAddress)
}

async function withdrawDebt() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.CSDT.withdrawDebt(fromAddress, "tst", "csdt", "1000000")
  const res = await client.sendTx(msg, fromAddress)
}

async function postPrice() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.Oracle.postPrice(fromAddress, "tst", "0.1", "10000")
  const res = await client.sendTx(msg, fromAddress)
}

async function addOracle() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.Oracle.addOracle(fromAddress, fromAddress, "tst")
  const res = await client.sendTx(msg, fromAddress)
}

async function setOracles() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.Oracle.setOracles(fromAddress, [{address:fromAddress}], "tst")
  const res = await client.sendTx(msg, fromAddress)
}

async function setAsset() {
  const client = await getClient(true)
  const fromAddress = "xar13slrtrkn4hmhu88nlzhnk5s36t54wsugkvttg5"

  const msg = client.Oracle.setAsset(fromAddress, "tst", "tst", "tst", "zar", [{address:fromAddress}], true)
  const res = await client.sendTx(msg, fromAddress)
}
