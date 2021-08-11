import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OnyxResultPage } from './onyx-result.page';

const routes: Routes = [
  {
    path: '',
    component: OnyxResultPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnyxResultPageRoutingModule {}
