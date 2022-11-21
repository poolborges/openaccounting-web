import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { TxListPageComponent } from './list';
import { SharedModule } from '../shared/shared.module';
import { AppRoutingModule } from '../app-routing.module';
import { AdvancedEditComponent } from './advancededit';
import { AutocompleteComponent } from './autocomplete';
import { BreadcrumbsComponent } from './breadcrumbs';
import { NewTransactionPageComponent } from './new';

@NgModule({
  declarations: [
    TxListPageComponent,
    AdvancedEditComponent,
    AutocompleteComponent,
    BreadcrumbsComponent,
    NewTransactionPageComponent,
  ],
  imports: [
    BrowserModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    AppRoutingModule,
  ],
  exports: [],
  providers: [],
  entryComponents: [AdvancedEditComponent],
})
export class TransactionModule {}
