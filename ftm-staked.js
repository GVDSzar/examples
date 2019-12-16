const axios = require('axios')

var uftm = 0

get_csdts()

function get_csdts() {
  axios.get('https://node.xar.network/csdts?collateralDenom=uftm')
  .then(function (response) {
    response.data.result.map(sum_uftm)
    console.log(uftm)
  })
  .catch(function (error) {
    console.log(error);
  })
}

function sum_uftm(csdt) {
  uftm += parseInt(csdt.collateral_amount[0].amount)
}
