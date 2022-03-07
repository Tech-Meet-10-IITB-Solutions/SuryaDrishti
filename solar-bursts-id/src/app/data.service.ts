import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders,HttpParams} from '@angular/common/http';
const httpop = {
  headers: new HttpHeaders({
    'Content-Type':'application/json',
  })
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  apiroot:string = 'http://127.0.0.1:8000/'
  constructor(private http:HttpClient) {}
  sendFiles(files:any[]){
    let uploadData = new FormData();
    for(let i=0;i<files.length;i++){
      uploadData.append(`file${i}`,files[i],files[i].name)
    }
    return this.http.post<any>(this.apiroot+'upload',uploadData)
  }
}
