import { Component } from '@angular/core';
import { AccountService } from '../core/account.service';
import { OrgService } from '../core/org.service';
import { ConfigService } from '../core/config.service';
import { SessionService } from '../core/session.service';
import { Observable } from 'rxjs';
import { Subscription, zip } from 'rxjs';
import { Account, AccountTree } from '../shared/account';
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
  selector: 'app-income',
  templateUrl: 'income.html',
  styleUrls: ['./reports.scss'],
})
export class IncomeReportComponent {
  public org: Org;
  public startDate: Date;
  public endDate: Date;
  public incomeAccount: Account;
  public incomeAccounts: Account[] = [];
  public expenseAccount: Account;
  public expenseAccounts: Account[] = [];
  public form: FormGroup;
  public error: AppError;
  public showDateForm: boolean = false;
  private treeSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private orgService: OrgService,
    private configService: ConfigService,
    private sessionService: SessionService,
  ) {}

  ngOnInit() {
    this.sessionService.setLoading(true);
    this.org = this.orgService.getCurrentOrg();

    this.startDate = new Date();
    DateUtil.setFirstOfMonth(this.startDate, this.org.timezone);
    DateUtil.setBeginOfDay(this.startDate, this.org.timezone);
    this.endDate = DateUtil.getOneMonthLater(this.startDate, this.org.timezone);

    let reportData = this.configService.get('reportData');

    if (reportData && reportData.income) {
      let reportConfig = reportData.income;
      if (reportConfig.startDate) {
        this.startDate = new Date(reportConfig.startDate);
      }

      if (reportConfig.endDate) {
        this.endDate = new Date(reportConfig.endDate);
      }
    }

    this.form = this.fb.group({
      startDate: [
        DateUtil.getLocalDateString(this.startDate, this.org.timezone),
        Validators.required,
      ],
      endDate: [
        DateUtil.getLocalDateStringExcl(this.endDate, this.org.timezone),
        Validators.required,
      ],
    });

    this.treeSubscription = this.accountService
      .getAccountTreeWithPeriodBalance(this.startDate, this.endDate)
      .subscribe((tree) => {
        this.sessionService.setLoading(false);
        this.incomeAccount = tree.getAccountByName('Income', 1);
        this.incomeAccounts = tree.getFlattenedAccounts(this.incomeAccount);
        this.expenseAccount = tree.getAccountByName('Expenses', 1);
        this.expenseAccounts = tree.getFlattenedAccounts(this.expenseAccount);
      });
  }

  toggleShowDateForm() {
    this.showDateForm = !this.showDateForm;
  }

  onSubmit() {
    this.treeSubscription.unsubscribe();
    //this.dataService.setLoading(true);
    this.showDateForm = false;
    this.startDate = DateUtil.getDateFromLocalDateString(
      this.form.value.startDate,
      this.org.timezone,
    );
    this.endDate = DateUtil.getDateFromLocalDateStringExcl(
      this.form.value.endDate,
      this.org.timezone,
    );

    let reportData = this.configService.get('reportData');

    if (!reportData) {
      reportData = {};
    }

    reportData.income = {
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.configService.put('reportData', reportData);

    this.ngOnInit();
  }
}
