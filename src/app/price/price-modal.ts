import { Component, Input } from '@angular/core';
import { Logger } from '../core/logger';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppError } from '../shared/error';
import {
  FormControl,
  FormGroup,
  FormArray,
  Validators,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { Util } from '../shared/util';
import { DateUtil } from '../shared/dateutil';
import { PriceService } from '../core/price.service';
import { Price } from '../shared/price';
import { SessionService } from '../core/session.service';
import { Org } from '../shared/org';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-price-modal',
  templateUrl: './price-modal.html',
  styleUrls: ['./price-modal.scss'],
})
export class PriceModalComponent {
  public form: FormGroup;
  public error: AppError;
  public org: Org;
  private originalDate: Date;

  constructor(
    public activeModal: NgbActiveModal,
    private log: Logger,
    private priceService: PriceService,
    private sessionService: SessionService,
    private fb: FormBuilder,
  ) {
    this.org = this.sessionService.getOrg();
    let dateString = DateUtil.getLocalDateString(new Date(), this.org.timezone);

    this.form = fb.group({
      id: [null],
      currency: ['', Validators.required],
      date: [dateString, Validators.required],
      price: [null, Validators.required],
    });
  }

  setData(data: any) {
    console.log(data);
    this.originalDate = data.date;
    this.form.patchValue({
      id: data.id,
      currency: data.currency,
      date: DateUtil.getLocalDateString(data.date, this.org.timezone),
      price: data.price,
    });
  }

  save() {
    this.error = null;

    let date = this.form.value.id ? this.originalDate : new Date();
    let formDate = DateUtil.getDateFromLocalDateString(
      this.form.value.date,
      this.org.timezone,
    );

    if (
      formDate.getTime() &&
      !DateUtil.isSameDay(date, formDate, this.org.timezone)
    ) {
      // make the time be at the very end of the day
      DateUtil.setEndOfDay(formDate, this.org.timezone);
      date = formDate;
    }

    let price = new Price(this.form.value);
    price.date = date;

    if (this.form.value.id) {
      // update
      this.priceService.updatePrice(price).subscribe({
        next: (price) => {
          this.activeModal.close();
        },
        error: (err) => {
          this.error = err;
        },
      });

      return;
    }

    // new price
    price.id = Util.newGuid();

    this.priceService.newPrice(price).subscribe({
      next: (price) => {
        this.activeModal.close();
      },
      error: (err) => {
        this.error = err;
      },
    });
  }
}
