import { Component, Input, OnInit, ViewChild } from "@angular/core";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexTooltip,
  ApexXAxis,
  ApexLegend,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexMarkers,
  ApexStroke
} from "ng-apexcharts";
import { burstRow, point, statModelData } from "src/app/report/report.component";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  markers: ApexMarkers;
  stroke: ApexStroke;
  yaxis: ApexYAxis | ApexYAxis[];
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
};

@Component({
  selector: "app-linescatter",
  templateUrl: "./linescatter.component.html",
  styleUrls: ["./linescatter.component.scss"]
})
export class LinescatterComponent implements OnInit {
  title = "CodeSandbox";
  // @Input('scatterData') scatterData!:any[]
  scatterData!:any[]
  // @Input('lineData') lineData!:any[]
  @Input('burst') burst!:burstRow;
  @Input('innerWidth') innerWidth!:number;
  @Input('statData') statData!:statModelData;
  @Input('ptscatterData') ptscatterData!:point[];
  @ViewChild("chart") chart!: ChartComponent;
  @Input() tickAmt:number|undefined = 20;
  public chartOptions!: Partial<ChartOptions>;
  @Input('ptlineData') ptlineData!:point[]
  @Input() chartHeight!:number;
  getScatterData(statData:statModelData){
    if(statData){
      return statData.true_data;
    }
    return []
  }
  getLineData(statData:statModelData){
    if(statData){
      return statData.fit_data;
    }
    return []
  }
  constructor() {}  
  ngOnInit() {

    console.log(this.statData)
    
  this.chartOptions = {series: [
    {
        name: "True Data",
        type: "scatter",
        data: this.getScatterData(this.statData)
    },
    {
        name: "Fit",
        type: "line",
        data: this.getLineData(this.statData)
    }
],
chart: {
    width: 450,
    type: "line",
    stacked: false,
    animations:{
      enabled:false
    }
},
dataLabels: {
    enabled: false
},
stroke: {
    width: [0, 5]
},
yaxis: [
    {
        axisTicks: {
            show: true
        },
        axisBorder: {
            show: true,
            color: "#008FFB"
        },
        labels: {
            style: {
                colors: "#008FFB"
            }
        },
        title: {
            text: "Photon FPS",
            style: {
                color: "#000000"
            }
        },
        tooltip: {
            enabled: true
        }
    },

],
xaxis:{
  tickAmount:10
},
markers: {
    size: [5, 1]
}}
}


}
