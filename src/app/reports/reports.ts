import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: 'reports.html',
})
export class ReportsPageComponent {
  reports: Array<{ title: string; url: string }>;

  constructor() {
    this.reports = [
      { title: 'Income Statement', url: '/reports/income' },
      { title: 'Balance Sheet', url: '/reports/balancesheet' },
    ];
  }
}
