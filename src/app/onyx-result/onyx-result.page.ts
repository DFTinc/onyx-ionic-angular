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
