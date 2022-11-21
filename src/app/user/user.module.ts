import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoginPageComponent } from './login';
import { LogoutPageComponent } from './logout';
import { VerifyUserPageComponent } from './verify';
import { ResetPasswordPageComponent } from './reset';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [
    LoginPageComponent,
    LogoutPageComponent,
    VerifyUserPageComponent,
    ResetPasswordPageComponent,
  ],
  imports: [BrowserModule, ReactiveFormsModule, AppRoutingModule],
  providers: [],
})
export class UserModule {}
