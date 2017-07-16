import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { LoginPage } from '../login/login';
import { CartPage } from '../cart/cart';
import * as WC from 'woocommerce-api';
import { ProductsByCategoryPage } from '../products-by-category/products-by-category';
import { Storage } from '@ionic/storage';
import { WooCommerceProvider } from '../../providers/woocommerce/woocommerce';

@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  homePage: Component;
  WooCommerce: any;
  categories: any[];
  @ViewChild('content') childNavCrtl: NavController;
  loggedin: boolean;
  user: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public modalCtrl: ModalController, private woocommerce: WooCommerceProvider) {
    this.homePage = HomePage
    this.categories = [];
    this.user = {};

    this.WooCommerce = this.woocommerce.initialize();

    this.WooCommerce.getAsync("products/categories").then((data)=>{
      console.log(JSON.parse(data.body).product_categories);
      let temp: any[] = JSON.parse(data.body).product_categories;

      for(let i = 0 ; i < temp.length ; i++){
        if(temp[i].parent == 0 ){

          if(temp[i].slug == "clothing"){
            temp[i].icon = "shirt";
          }
          if(temp[i].slug == "music"){
            temp[i].icon = "musical-notes";
          }
          if(temp[i].slug == "posters"){
            temp[i].icon = "images";
          }

          this.categories.push(temp[i]);
        }
      }
    },(err)=>{
      console.log(err)
    });
  }

  ionViewDidEnter() {
    this.storage.ready().then(()=>{
      this.storage.get("userLoginInfo").then((userLoginInfo) =>{
        if(userLoginInfo != null){
          console.log("User logged in...");
          this.user = userLoginInfo.user;
          console.log(this.user);
          this.loggedin = true;
        }else{
          console.log("No user found.");
          this.user = {};
          this.loggedin = false;
        }
      });
    });
  }

  OpenCategoryPage(category) {
    this.childNavCrtl.setRoot(ProductsByCategoryPage, {"category": category});
  }

  openPage(pageName:string){
    if(pageName == "signup"){
      this.navCtrl.push(SignupPage);
    }else if(pageName == "login"){
      this.navCtrl.push(LoginPage);
    }else if(pageName == "cart"){
      let modal = this.modalCtrl.create(CartPage);
      modal.present();
    }else if(pageName == "logout"){
      this.storage.remove("userLoginInfo").then(()=>{
        this.user = {};
        this.loggedin = false;
      });
    }
  }
}
