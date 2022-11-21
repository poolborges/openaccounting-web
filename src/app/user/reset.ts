import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { AppError } from '../shared/error';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: 'reset.html',
})
export class ResetPasswordPageComponent {
  public error: AppError;
  public success: boolean;
  public changePasswordForm: FormGroup;
  private code: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
  ) {
    this.route.queryParams.subscribe({
      next: (params) => {
        this.code = params['code'];

        if (!this.code) {
          throw new Error('Missing code');
        }
      },
      error: (err) => {
        this.error = err;
      },
    });

    this.changePasswordForm = this.fb.group(
      {
        password: [null, Validators.required],
        password2: [null, Validators.required],
      },
      {
        validator: this.passwordMatchValidator,
      },
    );
  }

  passwordMatchValidator(control: AbstractControl) {
    if (control.get('password').value === control.get('password2').value) {
      return null;
    } else {
      control.get('password2').setErrors({ mismatchedPassword: true });
    }
  }

  changePassword() {
    this.userService
      .confirmResetPassword(this.changePasswordForm.value.password, this.code)
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
