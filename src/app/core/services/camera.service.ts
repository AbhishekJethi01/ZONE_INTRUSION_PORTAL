import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { QueryParam } from '../models/queryparam';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  apiUrl: string = environment.apiUrl;
  constructor(private apiService: ApiService,private http: HttpClient) { }

  GetCameraDropdownList(): Observable<any> {
    const path = this.apiUrl + `/Camera/GetCameraDropdownList`;
    return this.apiService.get(path);
  }

  getCamera(data: any) {
    const path = this.apiUrl + `/Camera/Get`;
    return this.apiService.post(path, data)
  }

  getCameraStatus() {
    const path = this.apiUrl + `/Camera/status`;
    let params: QueryParam[] = [];
    return this.apiService.get(path, params);
  }

  getCameraByCameraId(cameraId: any) {
    const path = this.apiUrl + `/Camera/GetCameraByCameraId`;
    let params: QueryParam[] = [];
    params.push(new QueryParam('cameraId', cameraId));
    return this.apiService.get(path, params);
  }

  createCamera(data: any) {
    const path = this.apiUrl + `/Camera`;
    return this.apiService.post(path, data)
  }

  updateCamera(cameraId: any, data: any) {
    const path = this.apiUrl + `/Camera/`
    return this.apiService.patch(path, cameraId, data);
  }

  deleteCamera(cameraId: any) {
    const path = this.apiUrl + `/Camera/`;
    return this.apiService.delete(path, cameraId);
  }

  getSnapshot(rtspUrl: string) {
    const path = this.apiUrl + `/Camera/GetCameraFrame`;

    const params = new HttpParams().set('cameraName', rtspUrl);

    return this.http.get(path, {
      params: params,
      responseType: 'blob'
    });
  }
}
