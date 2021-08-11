import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Onyx } from '@dft/cordova-plugin-onyx';
import { IOnyxConfiguration, IOnyxPluginResult, OnyxPluginAction } from '@dft/onyx-typedefs';

const defaultOnyxPluginResult: IOnyxPluginResult = {
  onyxResults: [{}],
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
    if (this.platform.is(`cordova`)) {
      const result: IOnyxPluginResult = await Onyx.exec(options);
      console.log(`OnyxPluginResult`, result);
      this.onyxPluginResult = result || defaultOnyxPluginResult;
      return result;
    } else {
      throw new Error(`ONYX can only be executed on a mobile device`);
    }
  }
}
