import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { environment } from '../../../../environments/environment';
import { PinchZoomModule } from '@meddv/ngx-pinch-zoom';
declare var bootstrap: any;
import * as feather from 'feather-icons'; 
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-shareable-table',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    PinchZoomModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './shareable-table.component.html',
  styleUrl: './shareable-table.component.scss'
})
export class ShareableTableComponent {
  @Input() dataSource = new MatTableDataSource<any>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() columns: { columnDef: string, header: string, sortable: boolean, checkbox?: boolean, columnWidths?: number, colorField?: boolean; timeField?: boolean, currencyField?: boolean, dateField?: boolean, enableToggle?: boolean }[] = [];
  @Input() actionButtons: any = {};
  @Input() pageSize = 20;
  @Input() currentPage = 0;
  pageOptions = [10, 20, 50, 100];
  @Input() length!: number;
  @Input() actionColumnWidth: string = '0px';
  @Input() tableName: string = "";
  @Input() disablePagination: boolean = false;
  @Output() navigationMode = new EventEmitter<any>()
  displayedColumns: string[] = [];
  constructor(private authService: AuthService) {

  }

  loginUserName:any=''
  ngOnInit(): void {
    this.loginUserName = this.authService.getUserPayload()?.UserName;
    if (this.isActionAvailable()) {
      this.displayedColumns = ['Action', ...this.columns.map(c => c.columnDef)];
    }
    else {
      this.displayedColumns = [...this.columns.map(c => c.columnDef)];
    }
    this.dataSource.sort = this.sort;
    feather.replace();
  }

  ngOnChanges() {
    if (this.isActionAvailable()) {
      this.displayedColumns = ['Action', ...this.columns.map(c => c.columnDef)];
    }
    else {
      this.displayedColumns = [...this.columns.map(c => c.columnDef)];
    }
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    feather.replace();

    // this.paginator.page.subscribe(() => feather.replace());
    // this.sort.sortChange.subscribe(() => feather.replace());
    setTimeout(() => {
      this.initializeTooltips();
      feather.replace();
    }, 100);
     this.paginator?.page?.subscribe(() => {
      setTimeout(() => feather.replace());
    });
  }

  initializeTooltips(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-tooltip="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  isActionAvailable(): boolean {
    return Object.values(this.actionButtons).some(value => value === 1);
  }

  navigateToMode(mode: any, element?: number) {

    const modeData = { mode, element };
    this.navigationMode.emit(modeData)
  }

  @Output() sortChange = new EventEmitter<Sort>();
  announceSortChange(sortState: Sort) {
    this.sortChange.emit(sortState);
  }

  @Output() pageChange = new EventEmitter<PageEvent>();
  pageChanged(event: PageEvent) {
    this.pageChange.emit(event);
  }

  getImageUrl(relativePath: string): string {
    return relativePath
      ? `${environment.imageBaseUrl}/${relativePath}`
      : 'assets/images/no-image.png'; // fallback image
  }

  modalImageSrc: string = '';

  openImageModal(imageSrc: string): void {
    this.zoomLevel = 1;
    this.modalImageSrc = imageSrc;

    const modalId = `vehicleImageModal-${this.tableName}`;
    const modalElement = document.getElementById(modalId);

    if (modalElement) {
      const bootstrapModal = new bootstrap.Modal(modalElement);
      bootstrapModal.show();
    }
  }



  vehicleNoPlatemodalImageSrc: string = '';

  openVehicleNoPlateImageModal(imageSrc: string): void {
    this.vehicleNoPlatemodalImageSrc = imageSrc;

    const modalId = `vehicleNoPlateImageModal-${this.tableName}`;
    const modalElement = document.getElementById(modalId);

    if (modalElement) {
      const bootstrapModal = new bootstrap.Modal(modalElement);
      bootstrapModal.show();
    }
  }


  formatDateTimeToAMPM(dateTime: string | Date) {
    if (!dateTime) return '';

    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    if (isNaN(date.getTime())) return ''; // Handle invalid dates

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  formatDateOnly(dateTime: string | Date): string {
    if (!dateTime) return '';
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  // zoomLevel = 1;
  // onScroll(event: WheelEvent) {
  //   event.preventDefault();

  //   const delta = event.deltaY;

  //   if (delta < 0) {
  //     this.zoomLevel = Math.min(this.zoomLevel + 0.1, 3);
  //   } else {
  //     this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
  //   }
  // }

  zoomLevel = 1;
  transformOrigin = '0 0';

  // modalImageSrc = 'assets/your-image.jpg'; // Update with your image path

  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef;

  onScroll(event: WheelEvent) {
    event.preventDefault();

    const container = this.containerRef.nativeElement;
    const rect = container.getBoundingClientRect();

    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const originX = (offsetX / rect.width) * 100;
    const originY = (offsetY / rect.height) * 100;

    this.transformOrigin = `${originX}% ${originY}%`;

    const delta = event.deltaY;
    if (delta < 0) {
      this.zoomLevel = Math.min(this.zoomLevel + 0.1, 4);
    } else {
      this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
    }
  }



  getVehicleTypeLabel(type: string, expiryDate?: string): string {
    if (type === 'Temporary' && expiryDate) {
      const formattedDate = this.formatDateOnly(expiryDate);
      return `Temporary (${formattedDate})`;
    }
    return type;
  }

  showPinchZoom = true;
  closeModal() {
    this.showPinchZoom = false;
    setTimeout(() => this.showPinchZoom = true, 0);
  }

}
