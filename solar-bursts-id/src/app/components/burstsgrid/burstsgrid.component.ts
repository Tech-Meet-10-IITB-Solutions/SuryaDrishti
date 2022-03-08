import { Component, Input, OnInit } from '@angular/core';
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
  mapClass:Function = (burst:number[][])=>{
    if(this.rejectedBursts.includes(this.data.indexOf(burst))){
      return 'disabled';
    }
    return ''
  }
  filterAccepted(data:number[][][]){
    return data.filter((v,i,[])=>!this.rejectedBursts.includes(i));
  }
  filterRejected(data:number[][][]){
    console.log('rejcheck')
    return data.filter((v,i,[])=>this.rejectedBursts.includes(i))
  }
  constructor() {
  }

  ngOnInit(): void {
    this.chartOptions = this.data.map((burst:number[][],i:number,[])=>{
      return {
        series: [
          {
            name: `Burst ${i+1}`,
            data: burst[1].map(v=>Math.round(v*100)/100)
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
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
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

}
