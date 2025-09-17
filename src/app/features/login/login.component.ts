import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showPassword = false;
  slides = [
    {
      img: '../assets/images/login-banner-img.png',
      caption: 'Enhance your premises security',
      text: 'AI-powered real-time intrusion detection.'
    },
    {
      img: '../assets/images/login-banner-img.png',
      caption: 'Another feature',
      text: 'Your description here.'
    }
  ];

  userName: string = '';
  password: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, public commonService: CommonService) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/Zone/dashboard']);
      return;
    }
  }

  resetValidation() {
    const fields = ['userNameRequired', 'passwordRequired'];
    this.commonService.hideErrors(['userNameRequired', 'passwordRequired'])
  }

  validateLogin() {
    this.resetValidation();
    let isValid = true;
    let userName = document.getElementById('userNameRequired');
    let password = document.getElementById('passwordRequired');

    if (!this.userName) {
      userName?.classList.remove('d-none');
      isValid = false;
    }
    if (!this.password) {
      password?.classList.remove('d-none');
      isValid = false;
    }
    return isValid;
  }

  isSigninLoaderDisplay: boolean = false;
  async login() {
    /* const licenseValid = await this.getValidLicenseInfo();
    if (!licenseValid) {
      return;
    } */
    if (this.validateLogin()) {
      const model = {
        'UserName': this.userName,
        'Password': this.password
      }
      this.isSigninLoaderDisplay = true;
      this.authService.login(model).subscribe({
        next: (res: any) => {
          this.isSigninLoaderDisplay = false;
          if (res.statusCode == 200) {
            this.authService.setToken(res.data.token);
            this.router.navigate(['/Zone/dashboard']);
          }
        },
        error: (error) => {
          if (error?.status === 401) {
            const invalidCred = document.getElementById('invalidCred') as HTMLElement;
            if (invalidCred) {
              invalidCred.classList.remove('d-none');
            }
          }
          this.isSigninLoaderDisplay = false;
        }
      })

    }
  }

  test(event:any){
    console.log(event)
  }

}
