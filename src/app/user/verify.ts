import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppError } from '../shared/error';
import { UserService } from '../core/user.service';
import { SessionService } from '../core/session.service';
import { Util } from '../shared/util';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-verifyuser',
  templateUrl: 'verify.html',
})
export class VerifyUserPageComponent {
  public error: AppError;
  public success: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private sessionService: SessionService,
  ) {
    let code = null;

    this.route.queryParams
      .pipe(
        switchMap((params) => {
          code = params['code'];

          if (!code) {
            throw new Error('Missing code');
          }

          return this.userService.verifyUser(code);
        }),
        switchMap(() => {
          let sessionId = Util.newGuid();
          return this.sessionService.login(code, '', sessionId);
        }),
      )
      .subscribe({
        next: () => {
          this.success = true;
        },
        error: (err) => {
          this.error = err;
        },
      });
  }
}
