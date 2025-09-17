import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { QueryParam } from '../models/queryparam';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HistoricaleventService {
  apiUrl: string = environment.apiUrl;
  constructor(private apiService: ApiService) { }

  getLastTenDaySummary() {
    const path = this.apiUrl + `/Event/GetLastTenDaySummary`;
    let params: QueryParam[] = [];
    return this.apiService.get(path, params);
  }

  getTodayDashboardSummary() {
    const path = this.apiUrl + `/Event/GetTodayDashboardSummary`;
    let params: QueryParam[] = [];
    return this.apiService.get(path, params);
  }

  GetMonthWiseEventSummary() {
    const path = this.apiUrl + `/Event/GetMonthWiseEventSummary`;
    let params: QueryParam[] = [];
    return this.apiService.get(path, params);
  }

  getLiveEvents(personCameraId: any, vehicleCameraId: any, animalCameraId: any, otherCameraId: any) {
    const path = this.apiUrl + `/Event/GetLatestEvents`;
    let params: QueryParam[] = [];
    if (personCameraId)
      params.push(new QueryParam('personCameraId', personCameraId));
    if (vehicleCameraId)
      params.push(new QueryParam('vehicleCameraId', vehicleCameraId));
    if (animalCameraId)
      params.push(new QueryParam('animalCameraId', animalCameraId));
    if (otherCameraId)
      params.push(new QueryParam('otherCameraId', otherCameraId));
    return this.apiService.get(path, params);
  }

  getEvents(data:any){
    const path = this.apiUrl + `/Event/Get`;
    return this.apiService.post(path,data)
  }
}
