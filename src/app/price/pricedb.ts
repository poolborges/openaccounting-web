import { Component } from '@angular/core';
import { Logger } from '../core/logger';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { SessionService } from '../core/session.service';
import { PriceService } from '../core/price.service';
import { Price } from '../shared/price';
import { Org } from '../shared/org';
import { AppError } from '../shared/error';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PriceModalComponent } from './price-modal';

@Component({
  selector: 'app-pricedb',
  templateUrl: 'pricedb.html',
  styleUrls: ['./pricedb.scss'],
})
export class PriceDbPageComponent {
  public org: Org;
  public currencies$: Observable<string[]>;
  public prices$: { [currency: string]: Observable<Price[]> };
  public error: AppError;
  public multiplier: number;
  private expandedCurrencies: { [currency: string]: boolean };

  constructor(
    private log: Logger,
    private sessionService: SessionService,
    private priceService: PriceService,
    private modalService: NgbModal,
  ) {
    this.org = sessionService.getOrg();
    this.multiplier = Math.pow(10, this.org.precision);
    this.expandedCurrencies = {};

    this.prices$ = {};

    this.currencies$ = this.priceService
      .getPricesNearestInTime(new Date())
      .pipe(
        map((prices: Price[]) => {
          return prices
            .map((price) => {
              return price.currency;
            })
            .sort((a, b) => {
              return a.localeCompare(b);
            });
        }),
        tap((currencies) => {
          currencies.forEach((currency) => {
            this.prices$[currency] = this.priceService
              .getPricesByCurrency(currency)
              .pipe(
                tap((prices) => {
                  this.log.debug('got prices for ' + currency);
                }),
              );
          });
        }),
      );
  }

  isExpanded(currency: string) {
    return this.expandedCurrencies[currency];
  }

  click(currency: string) {
    this.expandedCurrencies[currency] = !this.expandedCurrencies[currency];
  }

  newPrice() {
    let modal = this.modalService.open(PriceModalComponent);

    modal.result.then(
      (result) => {
        this.log.debug('price modal save');
      },
      (reason) => {
        this.log.debug('cancel price modal');
      },
    );
  }

  editPrice(price: Price) {
    let modal = this.modalService.open(PriceModalComponent);

    modal.componentInstance.setData(price);

    modal.result.then(
      (result) => {
        this.log.debug('price modal save');
      },
      (reason) => {
        this.log.debug('cancel price modal');
      },
    );
  }

  deletePrice(price: Price) {
    this.error = null;
    this.priceService.deletePrice(price.id).subscribe({
      next: () => {
        // do nothing
      },
      error: (err) => {
        this.error = err;
      },
    });
  }
}
