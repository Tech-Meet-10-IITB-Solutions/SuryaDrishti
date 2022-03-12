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
import { burstRow } from "src/app/report/report.component";

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
  @Input('scatterData') scatterData!:any[]
  @Input('lineData') lineData!:any[]
  @Input('burst') burst!:burstRow;
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions>;
  getScatterData(burst:burstRow){
    this.scatterData = [];
    for(let i=0;i<burst.NS.moments.length;i++){
      this.scatterData.push(
        {x:burst.NS.moments[i]-0.01,y:null},
        {x:burst.NS.moments[i],y:burst.NS.rate[i]},
        {x:burst.NS.moments[i]+0.01,y:null}
        )
    }
    return this.scatterData
  }
  public updateChartOptions(burst:burstRow){
    this.chartOptions = {
      series: [
        {
          name: "Pulse",
          type: "line",
          data:burst.NS.moments.map((mom,j,[])=>{
            return {x:mom,y:burst.NS.fit[j]}
          })
        },
        {
          name: "Revenue",
          type: "line",
          data: this.getScatterData(burst)
        }
      ],
      chart: {
        height: 350,
        type:'line',
        stacked: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [20,20]
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
        },
      ],
      markers: {
        size: [30,30]
      },
      tooltip: {
        fixed: {
          enabled: true,
          position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
          offsetY: 30,
          offsetX: 60
        }
      },
      legend: {
        horizontalAlign: "left",
        offsetX: 40
      }
    };
  }
  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Pulse",
          type: "line",
          data:[]
        },
        {
          name: "Revenue",
          type: "line",
          data: []
        }
      ],
      chart: {
        height: 350,
        type:'line',
        stacked: false
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [20,20]
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
        },
      ],
      markers: {
        size: [30,30]
      },
      tooltip: {
        fixed: {
          enabled: true,
          position: "topLeft", // topRight, topLeft, bottomRight, bottomLeft
          offsetY: 30,
          offsetX: 60
        }
      },
      legend: {
        horizontalAlign: "left",
        offsetX: 40
      }
    };
  }

  ngOnInit(): void { }
}
