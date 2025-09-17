import { ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableComponent } from '../../shared/components/table/table.component';
import { UserService } from '../../core/services/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../core/models/user';
import { ShareableTableComponent } from '../../shared/components/shareable-table/shareable-table.component';
import { RequestParam } from '../../core/models/requestParam';
import { debounceTime, Subject } from 'rxjs';
import { CommonService } from '../../core/services/common.service';
import { AuthService } from '../../core/services/auth.service';
declare var bootstrap: any;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FormsModule, CommonModule, TableComponent, NgSelectModule, ShareableTableComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  model: User = new User()
  pageSize = 10;
  length!: number;
  currentPage = 0;
  requestParam: RequestParam = {
    start: 0,
    length: this.pageSize,
    sortBy: 'userName',
    sortOrder: 'asc',
    columnSearch: '',
    isDeleted: false,
    dynamicParams: {}
  };
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(ShareableTableComponent) shareableTable!: ShareableTableComponent;
  debounce: Subject<any> = new Subject<any>();
  columns: { columnDef: string, header: string, sortable: boolean, columnWidths: number }[] = [];
  actionButtons: any = {};
  tableName = "user"

  constructor(private userService: UserService, public commonService: CommonService, private authService: AuthService) {
    this.columns = [
      { columnDef: 'userName', header: 'User Name', sortable: true, columnWidths: 110 },
      { columnDef: 'emailId', header: 'Email ID', sortable: true, columnWidths: 150 },
      { columnDef: 'phoneNumber', header: 'Phone No.', sortable: true, columnWidths: 90 }
    ]
    this.actionButtons = {
      add: 1,
      edit: 1,
      delete: 1
    }
  }

  loginUserName:any=''
  filterValue: any;
  ngOnInit() {
    this.loginUserName = this.authService.getUserPayload()?.UserName;
    this.debounce
      .pipe(debounceTime(500))
      .subscribe((event: any) => this.onSearchChange(event));
    this.getUsers();
  }


  getUsers() {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.userService.getUsers(this.requestParam).subscribe({
      next: (res) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        if (res.statusCode == 200) {
          this.dataSource.data = res.data;
          this.dataSource.sort = this.sort;
          this.length = res.totalCount;
        }
        else {
          this.dataSource.data = [];
          this.length = 0
        }
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
      }
    })
  }

  onSearchChange(event: any): void {
    this.requestParam.start = 0;
    this.requestParam.columnSearch = event.target.value;
    this.getUsers();
  }

  pageChanged(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.requestParam.start = this.currentPage * this.pageSize;
    this.requestParam.length = this.pageSize;
    this.getUsers();
  }

  announceSortChange(sortState: Sort) {
    this.requestParam.sortBy = sortState.active;
    this.requestParam.sortOrder = sortState.direction || "asc";
    this.getUsers();
    this.shareableTable.paginator.firstPage();
  }

  handleNavigationMode(event: any) {
    if (event.mode == 'edit') {
      this.model = new User();
      this.editedFields = {};
      this.hideAllErrorFields();
      this.getUserById(event?.element?.userId);
      this.openModal('edit')
    } else if (event.mode == 'delete') {
      this.commonService.openDeleteConfirmDialog(event.element.userName).subscribe(val => {
        if (val) {
          /* this.deleteUser(event.element.userId); */
        }
      })
    }
  }

  userName: any;
  getUserById(id: any) {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.userService.GetUserByUserId(id).subscribe({
      next: (res) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        if (res.statusCode == 200) {
          this.userId = res?.data?.userId;
          this.model.userName = res?.data?.userName;
          this.model.phoneNumber = res?.data?.phoneNumber;
          this.model.emailId = res?.data?.emailId;
          this.userName = this.model.userName;
          if (this.model.userName?.toLowerCase() != "admin") {
            // this.getUserPrivilegeById(this.userId)
          }
        }
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        console.log(error);
      }
    })
  }

  isEditMode: boolean = false;
  isAddMode: boolean = false;
  editedFields: { [key: string]: any } = {};
  openModal(mode: string) {
    if (mode == 'add') {
      this.isAddMode = true;
      this.isEditMode = false;
      this.resetForm();
      const modal = new bootstrap.Modal(document.getElementById('userModel'));
      modal.show();
    }
    else if (mode == 'edit') {
      this.isEditMode = true
      this.isAddMode = false;
      const modal = new bootstrap.Modal(document.getElementById('userModel'));
      modal.show();
    }
  }

  resetForm() {
    this.model = new User();
    this.editedFields = {};
    this.hideAllErrorFields();
    if (this.isEditMode) {
      this.getUserById(this.userId);
    }
  }

  closeModal() {
    const modalElement = document.getElementById('userModel');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);

    if (modalInstance) {
      modalInstance.hide();
      this.isEditMode = false;
      this.isAddMode = false;
      this.resetForm();
    }
  }

  hideAllErrorFields() {
    const field = ['userRequired', 'userExists', 'phoneRequired', 'phoneExists', 'emailValid', 'emailIdExists', 'passRequired', 'passValid', 'confirmPassRequired']
    this.commonService.hideErrors(field);
  }
  userId: any

  onChange(event: any, field: any) {
    this.editedFields[field] = event;
  }
  password: any = '';
  confirmPassword: any = '';
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('toggleIcon') toggleIcon!: ElementRef;
  @ViewChild('confpasswordInput') confpasswordInput!: ElementRef;
  @ViewChild('conftoggleIcon') conftoggleIcon!: ElementRef;
  togglePasswordVisibility(): void {
    const inputEl = this.passwordInput.nativeElement;
    const iconEl = this.toggleIcon.nativeElement;

    if (inputEl.type === 'password') {
      inputEl.type = 'text';
      iconEl.classList.remove('bi-eye-slash-fill');
      iconEl.classList.add('bi-eye');
    } else {
      inputEl.type = 'password';
      iconEl.classList.remove('bi-eye');
      iconEl.classList.add('bi-eye-slash-fill');
    }
  }

  toggleConfirmPasswordVisibility(): void {
    const confinputEl = this.confpasswordInput.nativeElement;
    const conficonEl = this.conftoggleIcon.nativeElement;

    if (confinputEl.type === 'password') {
      confinputEl.type = 'text';
      conficonEl.classList.remove('bi-eye-slash-fill');
      conficonEl.classList.add('bi-eye');
    } else {
      confinputEl.type = 'password';
      conficonEl.classList.remove('bi-eye');
      conficonEl.classList.add('bi-eye-slash-fill');
    }
  }

  userFormSubmit(formData: any) {
    if (this.isEditMode) {
      this.editCustomer();
    } else if (this.isAddMode) {
      this.addCustomer();
    }
  }

  validateUser() {
    this.hideAllErrorFields();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let valid = true;

    if (this.isAddMode) {
      if (!this.model.userName) {
        this.commonService.showErrors(['userRequired'])
        valid = false;
      }
      // if (!this.model.emailId) {
      //   this.commonService.showError('addEmailRequired')
      //   valid = false;
      // }
      if (this.model.emailId && !emailPattern.test(this.model.emailId)) {
        this.commonService.showErrors(['emailValid'])
        valid = false;
      }
      if (!this.model.phoneNumber) {
        this.commonService.showErrors(['phoneRequired'])
        valid = false;
      }
      if (this.model.phoneNumber && this.model.phoneNumber.length < 10) {
        this.commonService.showErrors(['phoneRequired']);
        valid = false;
      }
      if (!this.password) {
        this.commonService.showErrors(['passRequired'])
        valid = false;
      }

      /* if (this.password && !passwordRegex.test(this.password)) {
        this.commonService.showError('addPassValid')
        valid = false;
      } */

      if (!this.confirmPassword) {
        this.commonService.showErrors(['confirmPassRequired'])
        valid = false;
      }

      if (this.confirmPassword && this.confirmPassword !== this.password) {
        this.commonService.showErrors(['confirmPassRequired'])
        valid = false;
      }
    }

    // Edit Case Specific Validations
    if (this.isEditMode) {
      if (!this.model.userName) {
        this.commonService.showErrors(['userRequired'])
        valid = false;
      }
      // if (!this.model.emailId) {
      //   this.commonService.showError('editEmailRequired')
      //   valid = false;
      // }
      if (this.model.emailId && !emailPattern.test(this.model.emailId)) {
        this.commonService.showErrors(['emailValid'])
        valid = false;
      }
      if (!this.model.phoneNumber) {
        this.commonService.showErrors(['phoneRequired'])
        valid = false;
      }
      if (this.model.phoneNumber && this.model.phoneNumber.length < 10) {
        this.commonService.showErrors(['phoneRequired']);
        valid = false;
      }
      /* if (this.password && !passwordRegex.test(this.password)) {
        this.commonService.showError('editPassValid')
        valid = false;
      } */
      if (this.password && !this.confirmPassword) {
        this.commonService.showErrors(['confirmPassRequired'])
        valid = false;
      }
      if (this.password && this.confirmPassword && this.confirmPassword !== this.password) {
        this.commonService.showErrors(['confirmPassRequired'])
        valid = false;
      }
    }
    return valid;
  }

  editCustomer() {
    if (!this.validateUser()) {
      return;
    }

    if (this.password) {
      this.editedFields['password'] = this.password;
    }

    const loader = document.getElementById('overlayloader');
    loader?.classList.remove('d-none');

    this.userService.updateUser(this.userId, this.editedFields).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          /* if (this.userName?.toLowerCase() !== 'admin') {
            const privilegeData = {
              isVehicleMgmtAllow: this.permissions.vehicleMgmt,
              isPolicyMgmtAllow: this.permissions.policyMgmt,
              isNotificationMgmtAllow: this.permissions.notificationMgmt,
              isBoomBarrierMgmtAllow: this.permissions.boomBarrierMgmt
            };
  
            this.userPrivService.updateUserPrivilege(this.userId, privilegeData).subscribe({
              next: () => {
                this.closeModal();
                this.getUsers();
                // this.sidebarComponent.getUserPrivilegeById(this.userId);
                loader?.classList.add('d-none');
              },
              error: (err) => {
                console.error('Error updating privileges', err);
                loader?.classList.add('d-none');
              }
            });
          } else { */
          this.closeModal();
          this.getUsers();
          loader?.classList.add('d-none');
          //}

        } else if (res.statusCode === 302) {
          const conflicts = res.data?.conflicts || [];
          if (conflicts.includes('UserName')) {
            this.commonService.showErrors(['userExists']);
          }
          if (conflicts.includes('EmailId')) {
            this.commonService.showErrors(['emailIdExists']);
          }
          if (conflicts.includes('Phone')) {
            this.commonService.showErrors(['phoneExists']);
          }
          loader?.classList.add('d-none');
        }
      },
      error: (error) => {
        console.error(error);
        loader?.classList.add('d-none');
      }
    });

  }

  addCustomer() {
    if (!this.validateUser()) return;

    this.model['password'] = this.password;
    document.getElementById('overlayloader')?.classList.remove('d-none');

    this.userService.createUser(this.model).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          const userId = res.data?.userId;
          if (!userId) {
            console.error('User ID not returned from createUser');
            document.getElementById('overlayloader')?.classList.add('d-none');
            return;
          }

          /* const privilegeData = {
            userId: userId,
            isVehicleMgmtAllow: this.permissions.vehicleMgmt,
            isPolicyMgmtAllow: this.permissions.policyMgmt,
            isNotificationMgmtAllow: this.permissions.notificationMgmt,
            isBoomBarrierMgmtAllow: this.permissions.boomBarrierMgmt
          };

          this.userPrivService.createUserPrivilege(privilegeData).subscribe({
            next: (privilegeRes) => {
              this.closeAddModal();
              this.getUsers();
              document.getElementById('overlayloader')?.classList.add('d-none');
            },
            error: (privilegeErr) => {
              document.getElementById('overlayloader')?.classList.add('d-none');
            }
          }); */
          this.closeModal();
          this.getUsers();
          document.getElementById('overlayloader')?.classList.add('d-none');

        } else if (res.statusCode === 302) {
          const conflicts = res.data?.conflicts || [];
          if (conflicts.includes('UserName')) {
            this.commonService.showErrors(['userExists']);
          }
          if (conflicts.includes("EmailId")) {
            this.commonService.showErrors(['emailIdExists']);
          }
          if (conflicts.includes("Phone")) {
            this.commonService.showErrors(['phoneExists']);
          }
          document.getElementById('overlayloader')?.classList.add('d-none');
        }
      },
      error: (error) => {
        console.error(error);
        document.getElementById('overlayloader')?.classList.add('d-none');
      }
    });
  }
}
