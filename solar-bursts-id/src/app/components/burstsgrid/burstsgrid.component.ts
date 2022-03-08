import { Component, HostListener, Input, OnInit } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid
} from "ng-apexcharts";
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
}
@Component({
  selector: 'app-burstsgrid',
  templateUrl: './burstsgrid.component.html',
  styleUrls: ['./burstsgrid.component.css']
})
export class BurstsgridComponent implements OnInit {
  @Input('data') data:number[][][] = []
  @Input('editable') editable:boolean = false;
  rejectedBursts:number[] = []
  public chartOptions:Partial<ChartOptions>[] = []
  metaData:any[] = [];
  mapClass:Function = (burst:number[][])=>{
    if(this.rejectedBursts.includes(this.data.indexOf(burst))){
      return 'disabled';
    }
    return ''
  }
  innerWidth!: number;
  displayedColumns!: string[];
  filterAccepted(data:number[][][]){
    return data.filter((v,i,[])=>!this.rejectedBursts.includes(i));
  }
  filterRejected(data:number[][][]){
    console.log('rejcheck')
    return data.filter((v,i,[])=>this.rejectedBursts.includes(i))
  }
  constructor() {
  }
  public accentColor:string = '#ffd640';
  public primaryColor:string = '#683ab7'
  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.displayedColumns = ['max','maxAt','avg']
    this.metaData = this.data.map((burst:number[][],i:number,[])=>{
      return {
        'max': Math.round(Math.max(...burst[1])*100)/100,
        'maxAt':Math.round(burst[0][burst[1].indexOf(Math.max(...burst[1]))]*100)/100,
        'avg':Math.round(burst[1].reduce((x,y)=>(x+y),0)/burst[1].length*100)/100
      }
    })
    this.chartOptions = this.data.map((burst:number[][],i:number,[])=>{
      return {
        series: [
          {
            name: `Burst ${i+1}`,
            data: burst[1].map(v=>Math.round(v*100)/100),
            color:this.primaryColor//primary
          }
        ],
        chart: {
          // height: 350,
          width:'150%',
          type: "line",
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "straight"
        },
        title: {
          text: `Burst ${i+1}`,
          align: "left"
        },
        grid: {
          row: {
            colors: [this.accentColor, "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
             
          },
        },
        xaxis: {
          categories: burst[0].map(v=>Math.round(v*100)/100).map(v=>v.toString())
        }
      };
  
    })
    this.data.filter((v,i,[])=>this.rejectedBursts.includes(i))
  }
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.innerWidth = window.innerWidth;
    console.log(this.innerWidth)
  }
}
