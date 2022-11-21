import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';

import { ReconcilePageComponent } from './reconcile';
import { ReconcileModalComponent } from './reconcile-modal';

@NgModule({
  declarations: [ReconcilePageComponent, ReconcileModalComponent],
  imports: [
    BrowserModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [],
  entryComponents: [ReconcileModalComponent],
})
export class ReconcileModule {}
