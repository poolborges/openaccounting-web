import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Logger } from '../core/logger';
import { TxItem } from './txitem';
import { TransactionService } from '../core/transaction.service';
import { Transaction } from '../shared/transaction';
import { debounceTime, filter, map, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-tx-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['./autocomplete.scss'],
})
export class AutocompleteComponent {
  @Input() item: TxItem;
  @Input() accountId: string;
  @Output() tx = new EventEmitter<Transaction>();
  public visible: boolean;
  public txs$: Observable<Transaction[]>;

  constructor(private log: Logger, private txService: TransactionService) {}

  ngOnInit() {
    this.txs$ = this.item.edit$.pipe(
      switchMap(() => {
        let control = this.item.form.get('description');
        return this.item.form.get('description').valueChanges;
      }),
      debounceTime(100),
      filter((description) => {
        if (!description || description.length < 3) {
          this.visible = false;
          return false;
        }

        return true;
      }),
      switchMap((description) => {
        this.log.debug('autocomplete', description);

        let options = { limit: 5, descriptionStartsWith: description };
        return this.txService.getTransactionsByAccount(this.accountId, options);
      }),
      map((txs) => {
        let txMap = {};
        return txs.filter((tx) => {
          if (!txMap[tx.description]) {
            txMap[tx.description] = true;
            return true;
          }

          return false;
        });
      }),
      tap((txs) => {
        if (txs.length) {
          this.visible = true;
        }
      }),
    );
  }

  click(tx: Transaction) {
    this.tx.emit(tx);
    this.visible = false;
  }
}
