import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnyxResultPageRoutingModule } from './onyx-result-routing.module';

import { OnyxResultPage } from './onyx-result.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnyxResultPageRoutingModule
  ],
  declarations: [OnyxResultPage]
})
export class OnyxResultPageModule {}
