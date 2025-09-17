import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObjectTypeService {
  apiUrl: string = environment.apiUrl;
  constructor(private apiService: ApiService) { }

  GetObjectTypeDropdownList(): Observable<any> {
      const path = this.apiUrl + `/ObjectType/GetObjectTypeDropdownList`;
      return this.apiService.get(path);
    }
}
