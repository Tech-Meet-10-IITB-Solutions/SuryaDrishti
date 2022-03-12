import { Component, ElementRef, HostListener, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
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
import { ServerService } from 'src/app/server.service';
import { LinescatterComponent } from '../components/linescatter/linescatter.component';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
}
export interface statModelParams{
  chiSq:number,
  A:number,
  B:number,
  C:number,
  D:number
}
export interface statModelData{
  moments:number[],
  rate:number[],
  fit:number[],
  isDetected:boolean,
  params:statModelParams
}
export interface burstRow{
  BGValue:number,
  peakTime:number,
  peakValue:number,
  MLConf:number,
  LM:statModelData,
  NS:statModelData,
  Char:string
}
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  @Input('data') data:number[][][] = []
  @Input('editable') editable:boolean = false;
  @ViewChildren('expanel') expanels!:QueryList<MatExpansionPanel>;
  @ViewChildren('chartcell') chartcell!:QueryList<ElementRef>;
  @ViewChild('charts') charts!:ElementRef;
  @ViewChildren('linescatter') linescatters!:QueryList<LinescatterComponent>;
  rejectedBursts:number[] = []
  burstListEditable:boolean = false;
  tableMode:boolean = true;
  public chartOptions:Partial<ChartOptions>[] = []
  public tableChartOptions:Partial<ChartOptions>[] = []
  metaData:any[] = [];
  tableData:any[] = [];
  binSzMin:number = 5;
  binSzMax:number=  50;
  binSzValue:number = 10;
  varSzMin:number = 5;
  varSzMax:number=  50;
  varSzValue:number = 10;

  mapClass:Function = (burst:number[][])=>{
    if(this.rejectedBursts.includes(this.data.indexOf(burst))){
      return 'disabled';
    }
    return ''
  }
  proceedToML(){}

  innerWidth!: number;
  displayedColumns!: string[];
  displayedColumnsMain!:string[];
  filterAccepted(data:burstRow[]){
    return data.filter((v,i,[])=>!this.rejectedBursts.includes(i));
  }
  filterRejected(data:any[]){
    console.log('rejcheck')
    return data.filter((v,i,[])=>this.rejectedBursts.includes(i))
  }
  openPanel(burstIndex:number){
    const dialogRef = this.dialog.open(DialogOptionsDialog,{
      data:{
        burst:this.data[burstIndex],
        burstIndex:burstIndex,
        chartOptions:this.chartOptions[burstIndex],
        metaData:this.metaData[burstIndex],
        accentColor:this.accentColor,
        primaryColor:this.primaryColor,
        displayedColumns:this.displayedColumns
      }
    });
    dialogRef
    // let tempPanels = this.expanels.toArray()
    // const state:string = tempPanels[burstIndex]._getExpandedState()
    // if(state==='expanded'){
    //   tempPanels[burstIndex].close();
    // }
    // else{
    //   //collapsed
    //   tempPanels[burstIndex].open();
    // }
  }
  cleanedData(data:burstRow[]){
    let cleaned = data.map((burst:burstRow,j,[])=>{
      return {
        ...burst,
        NS:{
          ...burst.NS,
          moments:burst.NS.moments.filter((mom,j,[])=>(burst.NS.rate[j]!==null)),
          rate:burst.NS.rate.filter((mom,j,[])=>(burst.NS.rate[j]!==null))
        },
        LM:{
          ...burst.LM,
          moments:burst.LM.moments.filter((mom,j,[])=>(burst.LM.rate[j]!==null)),
          rate:burst.LM.moments.filter((mom,j,[])=>(burst.LM.rate[j]!==null))
        }
      }
    })
    return cleaned;
  }
  constructor(public dialog:MatDialog,private server:ServerService) {
  }
  scatterData!:any[]
  lineData!:any[]
  bursts:burstRow[] = []
  mapChartOptions!:Function
  public accentColor:string = '#ffd640';
  public primaryColor:string = '#683ab7';
    ngOnInit(): void {
    this.server.getBursts().subscribe((data:any)=>{
      this.bursts = this.cleanedData(data)
      // console.log(this)
      for(let j=0;j<this.bursts.length;j++){
        this.linescatters.toArray()[j].updateChartOptions(this.bursts[j])
      }
      console.log(this.bursts)

    })
    this.innerWidth = window.innerWidth;
    // this.displayedColumns = ['max','maxAt','avg']
    this.displayedColumnsMain = ['peakTime','meta','chartNS']
    this.tableData = this.data.map((burst,i,[])=>{
      let meta = this.metaData;  
      return {number:(i+1),burst:burst,...meta[i]};
      })
  
    this.mapChartOptions = (burst:burstRow,type:number)=>{
      return {
        series: [
          {
            name: `Burst Fit at ${burst.peakTime}`,
            type: 'line',
            data: type===0?burst.NS.fit:burst.LM.fit,
            color:this.primaryColor,//primary
          },
          {
            name: `Burst Data at ${burst.peakTime}`,
            type:'scatter',
            data:type===0?burst.NS.rate:burst.LM.rate
          }
        ],
        chart: {
          // height: 350,
          width:'150%',
          type: "line",
          stacked:false,
          zoom: {
            enabled: false
          },
          animations:{
            enabled:false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [1, 1, 4]
        },
        title: {
          text: "Burst",
          align: "left",
          offsetX: 110
        },
        xaxis: {
          categories: type===0?burst.NS.moments:burst.LM.moments
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
                color: "#008FFB"
              }
            },
            title: {
              text: "Power???",
              style: {
                color: "#008FFB"
              }
            },
            tooltip: {
              enabled: true
            }
          },
          {
            seriesName: "Income",
            opposite: true,
            axisTicks: {
              show: true
            },
            axisBorder: {
              show: true,
              color: "#00E396"
            },
            labels: {
              style: {
                color: "#00E396"
              }
            },
            title: {
              text: "Operating Cashflow (thousand crores)",
              style: {
                color: "#00E396"
              }
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
                color: "#FEB019"
              }
            },
            title: {
              text: "Revenue (thousand crores)",
              style: {
                color: "#FEB019"
              }
            }
          }
        ],
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
    this.chartOptions = this.data.map((burst:number[][],i:number,[])=>{
      return {
        series: [
          {
            name: `Burst ${i+1}`,
            data: burst[1].map(v=>Math.round(v*100)/100),
            color:this.primaryColor,//primary
          }
        ],
        chart: {
          // height: 350,
          width:'150%',
          type: "line",
          zoom: {
            enabled: false
          },
          animations:{
            enabled:false
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
        },
        
      };
  
    })
    this.tableChartOptions = this.data.map((burst,i,[])=>{
      return {
        series: [
          {
            name: `Burst ${i+1}`,
            data: burst[1].map(v=>Math.round(v*100)/100),
            color:this.primaryColor//primary
          }
        ],
        chart: {
          height: 250,
          width:300,
          type: "line",
          zoom: {
            enabled: false
          },
          animations: {
            enabled: false,
          }  
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "straight"
        },
        title: {
          text: ``,
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
export interface DialogData{
  burst:number[][];
  burstIndex:number;
  metaData:any;
  chartOptions:Partial<ChartOptions>;
  displayedColumns:string[]
  accentColor:string;
  primaryColor:string;
}
@Component({
  selector:'dialog-options',
  templateUrl:'./dialog-options.html',
  styleUrls: ['./report.component.scss']
})
export class DialogOptionsDialog implements OnInit{
  constructor(
    public dialogRef:MatDialogRef<DialogOptionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data:DialogData,
    private dataService:ServerService
  ){}
  updateData(){
    this.dataService.toggleVars(this.binSzValue,this.varSzValue).subscribe((v:any)=>{
      console.log(v)
    })
  }
  binSzMin:number = 5;
  binSzMax:number=  50;
  binSzValue:number = 10;
  varSzMin:number = 5;
  varSzMax:number=  50;
  varSzValue:number = 10;  
  ngOnInit(){
  }
}