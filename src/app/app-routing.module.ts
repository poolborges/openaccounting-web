import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPageComponent } from './dashboard/dashboard';
import { AccountsPageComponent } from './account/accounts';
import { NewAccountPageComponent } from './account/new';
import { EditAccountPageComponent } from './account/edit';
import { TxListPageComponent } from './transaction/list';
import { LoginPageComponent } from './user/login';
import { LogoutPageComponent } from './user/logout';
import { VerifyUserPageComponent } from './user/verify';
import { ResetPasswordPageComponent } from './user/reset';
import { RegisterPageComponent } from './register/register';
import { NewOrgPageComponent } from './org/neworg';
import { OrgPageComponent } from './org/org';
import { SettingsPageComponent } from './settings/settings';
import { PriceDbPageComponent } from './price/pricedb';
import { NewTransactionPageComponent } from './transaction/new';

import { ReportsPageComponent } from './reports/reports';
import { IncomeReportComponent } from './reports/income';
import { BalanceSheetReportComponent } from './reports/balancesheet';

import { ReconcilePageComponent } from './reconcile/reconcile';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'user/verify', component: VerifyUserPageComponent },
  { path: 'user/reset-password', component: ResetPasswordPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'accounts', component: AccountsPageComponent },
  { path: 'accounts/new', component: NewAccountPageComponent },
  { path: 'accounts/:id/transactions', component: TxListPageComponent },
  { path: 'accounts/:id/edit', component: EditAccountPageComponent },
  { path: 'reports', component: ReportsPageComponent },
  { path: 'reports/income', component: IncomeReportComponent },
  { path: 'reports/balancesheet', component: BalanceSheetReportComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'logout', component: LogoutPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'orgs/new', component: NewOrgPageComponent },
  { path: 'orgs', component: OrgPageComponent },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'tools/reconcile', component: ReconcilePageComponent },
  { path: 'prices', component: PriceDbPageComponent },
  { path: 'transactions/new', component: NewTransactionPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'disabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
