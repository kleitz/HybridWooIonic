import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  username: string;
  password: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public toastCtrl: ToastController, public storage: Storage, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    this.username = "";
    this.password = "";
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad LoginPage');
  }

  login(){

    this.loadingCtrl.create({
      content: 'Conectando...',
      duration: 4000
    }).present();

    this.http.get("http://mobilestock.com.br/api/auth/generate_auth_cookie?insecure=cool&username="+this.username+"&password="+this.password)
    .subscribe((res)=>{
      console.log(res);

      let response = res.json();
      if(response.error){
        this.toastCtrl.create({
          message: response.error,
          duration: 5000,
        }).present();
        return;
      }

      this.storage.set("userLoginInfo", response).then((data)=>{
        this.alertCtrl.create({
          title:"Conectado com sucesso",
          message:"Você foi conectado no sistema com sucesso.",
          buttons:[{
            text:"OK",
            handler:()=> {
              if(this.navParams.get("next")){
                this.navCtrl.push(this.navParams.get("next"));
              }else{
                this.navCtrl.pop();
              }
            }
          }]
        }).present();
      });
    });
  }

}
