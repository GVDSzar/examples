const axios = require('axios')

var price = 0

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

const crypto = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4
})

const ftm = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'FTM',
  minimumFractionDigits: 2
})

axios.get('https://node.xar.network/oracle/currentprice/uftm')
.then(function (response) {
  price = parseFloat(response.data.result.price)
  get_csdts()

})
.catch(function (error) {
  console.log(error);
})

function get_csdts() {
  axios.get('https://node.xar.network/csdts?collateralDenom=uftm')
  .then(function (response) {
    response.data.result.map(check_liquidation)
  })
  .catch(function (error) {
    console.log(error);
  })
}

function check_liquidation(csdt) {
  collateral = parseInt(csdt.collateral_amount[0].amount)
  collateral_value = collateral*price
  collateral_value_adjusted = collateral_value*0.66
  debt = parseInt(csdt.debt[0].amount)
  collateral_ratio = collateral_value/debt*100
  console.log("---------------------------------------------")
  console.log("Owner: "+csdt.owner)
  console.log("Collateral (FTM): "+ftm.format(collateral/1000000))
  console.log("Collateral Value ($): "+formatter.format(collateral_value/1000000))
  console.log("CSDT Value ($): "+formatter.format(debt/1000000))
  console.log("Collateral Ratio (%): "+collateral_ratio.toFixed(2)+"%")
  if (collateral_value_adjusted < debt) {
    console.log("IsUnderCollateralized?: true")
  } else {
    console.log("IsUnderCollateralized?: false")
  }
}
