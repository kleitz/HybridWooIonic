import { Injectable } from '@angular/core';
import * as WC from 'woocommerce-api';

@Injectable()
export class WooCommerceProvider {

  WooCommerce: any;

  constructor() {
    this.WooCommerce = WC({
      url:"http://localhost:8080/wordpress",
      consumerKey: "ck_4a07fd7d2b5cc33e0768d017bbe318db9afc430e ",
      consumerSecret: "cs_536c333fd3d46fca0eb279cdc94402b4565a1d76"
    });
  }

  initialize(){
      return this.WooCommerce;
  }

}
