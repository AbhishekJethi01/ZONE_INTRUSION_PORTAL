import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QueryParam } from '../models/queryparam';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions: any = {};
  constructor(private http: HttpClient) {

  }

  get(path: string, params: QueryParam[] = [],): Observable<any> {
    let paramData = "";
    if (params != null && params != undefined && params.length > 0) {
      paramData = "?";
      params.forEach(function (param) {
        paramData += (paramData != "?" ? "&" : "");
        paramData += (param.key + "=" + param.value);
      });
    }
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*"
      })
    };
    return this.http.get<any>(path + paramData, this.httpOptions)
  }
  post(path: string, jsonData?: any): Observable<any> {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*"
      })
    };
    return this.http.post(path, jsonData, this.httpOptions)
  }

  patch(path: string, id?: number, jsonData?: any, params: QueryParam[] = []): Observable<any> {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*"
      })
    };
    let paramData = "";
    if (params != null && params != undefined && params.length > 0) {
      paramData = "?";
      params.forEach(function (param) {
        paramData += (paramData != "?" ? "&" : "");
        paramData += (param.key + "=" + param.value);
      });
    }
    if (id != 0 && id != null) {
      return this.http.patch(path + id, jsonData, this.httpOptions)
    } else {
      return this.http.patch(path, jsonData, this.httpOptions)
    }
  }

  delete(path: string, id: number): Observable<any> {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*"
      })
    };
    return this.http.delete(path + id, this.httpOptions)
  }

  deleteBulk(path: string, ids: number[]): Observable<any> {
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
  };
  // The backend expects an array of IDs in the body
  return this.http.request('delete', path, { body: ids, ...httpOptions });
}

}
