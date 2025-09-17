import { ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableComponent } from '../../shared/components/table/table.component';
declare var bootstrap: any;

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [HeaderComponent,SidebarComponent,FormsModule,CommonModule, TableComponent, NgSelectModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  @ViewChild('filterPanel') filterPanel!: ElementRef;
  showFilterPanel = false;
  isFilterOpen: boolean = false;
    filterPanelTop = 0;
  filterPanelRight = 20;

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
  cancelFilter(): void {
    const dateTimeCheckElem = document.getElementById("datetimeCheck");
    if (dateTimeCheckElem) {
      dateTimeCheckElem.classList.add("d-none");
    }
  }
}
