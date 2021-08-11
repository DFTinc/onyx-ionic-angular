# Getting Started
This example app will be using `Ionic Framework`, `capacitor`, and `cordova`.

- Please follow the following **Getting Started** guides
    - https://capacitorjs.com/docs
    - https://ionicframework.com/docs
    
## Ionic Angular
```bash
ionic start onyx-ionic-angular blank --capacitor --type=angular --package-id=com.diamondfortress.onyx.ionic.example.angular
cd onyx-ionic-angular
```

### Install the ONYX Cordova plugin
```bash
npm install @dft/cordova-plugin-onyx @dft/onyx-typedefs
```

### Inject your ONYX License Key to the environment
- Edit `src/environments/environment.ts` and export your `onyxLicense`
```angularjs
export const environment = {
  production: false,
  onyxLicense: ''
};
```

### Preview Web App
Test that the application runs
```bash
ionic serve
```

### Generate an ONYX Service
```bash
ionic generate service services/onyx
```
- Edit the generated file `src/app/services/onyx.service.ts`
- Replace the contents of the file with the following
```angularjs
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Onyx } from '@dft/cordova-plugin-onyx';
import { IOnyxConfiguration, IOnyxPluginResult, OnyxPluginAction } from '@dft/onyx-typedefs';

const defaultOnyxPluginResult: IOnyxPluginResult = {
  onyxResults: [],
  action: OnyxPluginAction.CAPTURE
};

@Injectable({
  providedIn: 'root'
})
export class OnyxService {
  private onyxPluginResult: IOnyxPluginResult = defaultOnyxPluginResult;

  constructor(private platform: Platform) {
  }

  public getOnyxPluginResult(): IOnyxPluginResult {
    return this.onyxPluginResult || defaultOnyxPluginResult;
  }

  public async execOnyx(options: IOnyxConfiguration): Promise<IOnyxPluginResult> {
    if (this.platform.is('cordova')) {
      const result: IOnyxPluginResult = await Onyx.exec(options);
      console.log('OnyxPluginResult', result);
      this.onyxPluginResult = result || defaultOnyxPluginResult;
      return result;
    } else {
      throw new Error('ONYX can only be executed on a mobile device');
    }
  }
}
```

### Refactor the Home Page
Edit `/src/app/home/home.page.html`
- Change both instances of `<ion-title>` from "Blank" to "ONYX Camera"
- Remove all children of the `<div id="container">` element
- Add an `<ion-button>` element inside `<div id="container">`
```angular2html
<ion-button color="primary" (click)="capture()">Start ONYX</ion-button>
```

Edit `/src/app/home/home.page.ts`

- Replace the contents of the file with the following
```angularjs
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

```

### Generate a new page to display the ONYX Result
```bash
ionic generate page "Onyx Result"
```

### Refactor the ONYX Result Page
Replace the contents of `src/app/onyx-result/onyx-result.page.ts` with the following
```angularjs
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IOnyxResult } from '@dft/onyx-typedefs';
import { OnyxService } from '../services/onyx.service';

@Component({
  selector: 'app-onyx-result',
  templateUrl: './onyx-result.page.html',
  styleUrls: ['./onyx-result.page.scss']
})
export class OnyxResultPage implements OnInit {
  public onyxResults: Array<IOnyxResult> = [];

  constructor(
    private onyxService: OnyxService, public domSanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    this.onyxResults = this.onyxService.getOnyxPluginResult().onyxResults || [];
  }

}

```

Replace the contents of `src/app/onyx-result/onyx-result.page.html` with the following
```angular2html
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button></ion-back-button>
    </ion-buttons>
    <ion-title>Onyx Result</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-card *ngFor="let onyxResult of onyxResults; index as i">
    <ion-card-header>
      <ion-card-subtitle class="ion-text-uppercase">Fingerprint #{{i+1}}
      </ion-card-subtitle>
    </ion-card-header>
    <ion-grid>
      <ion-row>
        <ion-col *ngIf="onyxResult && onyxResult.rawFingerprintDataUri">
          <h4>Raw</h4>
          <img [src]="domSanitizer.bypassSecurityTrustUrl(onyxResult.rawFingerprintDataUri)">
        </ion-col>
        <ion-col *ngIf="onyxResult && onyxResult.processedFingerprintDataUri">
          <h4>Processed</h4>
          <img [src]="domSanitizer.bypassSecurityTrustUrl(onyxResult.processedFingerprintDataUri)">
        </ion-col>
        <ion-col *ngIf="onyxResult && onyxResult.enhancedFingerprintDataUri">
          <h4>Enhanced</h4>
          <img [src]="domSanitizer.bypassSecurityTrustUrl(onyxResult.enhancedFingerprintDataUri)">
        </ion-col>
      </ion-row>
    </ion-grid>

    <!--Fingerprint Capture Metrics-->
    <ion-list no-lines margin-bottom
              *ngIf="onyxResult && onyxResult.captureMetrics &&
                onyxResult.captureMetrics.nfiqMetrics && (
                onyxResult.captureMetrics.nfiqMetrics.nfiqScore ||
                onyxResult.captureMetrics.nfiqMetrics.mlpScore
                )"
    >
      <ion-list-header color="light" class="ion-text-uppercase">NFIQ Metrics</ion-list-header>
      <ion-item class="ion-text-wrap">
        <ion-label>NFIQ Score</ion-label>
        <div item-right>{{onyxResult.captureMetrics.nfiqMetrics.nfiqScore}}</div>
      </ion-item>
      <ion-item class="ion-text-wrap">
        <ion-label>MLP Score</ion-label>
        <div item-right>{{onyxResult.captureMetrics.nfiqMetrics.mlpScore}}</div>
      </ion-item>
    </ion-list>
  </ion-card>

  <ion-list no-lines *ngIf="onyxResults && onyxResults.length && onyxResults[0].captureMetrics">
    <ion-list-header color="light" class="ion-text-uppercase">Capture Metrics</ion-list-header>
    <ion-item text-wrap *ngIf="onyxResults[0].captureMetrics.livenessConfidence != -1">
      <ion-label>Liveness Confidence</ion-label>
      <div item-right>
        {{onyxResults[0].captureMetrics.livenessConfidence}}
      </div>
    </ion-item>
    <ion-item text-wrap *ngIf="onyxResults[0].captureMetrics.focusQuality">
      <ion-label>Focus Quality</ion-label>
      <div item-right>
        {{onyxResults[0].captureMetrics.focusQuality}}
      </div>
    </ion-item>
  </ion-list>
</ion-content>

```

### Preview the ONYX Result Page
You should now be able to click on the "Start ONYX" button from the Home page and it should successfully navigate you to the Onyx Result page and provide a back button in the navigation bar to return to the Home page.

## Capacitor/Cordova Setup
Build the project
```bash
npm run build
```
Add Android and iOS project folders
```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```
### Android
Open the android application
```bash
npx cap open android
```

#### Add the Diamond Fortress Maven repository
Edit `android/build.gradle` to make `allprojects/repositories` look like the following

```
allprojects {
    repositories {
        google()
        jcenter()
        mavenCentral()
        
            maven {
                url 'http://nexus.diamondfortress.com/nexus/content/repositories/releases/'
                allowInsecureProtocol true
            }
        
            maven {
                url 'http://nexus.diamondfortress.com/nexus/content/repositories/snapshots/'
                allowInsecureProtocol true
            }
        
            maven {
                url "https://maven.google.com"
            }
    }
}
```

### iOS
Add the following to `ios/App/App/Info.plist`
```
<key>NSCameraUsageDescription</key>
<string>This application will use your phone's camera to capture an image of your fingerprint.</string>
```

### Run on a hardware device
Plugin in a hardware Android or iOS device and run the app from Android Studio or Xcode.
