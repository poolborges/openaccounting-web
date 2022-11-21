import { Component, OnInit } from '@angular/core';
import { Logger } from '../core/logger';
import { TransactionService } from '../core/transaction.service';
import { AccountService } from '../core/account.service';
import { OrgService } from '../core/org.service';
import { SessionService } from '../core/session.service';
import { Transaction, Split } from '../shared/transaction';
import { Org } from '../shared/org';
import { Account, AccountTree } from '../shared/account';
import { DateUtil } from '../shared/dateutil';
import { TxListPageComponent } from '../transaction/list';
import { IncomeReportComponent } from '../reports/income';
import { map, Observable, switchMap, take, tap } from 'rxjs';

class RecentTx {
  split: Split;
  account: Account;
  tx: Transaction;
  hidden: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardPageComponent implements OnInit {
  public org: Org;
  public expenseAmount: number;
  public budgetExpanded: boolean = false;
  public recentExpanded: boolean = false;
  public expenseAccounts: Account[] = [];
  public hiddenExpenses: any = {};
  public recentTxs: RecentTx[];
  private numBudgetItems: number = 5;
  private numSplits: number = 5;

  constructor(
    private log: Logger,
    private txService: TransactionService,
    private accountService: AccountService,
    private orgService: OrgService,
    private sessionService: SessionService,
  ) {}

  ngOnInit() {
    this.sessionService.setLoading(true);
    this.log.debug('dashboard init');

    this.org = this.orgService.getCurrentOrg();
    this.log.debug('org', this.org);

    let periodStart = DateUtil.getPeriodStart(this.org.timezone);

    let tree$ =
      this.accountService.getAccountTreeWithPeriodBalance(periodStart);

    tree$
      .pipe(
        tap((tree: AccountTree) => {
          let expenses = tree.getAccountByName('Expenses', 1);

          this.expenseAmount = expenses.totalNativeBalanceCost;

          this.expenseAccounts = tree
            .getFlattenedAccounts()
            .filter((account) => {
              return (
                tree.accountIsChildOf(account, expenses) &&
                account.recentTxCount
              );
            })
            .sort((a, b) => {
              return b.recentTxCount - a.recentTxCount;
            })
            .slice(0, this.numBudgetItems * 2);

          this.hiddenExpenses = {};

          this.expenseAccounts.forEach((account, index) => {
            if (index >= this.numBudgetItems) {
              this.hiddenExpenses[account.id] = true;
            }
          });
        }),
        switchMap((tree) => {
          let expenses = tree.getAccountByName('Expenses', 1);
          let income = tree.getAccountByName('Income', 1);

          return this.txService.getLastTransactions(this.numSplits * 4).pipe(
            take(1),
            map((txs: Transaction[]) => {
              this.log.debug('lastTxs');
              this.log.debug(txs);
              return txs
                .map((tx) => {
                  let splits = tx.splits.filter((split) => {
                    let account = tree.accountMap[split.accountId];
                    if (!account || !split.amount) {
                      return false;
                    }

                    return (
                      tree.accountIsChildOf(account, expenses) ||
                      tree.accountIsChildOf(account, income)
                    );
                  });

                  // If it's not an income or expense transaction but it has 2 splits we can still display something
                  if (!splits.length && tx.splits.length === 2) {
                    splits = tx.splits.filter((split) => {
                      return split.amount < 0;
                    });
                  }

                  return splits.map((split) => {
                    let recentTx = new RecentTx();
                    recentTx.split = split;
                    recentTx.account = tree.accountMap[split.accountId];
                    recentTx.tx = tx;
                    return recentTx;
                  });
                })
                .reduce((acc, recentTxs) => {
                  return acc.concat(recentTxs);
                }, []);
            }),
            map((recentTxs: RecentTx[]) => {
              return recentTxs.slice(0, this.numSplits * 2);
            }),
            map((recentTxs: RecentTx[]) => {
              return recentTxs.map((recentTx, index) => {
                if (index >= this.numSplits) {
                  recentTx.hidden = true;
                }

                return recentTx;
              });
            }),
          );
        }),
      )
      .subscribe((recentTxs: RecentTx[]) => {
        this.log.debug('recentTxs', recentTxs);
        this.recentTxs = recentTxs;
        this.sessionService.setLoading(false);
      });
  }

  toggleExpandedBudget() {
    this.budgetExpanded = !this.budgetExpanded;
  }

  toggleExpandedRecent() {
    this.recentExpanded = !this.recentExpanded;
  }
}
