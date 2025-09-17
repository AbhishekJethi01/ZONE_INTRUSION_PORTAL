import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import * as feather from 'feather-icons'; 
declare var bootstrap: any;
export interface UserData {
  cameraName: string;
  ipAddress: string;
  direction: string;
  rtspURL: string;
  cameraStatus:string;
}
const ELEMENT_DATA: UserData[] = [
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
    { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
  { cameraName: ' Entry G2 ', ipAddress: '10.30.30.49', direction: 'Entry', rtspURL: ' rtsp://10.30.30.189:555/screenlive ', cameraStatus:'connected' },
];


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  displayedColumns: string[] = ['Action', 'cameraName', 'ipAddress', 'direction', 'rtspURL', 'cameraStatus'];
  dataSource = new MatTableDataSource<UserData>(ELEMENT_DATA);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    feather.replace();

    this.paginator.page.subscribe(() => feather.replace());
    this.sort.sortChange.subscribe(() => feather.replace());

    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
    initializeTooltips(): void {
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-tooltip="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  isActionAvailable(): boolean {
    return true;
  }
}
