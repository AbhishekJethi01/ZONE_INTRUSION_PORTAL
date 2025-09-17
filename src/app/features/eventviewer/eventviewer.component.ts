import { ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableComponent } from '../../shared/components/table/table.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ShareableTableComponent } from '../../shared/components/shareable-table/shareable-table.component';
import { HistoricaleventService } from '../../core/services/historicalevent.service';
import { CommonService } from '../../core/services/common.service';
import { CapitalizeFirstPipe } from "../../shared/pipes/capitalize-first.pipe";
import { IconsComponent } from "../../shared/components/icons/icons.component";
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-eventviewer',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FormsModule, CommonModule, TableComponent, NgSelectModule, ShareableTableComponent, CapitalizeFirstPipe, IconsComponent],
  templateUrl: './eventviewer.component.html',
  styleUrl: './eventviewer.component.scss'
})
export class EventviewerComponent {
  @ViewChild('filterPanel') filterPanel!: ElementRef;
  showFilterPanel = false;
  isFilterOpen: boolean = false;
  filterPanelTop = 0;
  filterPanelRight = 20;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(ShareableTableComponent) shareableTable!: ShareableTableComponent;

  columns: { columnDef: string, header: string, sortable: boolean, columnWidths: number }[] = [];
  actionButtons: any = {};
  pageSize = 20;
  currentPage = 0;
  pageOptions = [10, 25, 50, 100];
  length!: number;
  actionColumnWidth: string = '40px';
  searchInput: any = '';

  requestParam: any = {
    start: 0,
    length: this.pageSize,
    sortBy: 'eventId',
    sortOrder: 'desc',
    customerSearch: '',
    columnSearch: '',
    isDeleted: false,
    dynamicParams: {}
  };
  tableName: any = 'historicalEvent';
  today: string = '';
  eventstartDate: any;
  eventstartTime: any;
  eventendDate: any;
  eventendTime: any;
  filterValue: any;
  debounce: Subject<any> = new Subject<any>();

  constructor(public commonService: CommonService, private historicalEventService: HistoricaleventService,) {
    this.columns = [
      { columnDef: 'serialNo', header: 'S.No', sortable: false, columnWidths: 50 },
      { columnDef: 'eventId', header: 'Event Id', sortable: true, columnWidths: 50 },
      { columnDef: 'eventTime', header: 'Capture Time', sortable: true, columnWidths: 140 },
      { columnDef: 'img', header: 'Image', sortable: false, columnWidths: 120 },
      { columnDef: 'objectType', header: 'Type', sortable: false, columnWidths: 150 },
      { columnDef: 'cameraName', header: 'Camera Name', sortable: true, columnWidths: 210 },
      { columnDef: 'link', header: 'Link', sortable: true, columnWidths: 210 },
    ]
    this.actionButtons = {
      // view: 1,
      // delete: 1,
    }
  }

  ngOnInit() {
    this.debounce.pipe(debounceTime(500),distinctUntilChanged()).subscribe((event: any) => this.onSearchChange(event));
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    this.today = `${year}-${month}-${day}`;
    this.activateTab('hisEvent');
  }
  
  ngAfterViewInit(): void {
    this.initializeTooltips();
    if ((window as any).feather) {
      (window as any).feather.replace();
    }
  }
  toggleFilterPanel(): void {
    this.isFilterOpen = !this.isFilterOpen;
    this.showFilterPanel = !this.showFilterPanel;
    const dateTimeCheckElem = document.getElementById("datetimeCheck");

    if (dateTimeCheckElem) {
      dateTimeCheckElem.classList.add("d-none");
    }

    if (this.showFilterPanel) {
      const btn = document.querySelector('#btnFilter') as HTMLElement;
      const rect = btn.getBoundingClientRect();

      this.filterPanelTop = rect.top + window.scrollY + btn.offsetHeight - 68;
      this.filterPanelRight = 0;
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      // Date in yyyy-MM-dd
      const today = now.toISOString().split('T')[0];
      // Time in HH:mm
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const midnight = '00:00';
      // Assign to your any-typed variables
      this.eventstartDate = today;
      this.eventendDate = today;
      this.eventstartTime = midnight;
      this.eventendTime = currentTime;

    } else {
      this.cancelFilter();
    }
  }

  closeFilterPanel(): void {
    this.showFilterPanel = false;
    this.isFilterOpen = !this.isFilterOpen;
    this.cancelFilter();
  }
  initializeTooltips(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-tooltip="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }


  activeTabId: string = '';
  activateTab(activeTab: string) {
    this.activeTabId = activeTab;
    if (activeTab == 'hisEvent') {
      this.currentPage = 0;
      this.requestParam.start = 0;
      this.geHistoricalEvents();
    }
    else if (activeTab == 'misEvent') {

    }
  }

  geHistoricalEvents(): void {
    setTimeout(() => {
      document.getElementById('overlayloader')?.classList.remove('d-none');
    }, 0);

    this.historicalEventService.getEvents(this.requestParam).subscribe({
      next: (response) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        let res = response as any;

        // Add serial number based on pagination
        const startSerial = this.currentPage * this.pageSize;
        this.dataSource.data = res?.data.map((item: any, index: number) => ({
          ...item,
          serialNo: startSerial + index + 1
        }));

        this.dataSource.sort = this.sort;
        this.length = res.totalCount;

        setTimeout(() => {
          if (this.shareableTable?.paginator) {
            this.shareableTable.paginator.pageIndex = this.currentPage;
            this.shareableTable.pageSize = this.pageSize;
          }
        });
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
      }
    });
  }

  onSearchChange(event: any): void {
    this.requestParam.start = 0;
    this.requestParam.columnSearch = event.target.value;
    this.geHistoricalEvents();
  }

  handleNavigationMode(event: any) {
    if (event.mode === 'view') {
      this.openModal(event.element)
    } else if (event.mode === 'delete') {
      /* this.commonService.openDeleteConfirmDialog(event.element?.eventId).subscribe(val => {
        if (val) {
          this.deleteEvent(event.element?.eventId);
        }
      }) */
    }

  }

  @ViewChild('liveEventPopup') liveEventPopup!: ElementRef;
  eventData: any
  openModal(data: any) {
    this.eventData = data;
    const modalEl = this.liveEventPopup.nativeElement;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  closeModal() {
    const modalEl = this.liveEventPopup.nativeElement;
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    this.eventData = null;
  }

  pageChanged(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.requestParam.start = this.currentPage * this.pageSize;
    this.requestParam.length = this.pageSize;
    this.geHistoricalEvents();
  }

  announceSortChange(sortState: Sort) {
    this.requestParam.sortBy = sortState.active;
    this.requestParam.sortOrder = sortState.direction || "asc";
    this.geHistoricalEvents();
    this.shareableTable.paginator.firstPage();
  }

  updateFilterParams() {
    this.requestParam.dynamicParams = {};

    // Combine Start Date and Time (no seconds)
    if (this.eventstartDate && this.eventstartTime) {
      const startDateTime = `${this.eventstartDate}T${this.eventstartTime}`;
      this.requestParam.dynamicParams['startDateTime'] = startDateTime;
    }

    // Combine End Date and Time (no seconds)
    if (this.eventendDate && this.eventendTime) {
      const endDateTime = `${this.eventendDate}T${this.eventendTime}`;
      this.requestParam.dynamicParams['endDateTime'] = endDateTime;
    }

  }

  applyAdvanceFilter() {
    const dateTimeCheckElem = document.getElementById("datetimeCheck");

    if (dateTimeCheckElem) {
      dateTimeCheckElem.classList.add("d-none");
    }

    if (this.eventstartDate && this.eventendDate) {
      let isInvalid = false;

      if (this.eventstartTime && this.eventendTime) {
        const startDateTime = new Date(`${this.eventstartDate}T${this.eventstartTime}`);
        const endDateTime = new Date(`${this.eventendDate}T${this.eventendTime}`);
        isInvalid = endDateTime < startDateTime;
      } else {
        const startDateOnly = new Date(this.eventstartDate);
        const endDateOnly = new Date(this.eventendDate);
        isInvalid = endDateOnly < startDateOnly;
      }

      if (isInvalid) {
        if (dateTimeCheckElem) {
          dateTimeCheckElem.classList.remove("d-none");
        }
        return;
      }
    }

    this.updateFilterParams();
    this.geHistoricalEvents();
  }

  cancelFilter(): void {
    this.eventstartDate = '';
    this.eventstartTime = '';
    this.eventendDate = '';
    this.eventendTime = '';
    this.requestParam.dynamicParams = {};
    this.geHistoricalEvents();
    const dateTimeCheckElem = document.getElementById("datetimeCheck");
    if (dateTimeCheckElem) {
      dateTimeCheckElem.classList.add("d-none");
    }
  }

}
