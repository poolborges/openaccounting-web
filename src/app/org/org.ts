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
import { User } from '../shared/user';
import { Org } from '../shared/org';
import { Invite } from '../shared/invite';
import { AppError } from '../shared/error';
import { Util } from '../shared/util';
import { DateUtil } from '../shared/dateutil';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-org',
  templateUrl: 'org.html',
})
export class OrgPageComponent {
  public currentOrg: Org;
  public orgs: Org[] = [];
  public chooseOrgForm: FormGroup;
  public chooseOrgError: AppError;
  public joinOrgForm: FormGroup;
  public joinOrgError: AppError;
  public inviteForm: FormGroup;
  public inviteFormError: AppError;
  public newOrgForm: FormGroup;
  public newOrgError: AppError;
  public updateOrgForm: FormGroup;
  public updateOrgError: AppError;
  public invites: Invite[];
  public timezones: string[];
  public defaultTz: string;

  constructor(
    private log: Logger,
    private orgService: OrgService,
    private fb: FormBuilder,
  ) {
    this.timezones = DateUtil.getTimezones();
    this.defaultTz = DateUtil.getDefaultTimezone();

    this.invites = null;

    this.updateOrgForm = fb.group({
      name: ['', Validators.required],
      currency: [{ value: '', disabled: true }, Validators.required],
      precision: [{ value: null, disabled: true }, Validators.required],
      timezone: ['', Validators.required],
    });

    this.chooseOrgForm = fb.group({
      id: [null, Validators.required],
    });

    this.joinOrgForm = fb.group({
      inviteId: [null, Validators.required],
    });

    this.inviteForm = fb.group({
      email: [null, Validators.required],
    });

    this.newOrgForm = fb.group({
      name: ['', Validators.required],
      currency: ['', Validators.required],
      precision: [null, Validators.required],
      timezone: [this.defaultTz, Validators.required],
      createDefaultAccounts: [''],
    });
  }

  ngOnInit() {
    this.currentOrg = this.orgService.getCurrentOrg();

    this.updateOrgForm.setValue({
      name: this.currentOrg.name,
      currency: this.currentOrg.currency,
      precision: this.currentOrg.precision,
      timezone: this.currentOrg.timezone,
    });

    this.chooseOrgForm.setValue({ id: this.currentOrg.id });
    this.newOrgForm.setValue({
      name: '',
      currency: this.currentOrg.currency,
      precision: this.currentOrg.precision,
      timezone: this.defaultTz,
      createDefaultAccounts: '',
    });

    this.orgService.getOrgs().subscribe((orgs) => {
      this.orgs = orgs;
    });

    this.orgService.getInvites().subscribe((invites) => {
      this.invites = invites;
    });
  }

  chooseOrgSubmit() {
    this.log.debug('choose new org');
    this.log.debug(this.chooseOrgForm.value.id);
    //this.dataService.setLoading(true);
    this.orgService.selectOrg(this.chooseOrgForm.value.id).subscribe((org) => {
      this.log.debug('new org');
      this.log.debug(org);
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
        next: (org: Org) => {
          console.log('joined org ' + org.id);
        },
        error: (err) => {
          this.joinOrgError = err;
        },
      });
  }

  inviteSubmit() {
    this.log.debug('invite');
    this.log.debug(this.inviteForm.value);

    let invite = new Invite({ email: this.inviteForm.value.email });
    this.orgService.newInvite(invite).subscribe({
      next: (invite) => {
        this.invites.push(invite);
        this.inviteForm.reset();
      },
      error: (err) => {
        this.inviteFormError = err;
      },
    });
  }

  newOrgSubmit() {
    //this.dataService.setLoading(true);
    let org = new Org(this.newOrgForm.value);
    org.id = Util.newGuid();
    this.log.debug(org);

    this.orgService
      .newOrg(org, this.newOrgForm.value['createDefaultAccounts'])
      .subscribe({
        next: (org) => {
          this.log.debug(org);
        },
        error: (error) => {
          //this.dataService.setLoading(false);
          this.log.debug('An error occurred!');
          this.log.debug(error);
          this.newOrgError = error;
        },
      });
  }

  updateOrgSubmit() {
    let org = this.currentOrg;
    org.name = this.updateOrgForm.get('name').value;
    org.timezone = this.updateOrgForm.get('timezone').value;

    this.orgService.updateOrg(org).subscribe({
      next: (org) => {
        this.log.debug(org);
      },
      error: (error) => {
        this.updateOrgError = error;
      },
    });
  }

  deleteInvite(invite: Invite) {
    this.orgService.deleteInvite(invite.id).subscribe({
      next: () => {
        this.invites = this.invites.filter((inv) => {
          return inv.id !== invite.id;
        });
      },
      error: (err) => {
        this.inviteFormError = err;
      },
    });
  }
}
