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
      this.scatterData = [];
      for(let i=0;i<statData.time.length;i++){
        this.scatterData.push(
          // {x:statData.time[i]-0.01,y:null},
          {x:statData.time[i],y:statData.rates[i]},
          // {x:statData.time[i]+0.01,y:null}
          )
      }
      return this.scatterData
    }
    return []
  }
  getLineData(statData:statModelData){
    if(statData){
      return statData.time.map((mom,j,[])=>{
        return {x:mom,y:statData.fit[j]}
      })        
    }
    return []
  }
  // public updateChartOptions(burst:burstRow){
  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: "Pulse",
  //         type: "line",
  //         data:this.getLineData(burst)
  //       },
  //       {
  //         name: "Revenue",
  //         type: "line",
  //         data: this.getScatterData(burst)
  //       }
  //     ],
  //     chart: {
  //       height: 350,
  //       type:'line',
  //       stacked: false
  //     },
  //     dataLabels: {
  //       enabled: false
  //     },
  //     stroke: {
  //       width: [20,20]
  //     },
  //     title: {
  //       text: "XYZ - Stock Analysis (2009 - 2016)",
  //       align: "left",
  //       offsetX: 110
  //     },
  //     yaxis: [
  //       {
  //         axisTicks: {
  //           show: true
  //         },
  //         axisBorder: {
  //           show: true,
  //           color: "#008FFB"
  //         },
  //         labels: {
  //           style: {
  //             colors: "#008FFB"
  //           }
  //         },
  //         title: {
  //           text: "Pulse",
  //           style: {
  //             color: "#000000"
  //           }
  //         },
  //         tooltip: {
  //           enabled: true
  //         }
  //       },
  //       {
  //         seriesName: "Revenue",
  //         opposite: true,
  //         axisTicks: {
  //           show: true
  //         },
  //         axisBorder: {
  //           show: true,
  //           color: "#FEB019"
  //         },
  //         labels: {
  //           style: {
  //             colors: "#FEB019"
  //           }
  //         },
  //         title: {
  //           text: "Income (thousand crores)",
  //           style: {
  //             color: "#008FFB"
  //           }
  //         }
  //       },
  //     ],
  //     markers: {
  //       size: [30,30]
  //     },
  //     tooltip: {
  //       fixed: {
  //         enabled: true,
  //         position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
  //         offsetY: 30,
  //         offsetX: 60
  //       }
  //     },
  //     legend: {
  //       horizontalAlign: "left",
  //       offsetX: 40
  //     }
  //   };
  // }
  constructor() {}  
  ngOnInit(): void {
    console.log(this.ptlineData)
    this.chartOptions = {
      series: [
        {
            name: "Pulse",
            type: "scatter",
            data: this.ptscatterData!==null?this.ptscatterData:this.getScatterData(this.statData)
        },
        {
            name: "Revenue",
            type: "line",
            data: this.ptlineData!==null?this.ptlineData:this.getLineData(this.statData)
        }
    ],
    chart: {
        height: 350,
        type: "line",
        stacked: false
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        width: [0, 5]
    },
    title: {
        text: "XYZ - Stock Analysis (2009 - 2016)",
        align: "left",
        offsetX: 110
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
                text: "Pulse",
                style: {
                    color: "#000000"
                }
            },
            tooltip: {
                enabled: true
            }
        },
        {
            seriesName: "Revenue",
            opposite: true,
            axisTicks: {
                show: true
            },
            axisBorder: {
                show: true,
                color: "#FEB019"
            },
            labels: {
                style: {
                    colors: "#FEB019"
                }
            },
            title: {
                text: "Income (thousand crores)",
                style: {
                    color: "#008FFB"
                }
            }
        }
    ],
    markers: {
        size: [10, 1]
    }
  };
}


}
