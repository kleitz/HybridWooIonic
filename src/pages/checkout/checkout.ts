import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { WooCommerceProvider } from '../../providers/woocommerce/woocommerce';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {
  newOrder:any;
  paymentMethods: any[];
  paymentMethod: any;
  billing_shipping_same:boolean;
  WooCommerce: any;
  userInfo: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public alertCtrl: AlertController, public payPal: PayPal, public toastCtrl: ToastController,private woocommerce: WooCommerceProvider) {
    this.newOrder = {};
    this.newOrder.billing_address = {};
    this.newOrder.shipping_address = {};
    this.billing_shipping_same = false;

    this.paymentMethods = [
      {method_id:"bacs", method_title:"Direct Bank Transfer"},
      {method_id:"cheque", method_title:"Cheque payment"},
      {method_id:"cod", method_title:"Cash on delivery"},
      {method_id:"paypal", method_title:"PayPal"}
    ];

    this.WooCommerce = this.woocommerce.initialize();

    this.storage.get("userLoginInfo").then((userLoginInfo) =>{
      this.userInfo = userLoginInfo.user;
      let email = userLoginInfo.user.email;
      this.WooCommerce.getAsync("customers/email/"+email).then((data) =>{
        this.newOrder = JSON.parse(data.body).customer;
      })
    });
  }

  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same;
    if(this.billing_shipping_same){
      this.newOrder.shipping_address = this.newOrder.billing_address;
    }
  }

  placeOrder(){
    let orderItems: any[] = [];
    let data: any = {};
    let paymentData: any = {};

    this.paymentMethods.forEach((element, index) => {
      if(element.method_id == this.paymentMethod){
        paymentData = element;
      }
    });
    data = {
      payment_details: {
        method_id: paymentData.method_id,
        method_title: paymentData.method_title,
        paid: true
      },
      billing_address: this.newOrder.billing_address,
      shipping_address: this.newOrder.shipping_address,
      customer_id: this.userInfo.id || '',
      line_items: orderItems
    };

    if(paymentData.method_id == "paypal"){
      this.payPal.init({
        PayPalEnvironmentProduction: 'YOUR_PRODUCTION_CLIENT_ID',
        PayPalEnvironmentSandbox: 'Ab8JfBuVoW4xewx7a4jRVWKyz1W1WLU-6EaA4sHbPEzwhKDYYsYgYn4lgEkuZoKklJO_bDfL_My1tHRd'
      }).then(() => {
        // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
        this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
          // Only needed if you get an "Internal Service Error" after PayPal login!
          //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
        })).then(() => {
          this.storage.get("cart").then((cart)=>{
            let total = 0.00;
            cart.forEach((element, index) => {
              orderItems.push({"product_id":element.product.id, quantity: element.qty });
              total = total + (element.product.price * element.qty);
            });
              let payment = new PayPalPayment(total.toString(), 'USD', 'Description', 'sale');
              this.payPal.renderSinglePaymentUI(payment).then((response) => {
                data.line_items = orderItems;
                let orderData: any = {};
                orderData.order = data;
                this.WooCommerce.postAsync('orders', orderData, (err,data,res)=>{
                  alert("Order placed successfully!");
                  let response = JSON.parse(data.body).order;

                  this.alertCtrl.create({
                    title:"Order placed successfully",
                    message:"Your order has been placed successfully. Your order number is " + response.order_number,
                    buttons: [{
                      text:"OK",
                      handler:()=>{
                        this.navCtrl.setRoot(HomePage);
                      }
                    }]
                  });
                });
              });
          })
          }, () => {
            // Error or render dialog closed without being successful
          });
        }, () => {
          // Error in configuration
        });

    }else if(paymentData.method_id != null ){
      this.storage.get("cart").then((cart) =>{
        cart.forEach((element, index) =>{
          orderItems.push({ product_id: element.product.id,quantity: element.qty });
        });
        data.line_items = orderItems;
        let orderData: any = {};
        orderData.order = data;
        this.WooCommerce.postAsync("orders", orderData).then((data)=>{
          let response = JSON.parse(data.body).order;
          console.log(response);

          this.alertCtrl.create({
            title:"Order placed successfully",
            message:"Your order has been placed successfully. Your order number is " + response.order_number,
            buttons: [{
              text:"OK",
              handler:()=>{
                this.navCtrl.setRoot(HomePage);
              }
            }]
          }).present();
        });
      })
    }else{
      this.toastCtrl.create({
        message:"Missing payment method",
        duration: 3000
      })
    }

  }

}
