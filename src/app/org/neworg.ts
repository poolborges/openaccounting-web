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
import { OrgService } from '../core/org.service';
import { Org } from '../shared/org';
import { AppError } from '../shared/error';
import { Util } from '../shared/util';
import { DateUtil } from '../shared/dateutil';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-neworg',
  templateUrl: 'neworg.html',
})
export class NewOrgPageComponent {
  public form: FormGroup;
  public error: AppError;
  public joinOrgForm: FormGroup;
  public joinOrgError: AppError;
  public timezones: string[];
  public defaultTz: string;

  constructor(
    private log: Logger,
    private orgService: OrgService,
    private fb: FormBuilder,
  ) {
    this.timezones = DateUtil.getTimezones();
    this.defaultTz = DateUtil.getDefaultTimezone();

    this.form = fb.group({
      name: ['', Validators.required],
      currency: ['USD', Validators.required],
      precision: [2, Validators.required],
      timezone: [this.defaultTz, Validators.required],
      createDefaultAccounts: ['business'],
    });

    this.joinOrgForm = fb.group({
      inviteId: [null, Validators.required],
    });
  }

  onSubmit() {
    //this.dataService.setLoading(true);
    let org = new Org(this.form.value);
    org.id = Util.newGuid();

    this.log.debug(org);

    this.orgService
      .newOrg(org, this.form.value['createDefaultAccounts'])
      .subscribe({
        next: (org: Org) => {
          this.log.debug(org);
        },
        error: (error) => {
          //this.dataService.setLoading(false);
          this.log.debug('An error occurred!');
          this.log.debug(error);
          this.error = error;
        },
      });
  }

  joinOrgSubmit() {
    this.log.debug('join org');
    this.log.debug(this.joinOrgForm.value.id);
    this.orgService
      .acceptInvite(this.joinOrgForm.value.inviteId)
      .pipe(
        switchMap((invite) => {
          return this.orgService.selectOrg(invite.orgId);
        }),
      )
      .subscribe({
        next: (org) => {
          console.log('joined org ' + org.id);
        },
        error: (err) => {
          this.joinOrgError = err;
        },
      });
  }
}
