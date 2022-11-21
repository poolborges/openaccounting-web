import { Component, ViewChild, ElementRef } from '@angular/core';
import { Logger } from '../core/logger';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AccountService } from '../core/account.service';
import { OrgService } from '../core/org.service';
import { TransactionService } from '../core/transaction.service';
import { Account, AccountApi, AccountTree } from '../shared/account';
import { Transaction } from '../shared/transaction';
import { Org } from '../shared/org';
import { AppError } from '../shared/error';
import { Util } from '../shared/util';
import { DateUtil } from '../shared/dateutil';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ReconcileModalComponent } from './reconcile-modal';
import { Reconciliation } from './reconciliation';
import { SessionService } from '../core/session.service';
import { from, mergeMap, Observable } from 'rxjs';

@Component({
  selector: 'app-reconcile',
  templateUrl: 'reconcile.html',
})
export class ReconcilePageComponent {
  public accountForm: FormGroup;
  public newReconcile: FormGroup;
  public selectAccounts: any[];
  public account: Account;
  public pastReconciliations: Reconciliation[];
  public unreconciledTxs: Transaction[];
  public error: AppError;
  public org: Org;
  private accountTree: AccountTree;
  @ViewChild('confirmDeleteModal') confirmDeleteModal: ElementRef;

  constructor(
    private router: Router,
    private log: Logger,
    private accountService: AccountService,
    private orgService: OrgService,
    private txService: TransactionService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private sessionService: SessionService,
  ) {
    this.org = this.orgService.getCurrentOrg();
    this.accountForm = fb.group({
      accountId: [null, Validators.required],
    });

    this.newReconcile = fb.group({
      startDate: ['', Validators.required],
      startBalance: [{ value: 0, disabled: true }, Validators.required],
      endDate: ['', Validators.required],
      endBalance: [0, Validators.required],
    });

    this.accountService.getAccountTree().subscribe((tree) => {
      this.accountTree = tree;
      this.selectAccounts = tree.getFlattenedAccounts();
    });
  }

  onChooseAccount() {
    let account = this.accountTree.accountMap[this.accountForm.value.accountId];

    if (!account) {
      this.error = new AppError('Invalid account');
      return;
    }

    this.account = account;

    this.processTransactions();
  }

  startReconcile() {
    let value = this.newReconcile.getRawValue();

    let rec = new Reconciliation();
    rec.startDate = DateUtil.getDateFromLocalDateString(
      value.startDate,
      this.org.timezone,
    );
    rec.endDate = DateUtil.getDateFromLocalDateString(
      value.endDate,
      this.org.timezone,
    );
    rec.startBalance = Math.round(
      parseFloat(value.startBalance) * Math.pow(10, this.account.precision),
    );
    rec.endBalance = Math.round(
      parseFloat(value.endBalance) * Math.pow(10, this.account.precision),
    );

    this.log.debug(rec);

    let modal = this.modalService.open(ReconcileModalComponent, { size: 'lg' });

    modal.componentInstance.setData(this.account, rec, this.unreconciledTxs);

    modal.result.then(
      (txs) => {
        this.log.debug('reconcile modal save');
        rec.txs = txs;

        this.pastReconciliations.unshift(rec);

        this.newReconcile.patchValue({
          startDate: DateUtil.getLocalDateString(
            rec.endDate,
            this.org.timezone,
          ),
          startBalance: rec.endBalance / Math.pow(10, this.account.precision),
          endBalance: 0,
          endDate: '',
        });
      },
      (reason) => {
        this.log.debug('cancel reconcile modal');
      },
    );
  }

  processTransactions() {
    // Get all transactions for account
    // Figure out reconciliations
    //    startDate is date of first transaction
    //    add up reconciled splits for given endDate to get endBalance
    // sort by most recent first
    // most recent endDate is used for startDate
    // most recent endBalance is used for startBalance
    // guess at next endDate

    this.unreconciledTxs = [];
    this.pastReconciliations = [];

    this.txService
      .getTransactionsByAccount(this.account.id)
      .subscribe((txs) => {
        let reconcileMap: { [date: number]: Reconciliation } = {};

        let firstStartDate: Date = null;
        let firstEndDate: Date = null;

        txs.forEach((tx) => {
          if (!firstStartDate || (!firstEndDate && tx.date < firstStartDate)) {
            firstStartDate = tx.date;
          }

          let data = tx.getData();

          if (!data.reconciledSplits) {
            this.unreconciledTxs.push(tx);
            return;
          }

          let reconciled = true;
          let splitIndexes = Object.keys(data.reconciledSplits).map((index) =>
            parseInt(index),
          );

          tx.splits.forEach((split, index) => {
            if (split.accountId !== this.account.id) {
              return;
            }

            if (splitIndexes.indexOf(index) === -1) {
              reconciled = false;
              return;
            }

            let endDate = new Date(data.reconciledSplits[index]);

            if (!firstEndDate || endDate < firstEndDate) {
              firstEndDate = endDate;
              firstStartDate = new Date(tx.date);
            }

            if (
              endDate.getTime() === firstEndDate.getTime() &&
              tx.date < firstStartDate
            ) {
              firstStartDate = new Date(tx.date);
            }

            if (!reconcileMap[endDate.getTime()]) {
              reconcileMap[endDate.getTime()] = new Reconciliation();
              reconcileMap[endDate.getTime()].endDate = endDate;
              reconcileMap[endDate.getTime()].net = 0;
            }

            let r = reconcileMap[endDate.getTime()];

            r.txs.push(tx);

            if (this.account.debitBalance) {
              r.net += split.amount;
            } else {
              r.net -= split.amount;
            }
          });

          if (!reconciled) {
            this.unreconciledTxs.push(tx);
          }
        });

        // Figure out starting date, beginning balance and ending balance
        let dates = Object.keys(reconcileMap)
          .sort((a, b) => {
            return parseInt(a) - parseInt(b);
          })
          .map((time) => {
            return new Date(parseInt(time));
          });

        if (!dates.length) {
          if (firstStartDate) {
            this.newReconcile.patchValue({
              startDate: DateUtil.getLocalDateString(
                firstStartDate,
                this.org.timezone,
              ),
            });
          }
          return;
        }

        let firstRec = reconcileMap[dates[0].getTime()];
        firstRec.startDate = firstStartDate;
        firstRec.startBalance = 0;
        firstRec.endBalance = firstRec.net;

        this.pastReconciliations.unshift(firstRec);

        let lastRec = firstRec;

        for (let i = 1; i < dates.length; i++) {
          let rec = reconcileMap[dates[i].getTime()];
          rec.startDate = new Date(lastRec.endDate);
          rec.startBalance = lastRec.endBalance;
          rec.endBalance = rec.startBalance + rec.net;
          this.pastReconciliations.unshift(rec);
          lastRec = rec;
        }

        this.newReconcile.patchValue({
          startDate: DateUtil.getLocalDateString(
            lastRec.endDate,
            this.org.timezone,
          ),
          startBalance:
            lastRec.endBalance / Math.pow(10, this.account.precision),
        });
      });
  }

  delete() {
    this.modalService.open(this.confirmDeleteModal).result.then(
      (result) => {
        this.sessionService.setLoading(true);

        let rec = this.pastReconciliations[0];

        from(rec.txs)
          .pipe(
            mergeMap((tx) => {
              let oldId = tx.id;
              tx.id = Util.newGuid();

              let data = tx.getData();

              let newSplits = {};

              for (let splitId in data.reconciledSplits) {
                if (tx.splits[splitId].accountId !== this.account.id) {
                  newSplits[splitId] = tx.splits[splitId];
                }
              }

              data.reconciledSplits = newSplits;

              tx.setData(data);

              return this.txService.putTransaction(oldId, tx);
            }, 8),
          )
          .subscribe({
            next: (tx) => {
              this.log.debug('Saved tx ' + tx.id);
            },
            error: (err) => {
              this.error = err;
              this.sessionService.setLoading(false);
            },
            complete: () => {
              this.pastReconciliations.shift();
              let lastRec = this.pastReconciliations[0];

              if (lastRec) {
                this.newReconcile.patchValue({
                  startDate: DateUtil.getLocalDateString(
                    lastRec.endDate,
                    this.org.timezone,
                  ),
                  startBalance:
                    lastRec.endBalance / Math.pow(10, this.account.precision),
                });
              } else {
                this.newReconcile.patchValue({
                  startDate: null,
                  startBalance: 0,
                });
              }

              this.sessionService.setLoading(false);
            },
          });
      },
      (reason) => {
        this.log.debug('cancel delete');
      },
    );
  }
}
