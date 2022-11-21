import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SettingsPageComponent } from './settings';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SettingsPageComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
})
export class SettingsModule {}
