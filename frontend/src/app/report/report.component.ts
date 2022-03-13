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
import { BurstTableComponent } from '../components/burst-table/burst-table.component';
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
  @ViewChildren('burstTable') burstTable!:QueryList<BurstTableComponent>
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
  invertEditable(){
    this.burstListEditable = !this.burstListEditable
    for(let i=0;i<this.burstTable.length;i++){
      this.burstTable.toArray()[i].burstListEditable = !this.burstTable.toArray()[i].burstListEditable
    }
  }
  filterAccepted(data:burstRow[]){
    return data.filter((v,i,[])=>!this.rejectedBursts.includes(i));
  }
  filterRejected(data:any[]){
    // console.log('rejcheck')
    return data.filter((v,i,[])=>this.rejectedBursts.includes(i))
  }
  removeBurst(ev:number){
    this.rejectedBursts.push(ev)
    this.burstTable.toArray()[1].rejectedBursts.push(ev)
  }
  addBurst(ev:number){
    this.rejectedBursts.splice(this.rejectedBursts.indexOf(ev),1)
    this.burstTable.toArray()[0].rejectedBursts.splice(this.burstTable.toArray()[0].rejectedBursts.indexOf(ev),1)
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
  cleanedData(data:Partial<burstRow>[]){
    let cleaned = data.map((burst:Partial<burstRow>,j,[])=>{
      let obj = {...burst}
      let NS = obj.NS;
      if(NS){
        obj.NS = {
          ...NS,
          moments:NS.moments.filter((mom,j,[])=>(NS!.rate[j]!==null)),
          rate:NS.rate.filter((mom,j,[])=>(NS!.rate[j]!==null))
        }
      }
      return obj
      }
    )
    return cleaned;
  }
  constructor(public dialog:MatDialog,private server:ServerService) {
  }
  scatterData!:any[]
  lineData!:any[]
  bursts:Partial<burstRow>[] = []
  mapChartOptions!:Function
  templateBursts:burstRow[] = [
    {
        "peakTime": 30,
        "peakValue": 150,
        "BGValue": 140,
        "MLConf": 60,
        "Char": "A",
        "NS": {
            "moments": [
                0,
                1,
                2,
                3,
                5
            ],
            "rate": [
                2,
                3,
                4,
                1,
                5
            ],
            "fit": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "isDetected": true,
            "params": {
                "chiSq": 90,
                "A": 8,
                "B": 89,
                "C": 23,
                "D": 43
            }
        },
        "LM": {
            "moments": [
                0,
                1,
                2,
                3,
                5
            ],
            "rate": [
                0,
                1,
                2,
                3,
                5
            ],
            "fit": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "isDetected": true,
            "params": {
                "chiSq": 90,
                "A": 8,
                "B": 89,
                "C": 23,
                "D": 43
            }
        }
    },
    {
        "peakTime": 34,
        "peakValue": 150,
        "BGValue": 140,
        "MLConf": 60,
        "Char": "A",
        "NS": {
            "moments": [
                0,
                1,
                2,
                3,
                5
            ],
            "rate": [
                2,
                3,
                4,
                1,
                5
            ],
            "fit": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "isDetected": true,
            "params": {
                "chiSq": 90,
                "A": 8,
                "B": 89,
                "C": 23,
                "D": 43
            }
        },
        "LM": {
            "moments": [
                0,
                1,
                2,
                3,
                5
            ],
            "rate": [
                0,
                1,
                2,
                3,
                5
            ],
            "fit": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "isDetected": true,
            "params": {
                "chiSq": 90,
                "A": 8,
                "B": 89,
                "C": 23,
                "D": 43
            }
        }
    },
    {
        "peakTime": 56,
        "peakValue": 150,
        "BGValue": 140,
        "MLConf": 60,
        "Char": "A",
        "NS": {
            "moments": [
                0,
                2,
                3,
                5
            ],
            "rate": [
                2,
                4,
                1,
                5
            ],
            "fit": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "isDetected": true,
            "params": {
                "chiSq": 90,
                "A": 8,
                "B": 89,
                "C": 23,
                "D": 43
            }
        },
        "LM": {
            "moments": [
                0,
                1,
                2,
                3,
                5
            ],
            "rate": [
                0,
                1,
                2,
                3,
                5
            ],
            "fit": [
                1,
                2,
                3,
                4,
                5,
                6
            ],
            "isDetected": true,
            "params": {
                "chiSq": 90,
                "A": 8,
                "B": 89,
                "C": 23,
                "D": 43
            }
        }
    }
]
  public accentColor:string = '#ffd640';
  public primaryColor:string = '#683ab7';
    ngOnInit(): void {
    this.server.getBursts().subscribe((data:any)=>{
      console.log(data)
      if(data.success){
        this.bursts = this.cleanedData(data.bursts)
        console.log(this.bursts)  
      }
      else{
        window.alert(data.detail)
        window.location.href = '/upload'
      }
    },err=>{
      window.alert("ILYA an error")
      window.alert(err)
    })
    this.innerWidth = window.innerWidth;
    // this.displayedColumns = ['max','maxAt','avg']
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