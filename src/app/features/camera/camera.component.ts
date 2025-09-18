import { Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ShareableTableComponent } from '../../shared/components/shareable-table/shareable-table.component';
import { CameraService } from '../../core/services/camera.service';
import { Camera } from '../../core/models/camera';
import { CommonService } from '../../core/services/common.service';
declare var bootstrap: any;

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FormsModule, CommonModule, ShareableTableComponent],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent {
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(ShareableTableComponent) shareableTable!: ShareableTableComponent;
  tableName: any = 'camera';
  columns: { columnDef: string, header: string, sortable: boolean, columnWidths: number }[] = [];
  actionButtons: any = {};
  pageSize = 25;
  currentPage = 0;
  pageOptions = [10, 25, 50, 100];
  length!: number;
  actionColumnWidth: string = '40px';
  searchInput: any = '';
  requestParam: any = {
    start: 0,
    length: this.pageSize,
    sortBy: '',
    sortOrder: '',
    customerSearch: '',
    columnSearch: '',
    isDeleted: false,
    dynamicParams: {}
  };
  editedFields: { [key: string]: any } = {};
  model: Camera = new Camera();

  constructor(private cameraService: CameraService, public commonService: CommonService) {
    this.columns = [
      { columnDef: 'cameraName', header: 'Camera Name', sortable: true, columnWidths: 170 },
      { columnDef: 'cameraIpAddress', header: 'IP Address', sortable: true, columnWidths: 200 },
      { columnDef: 'url', header: 'RTSP URL', sortable: true, columnWidths: 400 },
      { columnDef: 'cameraStatus', header: 'Camera Status', sortable: true, columnWidths: 170 },
    ]
    this.actionButtons = {
      add: 1,
      edit: 1,
      delete: 1,
    }
  }

  ngOnInit() {
    this.getCamera();
    this.updateCameraStatuses();
    this.statusInterval = setInterval(() => {
      this.updateCameraStatuses();
    }, 10000);
  }

  statusInterval: any;
  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  getCamera() {
    this.cameraService.getCamera(this.requestParam).subscribe({
      next: (res) => {
        const enriched = res?.data.map((cam: any) => ({
          ...cam,
          cameraStatus: 'Checking...'
        }));
        this.dataSource.data = enriched;
        this.dataSource.sort = this.sort;
        this.length = res.totalCount;
      },
      error: (error) => {

      }
    })
  }

  updateCameraStatuses(): void {
    this.cameraService.getCameraStatus().subscribe({
      next: (res) => {
        const statuses = res?.data || [];
        const map = new Map<string, string>();
        statuses.forEach((s: any) => map.set(s.cameraName, s.cameraStatus));

        this.dataSource.data.forEach((cam: any) => {
          if (map.has(cam.cameraName)) {
            cam.cameraStatus = map.get(cam.cameraName);
          }
        });

        // Trigger Angular change detection manually if needed
        this.dataSource._updateChangeSubscription?.();
      },
      error: () => { }
    });
  }

  pageChanged(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.requestParam.start = this.currentPage * this.pageSize;
    this.requestParam.length = this.pageSize;
    this.getCamera();
  }

  announceSortChange(sortState: Sort) {
    this.requestParam.sortBy = sortState.active;
    this.requestParam.sortOrder = sortState.direction || "asc";
    this.getCamera();
    this.shareableTable.paginator.firstPage();
  }

  handleNavigationMode(event: any) {
    if (event.mode === 'edit') {
      this.model = new Camera();
      this.editedFields = {};
      this.hideAllErrorFields();
      this.getCameraByCameraId(event?.element?.cameraId);
      this.openModal('edit')
    } else if (event.mode === 'delete') {
      this.commonService.openDeleteConfirmDialog(event?.element?.cameraName).subscribe(val => {
        if (val) {
          this.deleteCamera(event?.element?.cameraId);
        }
      })
    }
  }

  isEditMode: boolean = false;
  isAddMode: boolean = false;

  openModal(mode: string) {
    if (mode == 'add') {
      this.isAddMode = true;
      this.isEditMode = false;
      this.resetForm();
      const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
      modal.show();
    }
    else if (mode == 'edit') {
      this.isEditMode = true
      this.isAddMode = false;
      const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
      modal.show();
    }
  }

  resetForm() {
    this.model = new Camera();
    this.editedFields = {};
    this.hideAllErrorFields();
    if (this.isEditMode) {
      this.getCameraByCameraId(this.cameraId);
    }
  }

  closeModal() {
    const modalElement = document.getElementById('cameraModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);

    if (modalInstance) {
      modalInstance.hide();
      this.isEditMode = false;
      this.isAddMode = false;
      this.resetForm();
    }
  }


  cameraFormSubmit(formData: any) {
    if (this.isEditMode) {
      this.editCustomer();
    } else if (this.isAddMode) {
      this.addCustomer();
    }
  }

  validateCamera(): boolean {
    this.hideAllErrorFields();
    let valid = true;
    if (!this.model.cameraName) {
      this.commonService.showErrors(['cameraNameRequired']);
      valid = false;
    }
    const isRtspProvided = !!this.model.url?.trim();
    if (!isRtspProvided) {
      if (!this.model.cameraUserName) {
        this.commonService.showErrors(['cameraUsernameRequired']);
        valid = false;
      }
      if (!this.model.cameraIpAddress) {
        this.commonService.showErrors(['cameraIpAddressRequired']);
        valid = false;
      }
      if (!this.model.cameraPassword) {
        this.commonService.showErrors(['cameraPasswordRequired']);
        valid = false;
      }
    }

    return valid;
  }

  addCustomer() {
    if (this.validateCamera()) {
      const finalRtspUrl = this.constructRtspUrl();
      if (!finalRtspUrl?.trim()) {
        return;
      }
      this.model.url = finalRtspUrl;
      this.cameraService.createCamera(this.model).subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.closeModal();
            this.getCamera();
          } else if (res.statusCode == 302) {
            const conflicts = res.data?.conflicts || [];
            if (conflicts.includes("CameraName")) {
              this.commonService.showErrors(['cameraNameExists'])
            }
          }
        },
        error: (error) => {

        }
      })
    }
  }

  editCustomer() {
    if (this.validateCamera()) {
      const rtspFields = ['url', 'cameraUserName', 'cameraPassword', 'cameraIpAddress', 'cameraPort', 'cameraSubstream'];
      const shouldRebuildRtsp = rtspFields.some(field => field in this.editedFields);
      if (shouldRebuildRtsp) {
        const newRtspUrl = this.constructRtspUrl();
        if (!newRtspUrl) {
          return;
        }
        this.editedFields['url'] = newRtspUrl;
      }
      this.cameraService.updateCamera(this.model.cameraId, this.editedFields).subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.closeModal();
            this.getCamera();
          } else if (res.statusCode == 302) {
            const conflicts = res.data?.conflicts || [];
            if (conflicts.includes("CameraName")) {
              this.commonService.showErrors(['cameraNameExists'])
            }
          }
        },
        error: (error) => {

        }
      })
    }
  }

  hideAllErrorFields() {
    const field = ['cameraNameRequired', 'cameraNameExists', 'cameraUsernameRequired', 'cameraIpAddressRequired', 'cameraPasswordRequired']
    this.commonService.hideErrors(field);
  }
  cameraId: any
  getCameraByCameraId(cameraId: any) {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.cameraService.getCameraByCameraId(cameraId).subscribe({
      next: (res) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        if (res.statusCode == 200) {
          this.cameraId = res.data?.cameraId;
          this.model.cameraId = res.data?.cameraId;
          this.model.cameraName = res.data?.cameraName;
          this.model.url = res.data?.url;
          this.model.cameraUserName = res.data?.cameraUserName;
          this.model.cameraIpAddress = res.data?.cameraIpAddress;
          this.model.cameraPassword = res.data?.cameraPassword;
          this.model.cameraPort = res.data?.cameraPort;
          this.model.cameraSubstream = res.data?.cameraSubstream;
        }
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
      }
    })
  }

  onChange(event: any, fieldName: string) {
    this.editedFields[fieldName] = event;
  }

  constructRtspUrl(): string | null {
    const url = this.model.url?.trim();

    if ((url && this.isAddMode) || ('url' in this.editedFields && this.isEditMode)) {
      if (url) {
        this.extractRtspComponents(url);
        return url;
      }
    }

    if (
      !this.model.cameraUserName?.trim() ||
      !this.model.cameraPassword?.trim() ||
      !this.model.cameraIpAddress?.trim()
    ) {
      return null;
    }

    let rtsp = `rtsp://${this.model.cameraUserName.trim()}:${this.model.cameraPassword.trim()}@${this.model.cameraIpAddress.trim()}`;

    if (this.model.cameraPort?.toString().trim()) {
      rtsp += `:${this.model.cameraPort.toString().trim()}`;
    }

    if (this.model.cameraSubstream?.toString().trim()) {
      rtsp += `/${this.model.cameraSubstream.toString().trim()}`;
    }

    return rtsp;
  }


  extractRtspComponents(rtspUrl: string): void {
    try {
      // Remove "rtsp://" prefix
      const withoutProtocol = rtspUrl.substring(7); // "admin:Admin@123@10.30.30.49/1"

      // Find the last @ symbol to separate credentials and IP
      const atIndex = withoutProtocol.lastIndexOf('@');
      if (atIndex === -1) {
        // this.commonService?.showError?.("RTSP URL missing '@' symbol");
        return;
      }

      const credentialsPart = withoutProtocol.substring(0, atIndex); // "admin:Admin@123"
      const addressPart = withoutProtocol.substring(atIndex + 1); // "10.30.30.49/1"

      // Split username and password
      const [username, ...passwordParts] = credentialsPart.split(':');
      const password = passwordParts.join(':'); // in case ':' is part of the password

      // Now split address into IP, port, and substream
      const addressMatch = addressPart.match(/^([^:/]+)(:\d+)?(\/.*)?$/);
      if (!addressMatch) {
        // this.commonService?.showError?.("Invalid RTSP address format");
        return;
      }

      this.model.cameraUserName = username;
      this.model.cameraPassword = password;
      this.model.cameraIpAddress = addressMatch[1];
      this.editedFields['cameraUserName'] = username;
      this.editedFields['password'] = password;
      this.editedFields['cameraIpAddress'] = addressMatch[1];

      if (addressMatch[2]) {
        this.model.cameraPort = addressMatch[2].replace(':', '');
      }

      if (addressMatch[3]) {
        this.model.cameraSubstream = addressMatch[3].replace('/', '');
      }

    } catch (err) {
      console.error("RTSP parse error:", err);
      // this.commonService?.showError?.("Error parsing RTSP URL");
    }
  }

  @ViewChild('campasswordInput') campasswordInput!: ElementRef;
  @ViewChild('toggleIcon') toggleIcon!: ElementRef;

  camtogglePasswordVisibility(): void {
    const inputEl = this.campasswordInput.nativeElement;
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

  deleteCamera(cameraName: any) {
    this.cameraId = cameraName;
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.cameraService.deleteCamera(cameraName).subscribe({
      next: (response) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        if (response.statusCode == 200) {
          this.getCamera();
        }
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
      }
    });
  }
}
