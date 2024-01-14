const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const {v4: uuid} = require('uuid');
const { ensureAdmin } = require('../middleware/auth');
const { default: axios } = require('axios');
const { PAYPAL_USERNAME, PAYPAL_PASSWORD, PAYPAL_ACCESS_TOKEN } = require('../config');
const { config } = require('dotenv');

async function getAC(){
  const result = await axios.post("https://api-m.sandbox.paypal.com/v1/oauth2/token",
        new URLSearchParams({
          'grant_type': 'client_credentials'
        }),
        {
          auth: {
            username: PAYPAL_USERNAME,
            password: PAYPAL_PASSWORD
          }
        });
  return result.data.access_token;
}

router.get('/paypal', async function(req,res,next){
    try{
        console.log("route found");
        const ACCESS_TOKEN = await getAC();
        /*const result = await axios.post("https://api-m.sandbox.paypal.com/v1/oauth2/token",
        new URLSearchParams({
          'grant_type': 'client_credentials'
        }),
        {
          auth: {
            username: PAYPAL_USERNAME,
            password: PAYPAL_PASSWORD
          }
        });
        console.log(result.data.access_token);/*
        /*const paymentExperience = await axios.post(
          "https://api-m.sandbox.paypal.com/v1/payment-experience/web-profiles/"
          ,
        { "name": "Chronoplast"
        },
        {headers:{
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `${result.data.app_id}`,
          'Authorization': `Bearer ${result.data.access_token}`
        }});*/
        /*const payment = await axios.post(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        {"intent": "CAPTURE", 
          "purchase_units": [ 
            { "amount": { "currency_code": "USD", "value": "100.00" } 
            } 
          ], 
          "payment_source": { 
            "paypal": { 
              "experience_context": { 
                "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED", 
                "brand_name": "Chronoplast", 
                "locale": "en-US", 
                "landing_page": "LOGIN", 
                "shipping_preference": "SET_PROVIDED_ADDRESS", 
                "user_action": "PAY_NOW", 
                "return_url": "https://example.com/returnUrl",
                "cancel_url": "https://example.com/cancelUrl" 
              } 
            } 
          } 
        },
        {headers:{
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.data.access_token}`
        }});*/
        const newPayment = await axios({
          method: 'post',
          url:'https://api-m.sandbox.paypal.com/v2/checkout/orders',
          data: {'intent': 'CAPTURE', 
                  'purchase_units': [ 
                    { amount: { "currency_code": "USD", "value": "100.00" } 
                    } 
                  ], 
                  payment_source: { 
                    "paypal": { 
                      "experience_context": { 
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED", 
                        "brand_name": "Chronoplast", 
                        "locale": "en-US", 
                        "landing_page": "LOGIN", 
                        "user_action": "PAY_NOW", 
                        "return_url": "https://example.com/returnUrl",
                        "cancel_url": "https://example.com/cancelUrl" 
                      } 
                    } 
                  } 
                },
          headers:{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        console.log("Finished resutl");
        console.log(newPayment.data);
        return res.json("paypal");
    }catch(err){
      console.log(err.response.data);
        return err;
    }
})

router.post('/', ensureAdmin, async function(req,res,next){
    try{
        const amount = req.body.amount;
        const result = await Payment.createPayment(amount);
        return res.status(201).json(result.result.status);
    }catch(err){
        return next(err);
    }
})

module.exports=router;