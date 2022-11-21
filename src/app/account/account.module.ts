import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';

import { AccountsPageComponent } from './accounts';
import { NewAccountPageComponent } from './new';
import { EditAccountPageComponent } from './edit';
import { TreeComponent } from './tree';

@NgModule({
  declarations: [
    AccountsPageComponent,
    NewAccountPageComponent,
    EditAccountPageComponent,
    TreeComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    AppRoutingModule,
  ],
  exports: [TreeComponent],
  providers: [],
})
export class AccountModule {}
