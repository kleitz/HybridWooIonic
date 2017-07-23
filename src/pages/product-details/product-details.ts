import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CartPage } from '../cart/cart';
import { WooCommerceProvider } from '../../providers/woocommerce/woocommerce';

@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage {
  WooCommerce:any;
  product: any;
  reviews: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public toastCtrl: ToastController, private woocommerce: WooCommerceProvider, public modalCtrl: ModalController ) {
    this.product = this.navParams.get("product");
    console.log(this.product);

    this.WooCommerce = this.woocommerce.initialize();

    this.WooCommerce.getAsync('products/'+this.product.id+'/reviews').then((data)=>{
      this.reviews = JSON.parse(data.body).product_reviews;
      console.log(this.reviews);
    },(err)=>{console.log(err);})
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductDetailsPage');
  }

  addToCart(product){
    if(product.quantity > product.stock_quantity){
      this.toastCtrl.create({
        message: "Quantidade superior a quantidade em estoque.",
        duration: 4000,
      }).present();
      return;
    }else if(product.quantity == null){
      this.toastCtrl.create({
        message: "Quantidade não pode estar vazia.",
        duration: 4000,
      }).present();
      return;
    }

    this.storage.get("cart").then((data)=>{
      if(data == null || data.length == 0){
        data = [];
        data.push({
          "product": product,
          "qty": Number(product.quantity),
          "amount": parseFloat(product.price)
        });
      }else{
        let added = 0;
        let qty = 0;

        for(let i = 0; i < data.length; i++){
          if(product.id == data[i].product.id){
            console.log("Produto já existe na lista de pedidos");
            qty = Number(data[i].qty);
            data[i].qty = qty + Number(product.quantity);
            data[i].amount = parseFloat(data[i].amount) + parseFloat(data[i].product.price);
            added = 1;
          }
        }
        if(added == 0){
          data.push({
            "product": product,
            "qty": Number(product.quantity),
            "amount": parseFloat(product.price)
          });
        }
      }
      this.storage.set("cart", data).then(()=>{
        console.log("Lista atualizada");
        console.log(data);
        this.toastCtrl.create({
          message: "Lista atualizada",
          duration: 3000,
        }).present();
      })

    });
  }

  openCart(){
    this.modalCtrl.create(CartPage).present();
  }

}
