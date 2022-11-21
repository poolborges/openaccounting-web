import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RegisterPageComponent } from './register';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [RegisterPageComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
})
export class RegisterModule {}
