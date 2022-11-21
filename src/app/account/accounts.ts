import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.html',
  styleUrls: ['./accounts.scss'],
})
export class AccountsPageComponent {
  constructor(private router: Router) {}

  newAccount() {
    this.router.navigate(['/accounts/new']);
  }
}
