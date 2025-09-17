import { Component, AfterViewInit, Renderer2, ElementRef, HostListener, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsComponent } from '../../shared/components/icons/icons.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';
import { UserService } from '../../core/services/user.service';
import { CommonService } from '../../core/services/common.service';
declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, IconsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Output() triggerLiveEvent = new EventEmitter<void>();
  pageTitle: string = '';
  showViewToggle = false;
  private routerSub!: Subscription;
  userName: any;
  userId: any;
  userModel: User = new User()
  isEditCase: boolean = false;
  updatedFields: { [key: string]: string } = {};
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMsg = '';
  successMsg = '';

  isPasswordValid: boolean = true;
  isConfPasswordValid: boolean = true;
  @ViewChild('editpasswordInput') editpasswordInput!: ElementRef;
  @ViewChild('edittoggleIcon') edittoggleIcon!: ElementRef;
  @ViewChild('editconfpasswordInput') editconfpasswordInput!: ElementRef;
  @ViewChild('editconftoggleIcon') editconftoggleIcon!: ElementRef;
  @ViewChild('oldPasswordInput') oldPasswordInput!: ElementRef;
  @ViewChild('oldPassToggleIcon') oldPassToggleIcon!: ElementRef;
  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, private authService: AuthService, private userService: UserService, public commonService: CommonService) {


  }
  ngOnDestroy(): void {
    if (this.routerSub)
      this.routerSub.unsubscribe();
  }

  ngOnInit(): void {
    this.userName = this.authService.getUserPayload()?.UserName;
    this.userId = this.authService.getUserPayload()?.UserId;
  }

  toggleSlide(): void {
    const slidingDiv = document.getElementById('pageBody');
    const viewportWidth = window.innerWidth;
    if (slidingDiv) {
      slidingDiv.classList.toggle('fullscreen');
      if (slidingDiv.classList.contains('fullscreen')) {
        const openSubmenus = document.querySelectorAll('.accordion-collapse.show');
        openSubmenus.forEach((submenu) => {
          submenu.classList.remove('show');
        });
      }
      if (viewportWidth <= 767) {
        slidingDiv.classList.remove('fullscreen');
        slidingDiv.classList.toggle('mobilescreen');
      }
    } else {
      console.warn('#pageBody not found');
    }
  }
  ngAfterViewInit(): void {
    this.checkAndApplyFullscreen();
    this.setupSidebarHover();
  }
  @HostListener('window:resize')
  onResize() {
    this.checkAndApplyFullscreen();
  }
  @HostListener('window:load')
  onLoad() {
    this.checkAndApplyFullscreen();
  }
  checkAndApplyFullscreen(): void {
    const slidingDiv = document.getElementById('pageBody');
    const viewportWidth = window.innerWidth;
    if (slidingDiv) {
      if (viewportWidth >= 768) {
        slidingDiv.classList.add('fullscreen');
      } else {
        slidingDiv.classList.remove('fullscreen');
      }
    }
  }
  setupSidebarHover(): void {
    const sidebarItems = this.el.nativeElement.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item: HTMLElement) => {
      this.renderer.listen(item, 'mouseenter', () => {
        const pageBody = document.getElementById('pageBody');
        const submenu = item.querySelector('.accordion-collapse');
        if (pageBody?.classList.contains('fullscreen') && submenu) {
          submenu.classList.add('show');
        }
      });
      this.renderer.listen(item, 'mouseleave', () => {
        const pageBody = document.getElementById('pageBody');
        const submenu = item.querySelector('.accordion-collapse');
        if (pageBody?.classList.contains('fullscreen') && submenu) {
          submenu.classList.remove('show');
        }
      });
    });
  }



  oldTogglePasswordVisibility(): void {
    // const editinputEl = this.oldPasswordInput.nativeElement;
    // const editiconEl = this.oldPassToggleIcon.nativeElement;

    // if (editinputEl.type === 'password') {
    //   editinputEl.type = 'text';
    //   editiconEl.classList.remove('bi-eye-slash-fill');
    //   editiconEl.classList.add('bi-eye');
    // } else {
    //   editinputEl.type = 'password';
    //   editiconEl.classList.remove('bi-eye');
    //   editiconEl.classList.add('bi-eye-slash-fill');
    // }
  }

  openProfileModal() {
    const modalElement = document.getElementById('editProfile');
    if (modalElement) {
      const myModal = new bootstrap.Modal(modalElement);
      myModal.show();
      this.isEditCase = true;
      this.getUserById(this.userId);
    }
  }

  getUserById(id: any) {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.userService.GetUserByUserId(id).subscribe({
      next: (res) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        if (res.statusCode == 200) {
          this.userId = res?.data?.userId;
          this.userModel.userName = res?.data?.userName;
          this.userModel.phoneNumber = res?.data?.phoneNumber;
          this.userModel.emailId = res?.data?.emailId;
        }
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        console.log(error);
      }
    })
  }
  onChange(event: any, field: any) {
    this.updatedFields[field] = event;
  }

  validateUser() {
    this.hideAllErrorFields();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    // Edit Case Specific Validations
    if (this.isEditCase) {
      if (!this.userModel.userName) {
        this.commonService.showErrors(['userRequired'])
        valid = false;
      }
      if (this.userModel.emailId && !emailPattern.test(this.userModel.emailId)) {
        this.commonService.showErrors(['emailValid'])
        valid = false;
      }
      if (!this.userModel.phoneNumber) {
        this.commonService.showErrors(['phoneRequired'])
        valid = false;
      }
      if (this.userModel.phoneNumber && this.userModel.phoneNumber.length < 10) {
        this.commonService.showErrors(['phoneRequired']);
        valid = false;
      }
      /* if (this.password && !passwordRegex.test(this.password)) {
        this.commonService.showError('editPassValid')
        valid = false;
      } */
      // if (this.password && !this.confirmPassword) {
      //   this.commonService.showError('editConfirmPassRequired')
      //   valid = false;
      // }
    }
    return valid;
  }


  updateUser() {
    if (this.validateUser()) {
      document.getElementById('overlayloader')?.classList.remove('d-none');
      this.userService.updateUser(this.userId, this.updatedFields).subscribe({
        next: (res) => {
          document.getElementById('overlayloader')?.classList.add('d-none');
          if (res.statusCode == 200) {
            this.closeProfileModal();
          } else if (res.statusCode == 302) {
            const conflicts = res.data?.conflicts || [];
            if (conflicts.includes("Phone")) {
              this.commonService.showErrors(['phoneExists'])
            }
            if (conflicts.includes('EmailId')) {
              this.commonService.showErrors(['emailIdExists']);
            }
          }
        },
        error: (error) => {
          document.getElementById('overlayloader')?.classList.add('d-none');
          console.log(error)
        }
      })
    }
  }


  closeProfileModal() {
    const modalElement = document.getElementById('editProfile');
    if (modalElement) {
      const myModal = bootstrap.Modal.getInstance(modalElement);
      if (myModal) {
        myModal.hide();
      }
      this.isEditCase = false;
      this.reset();
    }
  }
  reset() {
    this.userModel = new User();
    this.updatedFields = {};
    this.hideAllErrorFields();
    if (this.isEditCase) {
      this.getUserById(this.userId);
    }
  }


  hideAllErrorFields() {
    const field = ['userRequired', 'userExists', 'phoneRequired', 'phoneExists', 'emailValid', 'emailIdExists', 'passRequired', 'passValid', 'oldPassworderrormsg', 'newPasswordRequareerrormsg', 'newPasswordFormaterrormsg', 'confmPassworderrormsg']
    this.commonService.hideErrors(field);
  }

  openChangePasswordModal() {
    const modalElement = document.getElementById('changePasswordModal');
    if (modalElement) {
      const myModal = new bootstrap.Modal(modalElement);
      myModal.show();
    }
  }

  closeChangePasswordModal() {
    const modalElement = document.getElementById('changePasswordModal');
    if (modalElement) {
      const myModal = bootstrap.Modal.getInstance(modalElement);
      if (myModal) {
        myModal.hide();
      }
      this.resetPasswordFiels();
    }
  }

  resetPasswordFiels() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.hideAllErrorFields();
  }

  logout() {
    this.authService.deleteToken();
    this.router.navigate(['/Zone/login'])
  }

  validatePasswordForm(): boolean {
    if (this.oldPassword == "" || this.oldPassword == null || this.oldPassword == undefined) {
      this.commonService.showErrors(['oldPassworderrormsg']);
      return false;
    }
    this.validatePassword();
    this.validateConfPassword();

    return !!(this.newPassword && this.confirmPassword && this.isPasswordValid && this.isConfPasswordValid);
  }

  changePassword() {
    if (this.validatePasswordForm()) {
      const jsonData = {
        'UserName': this.authService.getUserPayload()?.UserName,
        'OldPassword': this.oldPassword,
        'NewPassword': this.newPassword,
        'ConfirmPassword': this.confirmPassword
      }
      document.getElementById('overlayloader')?.classList.remove('d-none');
      this.userService.changePassword(jsonData).subscribe({
        next: (res) => {
          document.getElementById('overlayloader')?.classList.add('d-none');
          if (res.statusCode == 200) {
            this.successMsg = res.message;
            setTimeout(() => {
              this.closeChangePasswordModal();
              this.successMsg = '';
            }, 1000);
          } else {
            this.errorMsg = res.message;
          }
        }, error: (error) => {
          document.getElementById('overlayloader')?.classList.add('d-none');
          this.errorMsg = "Something went wrong. Please contact your administrator.";
        }
      })
    }
  }

  validatePassword() {
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,}$/;

    if (!this.newPassword) {
      this.isPasswordValid = false;
      this.commonService.showErrors(['newPasswordRequareerrormsg']);
      this.commonService.hideErrors(['newPasswordFormaterrormsg']);
      return;
    }

    this.commonService.hideErrors(['newPasswordRequareerrormsg']);

    // if (!passwordRegex.test(this.newPassword)) {
    //   this.isPasswordValid = false;
    //   this.commonService.showError('newPasswordFormaterrormsg');
    // } else {
    //   this.isPasswordValid = true;
    //   this.commonService.hideError('newPasswordFormaterrormsg');
    // }
  }

  validateConfPassword() {
    if (!this.confirmPassword) {
      this.isConfPasswordValid = false;
      this.commonService.showErrors(['confmPassworderrormsg']);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.isConfPasswordValid = false;
      this.commonService.showErrors(['confmPassworderrormsg']);
    } else {
      this.isConfPasswordValid = true;
      this.commonService.hideErrors(['confmPassworderrormsg']);
    }
  }

  edittogglePasswordVisibility(): void {
    const editinputEl = this.editpasswordInput.nativeElement;
    const editiconEl = this.edittoggleIcon.nativeElement;

    if (editinputEl.type === 'password') {
      editinputEl.type = 'text';
      editiconEl.classList.remove('bi-eye-slash-fill');
      editiconEl.classList.add('bi-eye');
    } else {
      editinputEl.type = 'password';
      editiconEl.classList.remove('bi-eye');
      editiconEl.classList.add('bi-eye-slash-fill');
    }
  }

  editconftogglePasswordVisibility(): void {
    const editinputEl = this.editconfpasswordInput.nativeElement;
    const editiconEl = this.editconftoggleIcon.nativeElement;

    if (editinputEl.type === 'password') {
      editinputEl.type = 'text';
      editiconEl.classList.remove('bi-eye-slash-fill');
      editiconEl.classList.add('bi-eye');
    } else {
      editinputEl.type = 'password';
      editiconEl.classList.remove('bi-eye');
      editiconEl.classList.add('bi-eye-slash-fill');
    }
  }

}
