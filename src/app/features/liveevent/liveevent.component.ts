import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconsComponent } from '../../shared/components/icons/icons.component';
import { CameraService } from '../../core/services/camera.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ObjectTypeService } from '../../core/services/object-type.service';
import { HistoricaleventService } from '../../core/services/historicalevent.service';
import { CapitalizeFirstPipe } from "../../shared/pipes/capitalize-first.pipe";
import { CommonService } from '../../core/services/common.service';
declare var bootstrap: any;



@Component({
  selector: 'app-liveevent',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, IconsComponent, FormsModule, CommonModule, NgSelectModule, CapitalizeFirstPipe],
  templateUrl: './liveevent.component.html',
  styleUrl: './liveevent.component.scss'
})
export class LiveeventComponent {

  constructor(private cameraService: CameraService, private objTypeService: ObjectTypeService, private historicalEventService: HistoricaleventService, public commonService: CommonService) {

  }

  ngOnInit() {
    this.GetCameraDropdownList();
    // this.GetObjectTypeDropdownList();
    this.startLiveEvents();
  }
  ngAfterViewInit(): void {

  }

  cameraArr: any[] = []
  GetCameraDropdownList() {
    this.cameraService.GetCameraDropdownList().subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.cameraArr = res.data;
        }
        else {
          this.cameraArr = [];
        }
      },
      error: (error) => {

      }
    })
  }

  typeArr: any[] = []
  GetObjectTypeDropdownList() {
    this.objTypeService.GetObjectTypeDropdownList().subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.typeArr = res.data;
        }
        else {
          this.typeArr = [];
        }
      },
      error: (error) => {

      }
    })
  }
  liveEventArr: any[] = [];
  activePersonCameraId:any='';
  activeVehicleCameraId:any='';
  activeAnimalCameraId:any='';
  activeOtherCameraId:any='';
  liveEventsMap: { [key: string]: any[] } = {};
  getLiveEvents() {
    this.historicalEventService.getLiveEvents(this.activePersonCameraId, this.activeVehicleCameraId, this.activeAnimalCameraId, this.activeOtherCameraId).subscribe({
      next: (res) => {
        this.liveEventsMap = {};

        if (res.statusCode === 200 && res.data) {
          res.data.forEach((item: any) => {
            this.liveEventsMap[item.object.toLowerCase()] = item.events;
          });
        }
      },
      error: (error) => {

      }
    })
  }

  selectedCameraId: string = '';
  selectedType: string = '';

  activeCameraId: string = '';
  activeType: string = '';

  applyFilter() {
    // this.activeCameraId = this.selectedCameraId;
    // this.activeType = this.selectedType;

    this.getLiveEvents();
    this.restartLiveEvents();
  }

  restartLiveEvents() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(() => this.getLiveEvents(), 1000);
  }
  refreshInterval: any;
  startLiveEvents() {
    this.refreshInterval = setInterval(() => {
      this.getLiveEvents();
    }, 1000);
  }

  stopLiveEvents() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  ngOnDestroy() {
    this.stopLiveEvents();
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

  isAnimalOpen = false;
  isOthersOpen = false;
  isVehicleOpen = false;
  isHumanOpen = false;
  toggleCollapse(type: 'human'|'vehicle'|'animal' | 'others') {
    if (type === 'human') {
      this.isHumanOpen = !this.isHumanOpen;
    } else if (type === 'vehicle') {
      this.isVehicleOpen = !this.isVehicleOpen;
    }else if (type === 'animal') {
      this.isAnimalOpen = !this.isAnimalOpen;
    }else if (type === 'others') {
      this.isOthersOpen = !this.isOthersOpen;
    }
  }
}
