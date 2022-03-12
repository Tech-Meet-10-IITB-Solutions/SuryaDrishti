import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const baseUrl = 'http://127.0.0.1:8000/';
const httpop = {
  headers: new HttpHeaders({
    'Content-Type':'application/json',
  })
}
@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(
    private http: HttpClient
  ) { }
  sendFiles(files:any[]){
    let uploadData = new FormData();
    console.log(files[0].name);
    uploadData.append('file1',files[0],files[0].name)
    // for(let i=0;i<files.length;i++){
    //   uploadData.append(`file${i}`,files[i],files[i].name)
    // }
    return this.http.post(baseUrl+'upload',uploadData)
  }
  getProgress(){
    return this.http.get(baseUrl+'output',httpop);
  }
  
  toggleVars(b:number,v:number){
    return this.http.get('')
  }
  getBursts(){
    return this.http.get(baseUrl+'bursts',httpop)
  }
  request(method: string, route: string, data?: any) {
    if (method === 'GET') {
      return this.get(route, data);
    }
    else if (method === 'POST') {
      return this.post(route, data);
    }

    return this.http.request(method, baseUrl + route, {
      body: data,
      responseType: 'json',
      observe: 'body',
    });
  }

  get(route: string, data?: any): Observable<any> {
    let params = new HttpParams();
    if (data !== undefined) {
      Object.getOwnPropertyNames(data).forEach(key => {
        params = params.set(key, data[key]);
      });
    }

    return this.http.get(baseUrl + route, {
      responseType: 'json',
      params
    });
  }

  post(route: string, data?: any): Observable<any> {
    return this.http.post(baseUrl + route, data);
  }

}
