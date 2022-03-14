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
import { BurstsgridComponent } from './components/burstsgrid/burstsgrid.component';
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
  @ViewChild('burstsgrid') burstsGrid!:BurstsgridComponent;
  tableData:DataRow[] = []
  barData:number[] = []
  title = 'solar-bursts-id';
  barCats:string[] = []
  barDataIn:boolean = false;
  templateBursts:any[] = [[[0.66361585, 0.19570452, 0.3010042 , 0.1022942 , 0.35273135,
    0.60787727, 0.4683166 , 0.03884178, 0.8818553 , 0.40627459],
   [0.14801241, 0.15059311, 0.46420995, 0.63510806, 0.34974886,
    0.43099543, 0.52566514, 0.37160136, 0.62028155, 0.41485215]],

  [[0.70262627, 0.28641892, 0.27907077, 0.04417391, 0.65528474,
    0.59121929, 0.86423297, 0.70655667, 0.03458768, 0.77122163],
   [0.37722447, 0.51303201, 0.78308071, 0.91309123, 0.08422122,
    0.19679446, 0.08000246, 0.40721845, 0.40559652, 0.72174103]],

  [[0.81018098, 0.28574077, 0.94623167, 0.91542184, 0.03189118,
    0.64617085, 0.29469064, 0.78178817, 0.94890709, 0.64762296],
   [0.8069827 , 0.86410916, 0.32724184, 0.98662526, 0.87679195,
    0.042341  , 0.77119757, 0.29390558, 0.59216761, 0.24431405]],

  [[0.05897947, 0.74108496, 0.47170135, 0.18115059, 0.94594927,
    0.12313712, 0.07095631, 0.91993654, 0.36789501, 0.37977123],
   [0.21353504, 0.14038643, 0.42459592, 0.44727657, 0.23069191,
    0.14925403, 0.57723592, 0.72887829, 0.47797222, 0.8917914 ]],

  [[0.4102337 , 0.76441388, 0.03977494, 0.10130187, 0.65059277,
    0.22541663, 0.54586398, 0.34385462, 0.44642106, 0.48643267],
   [0.49880711, 0.23930156, 0.99678554, 0.06422039, 0.50307972,
    0.63169952, 0.07834523, 0.51238499, 0.17506935, 0.44205737]]]
  initialBursts:any[] = [[[]]]
  //fake data getters:
  pages:string[] = [
    'upload',
    'view',
    'submitML',
    'MLRes'
  ]
  burstListEditable:boolean = false;
  currentPageIndex:number = 1;
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
  revertToUploadPage(){
    this.currentPageIndex = 0;
    
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
  proceedToML(){
    //send data to backend.
    console.log(this.burstsGrid.rejectedBursts)
    
    this.currentPageIndex = 2;
  }
  onDataReceived(msg:string){
    if(msg==='OK'){
      this.initialBursts = this.uploader.finalData.bursts;
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
