import { Component,ViewChild } from '@angular/core';
import { BGData, DataRow } from './interfaces';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { UploaderComponent } from './components/uploader/uploader.component';
export type ChartOptions = {
  series:ApexAxisChartSeries;
  chart:ApexChart;
  xaxis:ApexXAxis;
  title:ApexTitleSubtitle;
};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  @ViewChild('uploader') uploader!:UploaderComponent;
  tableData:DataRow[] = []
  barData:number[] = []
  title = 'solar-bursts-id';
  barCats:string[] = []
  barDataIn:boolean = false;
  initialBursts!:any[]
  //fake data getters:
  pages:string[] = [
    'upload',
    'view',
    'submitML',
    'MLRes'
  ]
  currentPageIndex:number = 0;
  getTableData(){
    return new Promise<DataRow[]>((resolve,reject)=>{
      setTimeout(()=>{
        resolve(
          [
            {name:'Hydrogen',age:13},
            {name:'Oxygen',age:26}
          ]
        )
      },1000)
    })
  }
  getBarGraphData(){
    return new Promise<BGData>((resolve,reject)=>{
      setTimeout(()=>{
        resolve(
            {
              data:[10,41,35,51,49,62,69,91,148],
              cats:["Jan","Feb",  "Mar",  "Apr",  "May",  "Jun",  "Jul",  "Aug", "Sep"]
            }
        )
      },1000)
    })
  }
  onDataReceived(msg:string){
    if(msg==='OK'){
      this.initialBursts = [this.uploader.finalData];
      this.currentPageIndex = 1;
    }
  }
  constructor(){
    this.getTableData().then((d:DataRow[])=>{
      this.tableData = d
    })
    this.getBarGraphData().then((d:BGData)=>{
      this.barCats = d.cats;
      this.barData = d.data;
      this.barDataIn = true;
    })
  }

}
