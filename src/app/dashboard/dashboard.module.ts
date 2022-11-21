import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DashboardPageComponent } from './dashboard';

@NgModule({
  declarations: [DashboardPageComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  providers: [],
})
export class DashboardModule {}
