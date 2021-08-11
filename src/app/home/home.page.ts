import { Component, NgZone } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { IOnyxConfiguration, IOnyxPluginResult, OnyxPluginAction } from '@dft/onyx-typedefs';
import { OnyxService } from '../services/onyx.service';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const { onyxLicense } = environment;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  public ios: boolean;
  public android: boolean;
  private onyxConfig: IOnyxConfiguration = {
    onyxLicense,
    returnProcessedImage: true,
    computeNfiqMetrics: true,
    useOnyxLive: true
  };

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router,
    private ngZone: NgZone,
    private onyxService: OnyxService
  ) {
    this.ios = platform.is('ios');
    this.android = platform.is('android');
  }

  public async capture(): Promise<void> {
    if (this.platform.is('cordova')) {
      this.onyxConfig.action = OnyxPluginAction.CAPTURE;
      try {
        const onyxPluginResult: IOnyxPluginResult = await this.onyxService.execOnyx(this.onyxConfig);
        await this.handleOnyxPluginResult({ onyxPluginResult });
      } catch (error) {
        console.error('onyxService.execOnyx() Error', error);
        await this.handleOnyxPluginResult({ error });
      }
    } else {
      await this.router.navigateByUrl('/onyx-result');
    }
  }

  public async handleOnyxPluginResult({
                                        error,
                                        onyxPluginResult = {}
                                      }: { error?: any; onyxPluginResult?: IOnyxPluginResult }): Promise<void> {
    if (error) {
      console.error('Onyx Error: ', error);
      const alert = await this.alertCtrl.create({
        header: 'ONYX Error',
        message: JSON.stringify(error),
        buttons: [{ text: 'OK' }]
      });
      await alert.present();
    } else {
      switch (onyxPluginResult.action) {
        case OnyxPluginAction.CAPTURE:
          await this.ngZone.run(async () => {
            await this.router.navigateByUrl('/onyx-result');
          });
          break;
      }
    }
  }
}
