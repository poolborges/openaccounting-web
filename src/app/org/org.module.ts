import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NewOrgPageComponent } from './neworg';
import { OrgPageComponent } from './org';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [NewOrgPageComponent, OrgPageComponent],
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [],
})
export class OrgModule {}
