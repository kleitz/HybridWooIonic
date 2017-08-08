import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CheckoutPage } from '../checkout/checkout';
import { LoginPage } from '../login/login';


@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  cartItems: any[] = [];
  total: any;//total without discount
  sumQty: any = 0;//qty of all itens
  discount: any;//message for discount
  percent:any;//total with discount
  value:any;
  showEmptyCartMessage: boolean = false;
  showDiscountMessage: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public viewCtrl: ViewController) {
    this.total = 0.0;
    this.sumQty = 0;
    this.percent = 0.0;
    this.value = 0.0;

    this.storage.ready().then(()=>{
      this.storage.get("cart").then((data)=>{
        this.cartItems = data;
        if(this.cartItems.length > 0){

          this.cartItems.forEach((item, index) =>{
            this.total = this.total + (item.product.price * item.qty);
            this.sumQty= Number(this.sumQty + item.qty);
          });
          // discount calc
          if( this.sumQty >= 120 && this.sumQty <= 179 )
          {
            this.value = this.total * 0.01;
            this.percent = this.total - this.value;
            this.showDiscountMessage = true;
            this.discount = "Desconto de 1% sobre o total da compra.";
          }else if(this.sumQty >= 180 && this.sumQty <= 239)
          {
            this.value = this.total * 0.02;
            this.percent = this.total - this.value;
            this.showDiscountMessage = true;
            this.discount = "Desconto de 2% sobre o total da compra.";
          }else if(this.sumQty >= 240)
          {
            this.value = this.total * 0.025;
            this.percent = this.total - this.value;
            this.showDiscountMessage = true;
            this.discount = "Desconto de 2,5% sobre o total da compra.";
          }
        }else{
          this.showEmptyCartMessage = true;
        }
      })
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CartPage');
  }

  removeFromCart(item,i){
    let price = item.product.price;
    let qty = item.qty;

    this.cartItems.splice(i, 1);
    this.storage.set("cart", this.cartItems).then(()=>{
      this.total = this.total - (price * qty);
      this.sumQty= Number(this.sumQty - qty);
      //this.showDiscountMessage = false;
      this.percent = 0.0;
      if(this.sumQty < 120){
        this.showDiscountMessage = false;
        this.percent = 0.0;
      }
      else if( this.sumQty >= 120 && this.sumQty <= 179 ){
        this.value = this.total * 0.01;
        this.percent = this.total - this.value;
        this.showDiscountMessage = true;
        this.discount = "Desconto de 1% sobre o total da compra.";
      }else if( this.sumQty >= 180 && this.sumQty <= 239 ){
        this.value = this.total * 0.02;
        this.percent = this.total - this.value;
        this.showDiscountMessage = true;
        this.discount = "Desconto de 2% sobre o total da compra.";
      }else if( this.sumQty >= 240 ){
        this.value = this.total * 0.025;
        this.percent = this.total - this.value;
        this.showDiscountMessage = true;
        this.discount = "Desconto de 2,5% sobre o total da compra.";
      }
    });
    if(this.cartItems.length == 0){
      this.showEmptyCartMessage = true;
      this.showDiscountMessage = false;
    }
  }

  closeModal(){
    this.viewCtrl.dismiss();
  }
  checkout(){
    this.storage.get("userLoginInfo").then((data)=>{
      if(data != null){
        this.navCtrl.push(CheckoutPage);
      }else{
        this.navCtrl.push(LoginPage, {next: CheckoutPage});
      }
    });

  }


}
