
const ecc = require("tiny-secp256k1")
const hexEncoding = require("crypto-js/enc-hex")
const SHA256 = require("crypto-js/sha256")
const request = require('request')
const axios = require('axios')
const EC = require('elliptic').ec;
const CURVE = "secp256k1"

const PRIVATEKEY = '<ACCOUNT_PRIVATE_KEY>'
const account = "xar1hkc7l5jmsmrmsmsre7qsatrx5wjgan942c77ac"
const CoinMarketCap = require('coinmarketcap-api')
const RPC_URL = "<NODE_RPC_URL>"
const CHAIN_ID = "xar-chain-dora"

const apiKey = '<COINMARKETCAP_API_KEY>'
const client = new CoinMarketCap(apiKey)

setInterval(getPrice, 60000)



const generatePubKey = privateKey => {
  const curve = new EC(CURVE)
  const keypair = curve.keyFromPrivate(privateKey)
  const pubKeyHex = keypair.getPublic(true, 'hex')
  return {type:"tendermint/PubKeySecp256k1",value:Buffer.from(pubKeyHex, 'hex').toString('base64')}
}

function getPrice() {
  client.getQuotes({symbol: 'FTM'}).then(function (data) {
    price = data.data.FTM.quote.USD.price
    postPrice(price)
  }).catch(console.error)
}

const sortObject = obj => {
  if (obj === null) return null
  if (typeof obj !== "object") return obj
  // arrays have typeof "object" in js!
  if (Array.isArray(obj))
    return obj.map(sortObject)
  const sortedKeys = Object.keys(obj).sort()
  const result = {}
  sortedKeys.forEach(key => {
    result[key] = sortObject(obj[key])
  })
  return result
}
const sha256 = (hex) => {
  if (typeof hex !== "string") throw new Error("sha256 expects a hex string")
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`)
  const hexEncoded = hexEncoding.parse(hex)
  return SHA256(hexEncoded).toString()
}
const generateSignature = (signBytesHex, privateKey) => {
  const msgHash = sha256(signBytesHex)
  const msgHashHex = Buffer.from(msgHash, "hex")
  const signature = ecc.sign(msgHashHex, Buffer.from(privateKey, "hex")) // enc ignored if buffer
  return signature.toString("base64")
}

function serialize(tx) {
  if (!tx.signatures) {
    throw new Error("need signature")
  }

  let msg = tx.msgs[0]

  const stdTx = {
    tx: {
      msg: [msg],
      signatures: tx.signatures,
      memo: tx.memo,
      type: tx.type,
      fee: {
        amount: [],
        gas: "200000"
      }
    },
    mode: tx.mode,
  }

  return JSON.stringify(stdTx)
}

function sendTransaction(signedTx) {
  const signedBz = serialize(signedTx)
  console.log(signedBz)
  return sendRawTransaction(signedBz)
}

function sendRawTransaction(signedBz) {
  const options = {
    method: "post",
    url: RPC_URL+"/txs",
    data: signedBz,
    headers: {
      "content-type": "text/plain",
    }
  }
  axios.request(options)
  .then((res) => {
    console.log(res.data)
  })
  .catch((error) => {
    console.error(error)
  })
}

function postPrice(price) {

  request(RPC_URL+'/auth/accounts/'+account, function (error, response, body) {

    if (error) {
      console.log(error)
    } else {
      var json = ''
      try {
        json = JSON.parse(body)
      } catch (err) {
        console.log(err)
      }
      var account_number = json.result.value.account_number
      var sequence = json.result.value.sequence

      var msg = {
        value: {
          from: account,
          asset_code: 'uftm',
          price: price.toFixed(18).toString(),
          expiry: (10000+parseInt(json.height)).toString(),
        },
        type: "oracle/MsgPostPrice",
      }
      broadcastTx = sign(PRIVATEKEY, msg, account_number, sequence, price)
      sendTransaction(broadcastTx)
    }
  })
}

/**
* generate the sign bytes for a transaction, given a msg
* @param {Object} concrete msg object
* @return {Buffer}
**/
function getSignBytes(message, msg) {
 if (!msg) {
   throw new Error("msg should be an object")
 }
 const fee = {
   amount: [],
   gas: "200000"
 }

 const signMsg = {
   "account_number": message.account_number.toString(),
   "chain_id": message.chain_id,
   "fee": fee,
   "memo": message.memo,
   "msgs": [msg],
   "sequence": message.sequence.toString(),
 }
 console.log(JSON.stringify(sortObject(signMsg)))
 return Buffer.from(JSON.stringify(sortObject(signMsg)))
}

/**
* attaches a signature to the transaction
* @param {Elliptic.PublicKey} pubKey
* @param {Buffer} signature
* @return {Transaction}
**/
function addSignature(message, pubKey, signature) {
 message.signatures = [{
   pub_key: pubKey,
   signature: signature,
 }]
 return message
}

/**
* sign transaction with a given private key and msg
* @param {string} privateKey private key hex string
* @param {Object} concrete msg object
* @return {Transaction}
**/
function sign(privateKey, msg, account_number, sequence, price) {
 if(!privateKey){
   throw new Error("private key should not be null")
 }

 if(!msg){
   throw new Error("signing message should not be null")
 }

 var message = {
   type:'cosmos-sdk/StdTx',
   sequence:sequence,
   account_number:account_number,
   chain_id:CHAIN_ID,
   msgs: [msg],
   memo: '',
   source: '',
   mode: 'sync',
 }

 const signBytes = getSignBytes(message, msg)
 const privKeyBuf = Buffer.from(privateKey, "hex")
 const signature = generateSignature(signBytes.toString("hex"), privKeyBuf)
 message = addSignature(message, generatePubKey(privKeyBuf), signature)
 return message
}
