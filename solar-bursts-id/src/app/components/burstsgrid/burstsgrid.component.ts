import { Component, HostListener, Inject, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
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
import { DataService } from 'src/app/data.service';
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
  @ViewChildren('expanel') expanels!:QueryList<MatExpansionPanel>;
  rejectedBursts:number[] = []
  tableMode:boolean = false;
  // viewMode:string='table';//can be 'grid'
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
  innerWidth!: number;
  displayedColumns!: string[];
  displayedColumnsMain!:string[];
  filterAccepted(data:any[]){
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
  constructor(public dialog:MatDialog) {
  }
  public accentColor:string = '#ffd640';
  public primaryColor:string = '#683ab7';
    ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.displayedColumns = ['max','maxAt','avg']
    this.displayedColumnsMain = ['number','burst',...this.displayedColumns]
    this.metaData = this.data.map((burst:number[][],i:number,[])=>{
      return {
        'max': Math.round(Math.max(...burst[1])*100)/100,
        'maxAt':Math.round(burst[0][burst[1].indexOf(Math.max(...burst[1]))]*100)/100,
        'avg':Math.round(burst[1].reduce((x,y)=>(x+y),0)/burst[1].length*100)/100
      }
    })
    this.tableData = this.data.map((burst,i,[])=>{
      let meta = this.metaData;  
      return {number:(i+1),burst:burst,...meta[i]};
      })
  
  
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
  styleUrls: ['./burstsgrid.component.css']
})
export class DialogOptionsDialog implements OnInit{
  constructor(
    public dialogRef:MatDialogRef<DialogOptionsDialog>,
    @Inject(MAT_DIALOG_DATA) public data:DialogData,
    private dataService:DataService
  ){}
  updateData(){
    this.dataService.toggleVars(this.binSzValue,this.varSzValue).subscribe(v=>{
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