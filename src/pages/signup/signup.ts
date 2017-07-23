import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { WooCommerceProvider } from '../../providers/woocommerce/woocommerce';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {


  newUser: any = {};
  billing_shipping_same: boolean;
  WooCommerce: any;
  editing: boolean;
  userInfo: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public storage: Storage, public toastCtrl: ToastController, public alertCtrl: AlertController, private woocommerce: WooCommerceProvider) {

    this.newUser.billing_address = {};
    this.newUser.shipping_address = {};
    this.billing_shipping_same = false;

    this.WooCommerce = this.woocommerce.initialize();

    this.loadingCtrl.create({
      content: 'Carregando dados...',
      duration: 4000
    }).present();

    this.storage.ready().then(()=>{
      this.storage.get("userLoginInfo").then((userLoginInfo) =>{
        if(userLoginInfo != null){
          this.userInfo = userLoginInfo.user;
          //console.log(this.userInfo);
          let email = userLoginInfo.user.email;
          this.WooCommerce.getAsync("customers/email/"+email).then((data) =>{
            this.newUser = JSON.parse(data.body).customer;
          });
          this.editing = true;
        }else{
          this.editing = false;
        }
      })});
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad Signup');
  }

  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same;
  }

  checkEmail(){

    let validEmail = false;

    let reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(reg.test(this.newUser.email)){
      //email looks valid

      this.WooCommerce.getAsync('customers/email/' + this.newUser.email).then( (data) => {
        let res = (JSON.parse(data.body));

        if(res.errors){
          validEmail = true;

          this.toastCtrl.create({
            message: "Congratulations. Email is good to go.",
            duration: 3000
          }).present();

        } else {
          validEmail = false;

          this.toastCtrl.create({
            message: "Email already registered. Please check.",
            showCloseButton: true
          }).present();
        }

        console.log(validEmail);

      })



    } else {
      validEmail = false;
      this.toastCtrl.create({
        message: "Invalid Email. Please check.",
        showCloseButton: true
      }).present();
      console.log(validEmail);
    }

  }

  signup(){

      let customerData = {
        customer : {}
      }

      customerData.customer = {
        "email": this.newUser.email,
        "first_name": this.newUser.first_name,
        "last_name": this.newUser.last_name,
        "username": this.newUser.username,
        "password": this.newUser.password,
        "billing_address": {
          "first_name": this.newUser.first_name,
          "last_name": this.newUser.last_name,
          "company": "",
          "address_1": this.newUser.billing_address.address_1,
          "address_2": this.newUser.billing_address.address_2,
          "city": this.newUser.billing_address.city,
          "state": this.newUser.billing_address.state,
          "postcode": this.newUser.billing_address.postcode,
          "country": this.newUser.billing_address.country,
          "email": this.newUser.email,
          "phone": this.newUser.billing_address.phone
        },
        "shipping_address": {
          "first_name": this.newUser.first_name,
          "last_name": this.newUser.last_name,
          "company": "",
          "address_1": this.newUser.shipping_address.address_1,
          "address_2": this.newUser.shipping_address.address_2,
          "city": this.newUser.shipping_address.city,
          "state": this.newUser.shipping_address.state,
          "postcode": this.newUser.shipping_address.postcode,
          "country": this.newUser.shipping_address.country
        }
      }

      if(this.billing_shipping_same){
        this.newUser.shipping_address = this.newUser.shipping_address;
      }
      if(!this.editing){
        this.WooCommerce.postAsync('customers', customerData).then( (data) => {

          let response = (JSON.parse(data.body));

          if(response.customer){
            this.alertCtrl.create({
              title: "Conta criada",
              message: "Sua conta foi criada com sucesso! Favor realizar login para seguir.",
              buttons: [{
                text: "Login",
                handler: ()=> {
                  //TODO
                }
              }]
            }).present();
          } else if(response.errors){
            this.toastCtrl.create({
              message: response.errors[0].message,
              showCloseButton: true
            }).present();
          }

        })
      }else{

        this.WooCommerce.putAsync('customers/'+this.userInfo.id, customerData).then( (data) => {

          let response = (JSON.parse(data.body));

          if(response.customer){
            this.alertCtrl.create({
              title: "Conta atualizada",
              message: "Sua conta foi atualizada com sucesso!",
              buttons: [{
                text: "OK",
                handler: ()=> {
                  //TODO
                }
              }]
            }).present();
          } else if(response.errors){
            this.toastCtrl.create({
              message: response.errors[0].message,
              showCloseButton: true
            }).present();
          }

        })
      }

    }

}
