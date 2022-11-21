import { Component } from '@angular/core';
import { AccountService } from '../core/account.service';
import { OrgService } from '../core/org.service';
import { ConfigService } from '../core/config.service';
import { SessionService } from '../core/session.service';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Account } from '../shared/account';
import { Org } from '../shared/org';
import { TxListPageComponent } from '../transaction/list';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AppError } from '../shared/error';
import { DateUtil } from '../shared/dateutil';

@Component({
  selector: 'app-balancesheet',
  templateUrl: 'balancesheet.html',
  styleUrls: ['./reports.scss'],
})
export class BalanceSheetReportComponent {
  public org: Org;
  public date: Date;
  public assetAccount: Account;
  public assetAccounts: Account[] = [];
  public liabilityAccount: Account;
  public liabilityAccounts: Account[] = [];
  public equityAccount: Account;
  public equityAccounts: Account[] = [];
  public amounts: any = {};
  public form: FormGroup;
  public error: AppError;
  public showOptionsForm: boolean = false;
  private treeSubscription: Subscription;
  private priceSource: string;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private orgService: OrgService,
    private configService: ConfigService,
    private sessionService: SessionService,
  ) {
    this.date = new Date();
    this.priceSource = 'price';

    let reportData = this.configService.get('reportData');

    if (reportData && reportData.balanceSheet) {
      let reportConfig = reportData.balanceSheet;
      if (reportConfig.date) {
        this.date = new Date(reportConfig.date);
      }

      if (reportConfig.priceSource) {
        this.priceSource = reportConfig.priceSource;
      }
    }

    this.org = this.orgService.getCurrentOrg();

    this.form = fb.group({
      date: [
        DateUtil.getLocalDateStringExcl(this.date, this.org.timezone),
        Validators.required,
      ],
      priceSource: [this.priceSource, Validators.required],
    });
  }

  onInit() {
    this.sessionService.setLoading(true);
    this.amounts = {};
    this.assetAccount = null;

    this.treeSubscription = this.accountService
      .getAccountTreeAtDate(this.date)
      .subscribe((tree) => {
        this.sessionService.setLoading(false);
        this.assetAccount = tree.getAccountByName('Assets', 1);
        this.assetAccounts = tree.getFlattenedAccounts(this.assetAccount);

        this.liabilityAccount = tree.getAccountByName('Liabilities', 1);
        this.liabilityAccounts = tree.getFlattenedAccounts(
          this.liabilityAccount,
        );

        this.equityAccount = tree.getAccountByName('Equity', 1);
        this.equityAccounts = tree.getFlattenedAccounts(this.equityAccount);

        let incomeAccount = tree.getAccountByName('Income', 1);
        let expenseAccount = tree.getAccountByName('Expenses', 1);

        let retainedEarnings = new Account({
          id: 'Retained Earnings',
          name: 'Retained Earnings',
          depth: 2,
          children: [null], // hack to fool template into not displaying a link
          totalNativeBalanceCost:
            incomeAccount.totalNativeBalanceCost +
            expenseAccount.totalNativeBalanceCost,
          totalNativeBalancePrice:
            incomeAccount.totalNativeBalancePrice +
            expenseAccount.totalNativeBalancePrice,
        });

        let unrealizedGains = new Account({
          id: 'Unrealized Gains',
          name: 'Unrealized Gains',
          depth: 2,
          children: [null], // hack to fool template into not displaying a link
          totalNativeBalanceCost: -(
            this.assetAccount.totalNativeBalanceCost +
            this.liabilityAccount.totalNativeBalanceCost +
            this.equityAccount.totalNativeBalanceCost +
            retainedEarnings.totalNativeBalanceCost
          ),
          totalNativeBalancePrice: -(
            this.assetAccount.totalNativeBalancePrice +
            this.liabilityAccount.totalNativeBalancePrice +
            this.equityAccount.totalNativeBalancePrice +
            retainedEarnings.totalNativeBalancePrice
          ),
        });

        this.equityAccounts.push(retainedEarnings);
        this.equityAccounts.push(unrealizedGains);

        // TODO is this modifying a tree that might be used elsewhere?
        // Not all functions are pure...
        this.equityAccount.totalNativeBalanceCost =
          -this.assetAccount.totalNativeBalanceCost -
          this.liabilityAccount.totalNativeBalanceCost;
        this.equityAccount.totalNativeBalancePrice =
          -this.assetAccount.totalNativeBalancePrice -
          this.liabilityAccount.totalNativeBalancePrice;

        // this.dataService.setLoading(false);
      });
  }

  onSubmit() {
    this.treeSubscription.unsubscribe();
    //this.dataService.setLoading(true);
    this.showOptionsForm = false;
    this.date = DateUtil.getDateFromLocalDateStringExcl(
      this.form.value.date,
      this.org.timezone,
    );
    this.priceSource = this.form.value.priceSource;

    let reportData = this.configService.get('reportData');

    if (!reportData) {
      reportData = {};
    }

    reportData.balanceSheet = {
      date: this.date,
      priceSource: this.priceSource,
    };

    this.configService.put('reportData', reportData);

    this.onInit();
  }

  toggleShowOptionsForm() {
    this.showOptionsForm = !this.showOptionsForm;
  }
}
