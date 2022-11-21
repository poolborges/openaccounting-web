import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReportsPageComponent } from './reports';
import { IncomeReportComponent } from './income';
import { BalanceSheetReportComponent } from './balancesheet';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ReportsPageComponent,
    IncomeReportComponent,
    BalanceSheetReportComponent,
  ],
  imports: [BrowserModule, ReactiveFormsModule, AppRoutingModule, SharedModule],
  providers: [],
})
export class ReportsModule {}
