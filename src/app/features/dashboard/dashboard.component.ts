import { ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../shared/components/table/table.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import * as feather from 'feather-icons';
import { HistoricaleventService } from '../../core/services/historicalevent.service';
import { ShareableTableComponent } from '../../shared/components/shareable-table/shareable-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, HighchartsChartModule, FormsModule, CommonModule, MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    TableComponent,
    MatFormFieldModule,
    MatButtonModule, ShareableTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(ShareableTableComponent) shareableTable!: ShareableTableComponent;
  columns: { columnDef: string, header: string, sortable: boolean, columnWidths: number }[] = [];
  actionButtons: any = {};
  pageSize = 25;
  currentPage = 0;
  pageOptions = [10, 25, 50, 100];
  length!: number;
  actionColumnWidth: string = '40px';
  tableName: any = 'dashboadevents';

  @ViewChild('cardBody') cardBody!: ElementRef;
  private chart!: Highcharts.Chart;
  displayedColumns: string[] = ['date', 'vehicle', 'human', 'animal'];

  showAllCameras = false;
  cameraEventsList: any[] = [];
  constructor(private renderer: Renderer2, private historicaleventService: HistoricaleventService) {
    this.columns = [
      { columnDef: 'date', header: 'Date', sortable: false, columnWidths: 150 },
      { columnDef: 'totalVehicle', header: 'Total Vehicle', sortable: false, columnWidths: 120 },
      { columnDef: 'totalPerson', header: 'Total Human', sortable: false, columnWidths: 120 },
      { columnDef: 'totalAnimal', header: 'Total Animal', sortable: false, columnWidths: 120 },
    ]
  }

  private todayDashboardSummaryInterval: any;
  ngOnInit() {
    this.getMonthWiseEventSummary();
    this.getLastTenDaySummary();
    this.getTodayDashboardSummary();
    this.todayDashboardSummaryInterval = setInterval(() => {
      this.getTodayDashboardSummary();
    }, 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.todayDashboardSummaryInterval);
  }

  /* ngAfterViewInit(): void {
    this.setChartHeight();
    this.initChart();
    feather.replace();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  @HostListener('window:resize')
  onResize() {
    // alert();
    this.setChartHeight();
    setTimeout(() => {
      if (this.chart) {
        this.chart.reflow();
      }
    }, 10);

    // setTimeout(() => {
    //   if (this.chart) {
    //     const chartDiv = document.getElementById('statusChart');
    //     if (chartDiv) {
    //       const width = chartDiv.offsetWidth;
    //       const height = chartDiv.offsetHeight;
    //       this.chart.setSize(width, height, false); // force resize
    //     }
    //   }
    // }, 50);
  }
  @HostListener('window:load')
  onLoad() {
    this.setChartHeight();
    setTimeout(() => {
      if (this.chart) {
        this.chart.reflow();
      }
    }, 10);
  } */

 /*  private setChartHeight(): void {
    const bodyHeight = this?.cardBody.nativeElement.offsetHeight;
    const chartDiv = document.getElementById('statusChart');
    if (chartDiv) {
      //this.renderer.setStyle(chartDiv, 'height', `${bodyHeight}px`);
      this.renderer.setStyle(chartDiv, 'height', `${bodyHeight - 70}px`);
      this.renderer.setStyle(chartDiv, 'min-height', `${bodyHeight - 70}px`);
    }
  }

  private initChart(): void {
    this.chart = Highcharts.chart('statusChart', {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: '' },
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: { style: { color: '#6c757d', fontSize: '12px' } }
      },
      yAxis: {
        title: { text: '' },
        gridLineColor: '#f1f1f1',
        labels: { style: { color: '#6c757d', fontSize: '12px' } }
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: [{
        type: 'column',
        data: [15000, 22000, 23000, 25000, 18000, 20000, 21000, 19000, 19500, 25000, 17000, 24000],
        color: '#A8C5DA'
      }]
    });
  } */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  get displayedCameras() {
    return this.showAllCameras || !this.cameraEventsList
      ? this.cameraEventsList
      : this.cameraEventsList.slice(0, 2);
  }

  toggleCameraView() {
    if (this.cameraEventsList && this.cameraEventsList.length > 2) {
      this.showAllCameras = !this.showAllCameras;
    }
  }

  get isToggleDisabled(): boolean {
    return !this.cameraEventsList || this.cameraEventsList.length <= 2;
  }

  get toggleButtonText(): string {
    return this.showAllCameras ? 'See Less Cameras' : 'See More Cameras';
  }


  getLastTenDaySummary() {
    this.historicaleventService.getLastTenDaySummary().subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.dataSource.data = res.data;
        }
        else {
          this.dataSource.data = [];
        }
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  totalVehicle: any;
  totalPerson: any;
  totalAnimal: any;
  totalOther: any;
  vehiclePercentage: any;
  personPercentage: any;
  animalPercentage: any;
  otherPercentage:any;
  getTodayDashboardSummary(): void {
    this.historicaleventService.getTodayDashboardSummary().subscribe({
      next: (response) => {
        this.totalVehicle = response.data?.totalVehicle;
        this.totalPerson = response.data?.totalPerson;
        this.totalAnimal = response.data?.totalAnimal;
        this.totalOther = response.data?.totalOther;
        this.personPercentage = response.data?.personPercentage;
        this.vehiclePercentage = response.data?.vehiclePercentage;
        this.animalPercentage = response.data?.animalPercentage;
        this.otherPercentage = response.data?.otherPercentage;
        this.cameraEventsList = response.data?.cameraSummaries;
      },
      error: (error) => {
      }
    });
  }

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  updateFlag: boolean = false;

  getMonthWiseEventSummary(): void {
    this.historicaleventService.GetMonthWiseEventSummary().subscribe({
      next: (response) => {
        if (response.statusCode === 200 && Array.isArray(response.data)) {
          const rawData = response.data;

          const allMonths = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];

          // Initialize arrays with 0 for all 12 months
          const vehicleData = Array(12).fill(0);
          const personData = Array(12).fill(0);
          const animalData = Array(12).fill(0);
          const otherData = Array(12).fill(0);

          // Fill only where data is present
          rawData.forEach((item: any) => {
            const monthIndex = item.month - 1; // month is 1-based
            vehicleData[monthIndex] = item.totalVehicle;
            personData[monthIndex] = item.totalPerson;
            animalData[monthIndex] = item.totalAnimal;
            otherData[monthIndex] = item.totalOther;
          });

          this.chartOptions = {
            chart: {
              type: 'column'
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: allMonths,
              title: { text: '' }
            },
            yAxis: {
              min: 0,
              title: { text: '' }
            },
            legend: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            plotOptions: {
              column: {
                pointWidth: 20
              }
            },
            series: [
              {
                name: 'Vehicle',
                type: 'column',
                color: '#5C67F7',
                data: vehicleData
              },
              {
                name: 'Person',
                type: 'column',
                color: '#E76A35',
                data: personData
              },
              {
                name: 'Animal',
                type: 'column',
                color: '#2CA02C',
                data: animalData
              },
              {
                name: 'Other',
                type: 'column',
                color: '#B5B5B5',
                data: otherData
              }
            ]
          };
          this.updateFlag = true;
        }
      },
      error: (error) => {
        console.error('Failed to load month-wise event summary:', error);
      }
    });
  }

}
