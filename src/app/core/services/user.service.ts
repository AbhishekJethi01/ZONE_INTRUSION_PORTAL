import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { QueryParam } from '../models/queryparam';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrl: string = environment.apiUrl;
  constructor(private apiService: ApiService) { }

  getUsers(data: any) {
    const path = this.apiUrl + `/User/Get`;
    return this.apiService.post(path, data)
  }

  GetUserByUserId(id: any) {
    const path = this.apiUrl + `/User/GetUserByUserId`;
    let params: QueryParam[] = [];
    params.push(new QueryParam('id', id));
    return this.apiService.get(path, params);
  }

  createUser(data: any) {
    const path = this.apiUrl + `/User`;
    return this.apiService.post(path, data)
  }

  updateUser(userId: any, data: any) {
    const path = this.apiUrl + `/User/`;
    return this.apiService.patch(path, userId, data);
  }

  deleteUser(userId: any) {
    const path = this.apiUrl + `/User/`;
    return this.apiService.delete(path, userId);
  }

  changePassword(data:any) {
    const path = this.apiUrl +'/User/ChangePassword/';
    return this.apiService.patch(path,0,data);
  }
}
