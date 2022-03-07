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
  barCats:string[] = []
  barDataIn:boolean = false;
  //fake data getters:
  
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
  title = 'solar-bursts-id';
}
