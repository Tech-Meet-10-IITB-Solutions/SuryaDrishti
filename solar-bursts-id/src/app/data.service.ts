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
    console.log(files[0].name);
    uploadData.append('file1',files[0],files[0].name)
    // for(let i=0;i<files.length;i++){
    //   uploadData.append(`file${i}`,files[i],files[i].name)
    // }
    return this.http.post(this.apiroot+'upload',uploadData)
  }
  getOutput(){
    return this.http.get(this.apiroot+'output',httpop);
  }
}
