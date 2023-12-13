const client = require('../square.connect');
const square = client.paymentsApi;
const {v4:uuid}=require('uuid');

class Payment{

    static async createPayment(total){
        try{
            const amount = parseInt(total*100);
            const body = {
                sourceId: 'cnon:card-nonce-ok',
                idempotencyKey: uuid(),
                amountMoney: {
                  amount: amount,
                  currency: 'USD'
                },
                appFeeMoney: {
                  amount: amount*0.05,
                  currency: 'USD'
                },
                acceptPartialAuthorization: false
              }
            const payment = await square.createPayment(body);
            return payment;
        }catch(err){
            return err;
        }
    }
}

module.exports=Payment;