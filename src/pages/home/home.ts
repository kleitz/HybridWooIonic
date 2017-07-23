import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, ToastController } from 'ionic-angular';
import { ProductDetailsPage } from '../product-details/product-details';
import { WooCommerceProvider } from '../../providers/woocommerce/woocommerce';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  WooCommerce: any;
  products: any[];
  moreProducts: any[];
  page: number;

  @ViewChild('productSlides') productSlides : Slides;

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, private woocommerce: WooCommerceProvider) {

    this.page = 2;

    this.WooCommerce = this.woocommerce.initialize();

    this.WooCommerce.getAsync("products").then((data)=>{
      //console.log(JSON.parse(data.body).products);
      this.products = JSON.parse(data.body).products;
    },(err)=>{
      console.log(err)
    });

    this.loadMoreProducts(null);
  }

  ionViewDidLoad(){
    setInterval(()=>{
      if(this.productSlides.getActiveIndex() == this.productSlides.length() -1){
        this.productSlides.slideTo(0);
      }else{
        this.productSlides.slideNext();
      }
    }, 3000)
  }

  loadMoreProducts(event){
    if(event == null){
      this.page = 2;
      this.moreProducts = [];
    }else{
      this.page ++;
    }

    this.WooCommerce.getAsync("products?page="+ this.page).then((data)=>{
    //console.log(JSON.parse(data.body));
      this.moreProducts = this.moreProducts.concat(JSON.parse(data.body).products);

      if(event != null){
        event.complete();
        if(JSON.parse(data.body).products.length < 10){
          event.enable(false);
          this.toastCtrl.create({
            message:"Não existem mais produtos!",
            duration: 3000
          }).present();
        }
      }
    },(err)=>{
      console.log(err)
    });
  }

  openProductPage(product){
    this.navCtrl.push(ProductDetailsPage, { "product": product });
  }

}
