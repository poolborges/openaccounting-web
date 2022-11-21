import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';

import { PriceDbPageComponent } from './pricedb';
import { PriceModalComponent } from './price-modal';

@NgModule({
  declarations: [PriceDbPageComponent, PriceModalComponent],
  imports: [
    BrowserModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [],
  entryComponents: [PriceModalComponent],
})
export class PriceModule {}
