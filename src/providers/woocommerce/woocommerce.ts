import { Injectable } from '@angular/core';
import * as WC from 'woocommerce-api';

@Injectable()
export class WooCommerceProvider {

  WooCommerce: any;

  constructor() {
    this.WooCommerce = WC({
      url:"http://mobilestock.com.br/",
      consumerKey: "ck_e33d2196255b5ada7bf637d785afbfca5be0b78d ",
      consumerSecret: "cs_34cc36be2864d9cfe66d1471db5d0cdeb50ccc7e"
    });
  }

  initialize(){
      return this.WooCommerce;
  }

}
