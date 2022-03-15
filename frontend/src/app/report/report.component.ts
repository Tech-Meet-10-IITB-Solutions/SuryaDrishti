import { Component, ElementRef, HostListener, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
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
import { __values } from 'tslib';
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
  ChiSq:number,
  A:number,
  B:number,
  C:number,
  D:number
}
export interface statModelData{
  time:number[],
  rates:number[],
  fit:number[],
  is_detected:boolean,
  fit_params:statModelParams,
  duration:number
}
export interface burstRow{
  bg_rate:number,
  peak_time:number,
  peak_rate:number,
  ml_conf:number,
  lm:statModelData,
  ns:statModelData,
  class:string
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
  filterAccepted(data:Partial<burstRow>[]){
    return data.filter((v,i,[])=>!this.rejectedBursts.includes(i));
  }
  filterRejected(data:Partial<burstRow>[]){
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
      let ns = obj.ns;
      if(ns){
        obj.ns = {
          ...ns,
          time:ns.time.filter((mom,j,[])=>(ns!.rates[j]!==null)),
          rates:ns.rates.filter((mom,j,[])=>(ns!.rates[j]!==null))
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
  sortables = [
    {viewValue:'Peak Value',value:'peak_rate'},
    {viewValue:'Peak Time',value:'peak_time'},
    {viewValue:'Characteristic',value:'class'},
    {viewValue:'Confidence',value:'ml_conf'},
    {viewValue:'Chi Sq (ns)',value:'chisq-ns'},
    {viewValue:'Chi Sq (lm)',value:'chisq-lm'}
  ]
  // templateBursts:burstRow[] = [
  //   {
  //       "peak_time": 30,
  //       "peak_rate": 150,
  //       "bg_rate": 140,
  //       "ml_conf": 60,
  //       "class": "A",
  //       "ns": {
  //           "time": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "rates": [
  //               2,
  //               3,
  //               4,
  //               1,
  //               5
  //           ],
  //           "fit": [
  //               1,
  //               2,
  //               3,
  //               4,
  //               5,
  //               6
  //           ],
  //           "is_detected": true,
  //           "fit_params": {
  //               "ChiSq": 90,
  //               "A": 8,
  //               "B": 89,
  //               "C": 23,
  //               "D": 43
  //           }
  //       },
  //       "lm": {
  //           "time": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "rates": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "fit": [
  //               1,
  //               2,
  //               3,
  //               4,
  //               5,
  //               6
  //           ],
  //           "is_detected": true,
  //           "fit_params": {
  //               "ChiSq": 90,
  //               "A": 8,
  //               "B": 89,
  //               "C": 23,
  //               "D": 43
  //           }
  //       }
  //   },
  //   {
  //       "peak_time": 34,
  //       "peak_rate": 150,
  //       "bg_rate": 140,
  //       "ml_conf": 60,
  //       "class": "A",
  //       "ns": {
  //           "time": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "rates": [
  //               2,
  //               3,
  //               4,
  //               1,
  //               5
  //           ],
  //           "fit": [
  //               1,
  //               2,
  //               3,
  //               4,
  //               5,
  //               6
  //           ],
  //           "is_detected": true,
  //           "fit_params": {
  //               "ChiSq": 90,
  //               "A": 8,
  //               "B": 89,
  //               "C": 23,
  //               "D": 43
  //           }
  //       },
  //       "lm": {
  //           "time": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "rates": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "fit": [
  //               1,
  //               2,
  //               3,
  //               4,
  //               5,
  //               6
  //           ],
  //           "is_detected": true,
  //           "fit_params": {
  //               "ChiSq": 90,
  //               "A": 8,
  //               "B": 89,
  //               "C": 23,
  //               "D": 43
  //           }
  //       }
  //   },
  //   {
  //       "peak_time": 56,
  //       "peak_rate": 150,
  //       "bg_rate": 140,
  //       "ml_conf": 60,
  //       "class": "A",
  //       "ns": {
  //           "time": [
  //               0,
  //               2,
  //               3,
  //               5
  //           ],
  //           "rates": [
  //               2,
  //               4,
  //               1,
  //               5
  //           ],
  //           "fit": [
  //               1,
  //               2,
  //               3,
  //               4,
  //               5,
  //               6
  //           ],
  //           "is_detected": true,
  //           "fit_params": {
  //               "ChiSq": 90,
  //               "A": 8,
  //               "B": 89,
  //               "C": 23,
  //               "D": 43
  //           }
  //       },
  //       "lm": {
  //           "time": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "rates": [
  //               0,
  //               1,
  //               2,
  //               3,
  //               5
  //           ],
  //           "fit": [
  //               1,
  //               2,
  //               3,
  //               4,
  //               5,
  //               6
  //           ],
  //           "is_detected": true,
  //           "fit_params": {
  //               "ChiSq": 90,
  //               "A": 8,
  //               "B": 89,
  //               "C": 23,
  //               "D": 43
  //           }
  //       }
  //   }
// ]
  allowUnload:boolean = false;
  public accentColor:string = '#ffd640';
  public primaryColor:string = '#683ab7';
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    // event.preventDefault()
    if(!this.allowUnload){
      window.opener.location.reload();
    }

}
stringMap(burst1:Partial<burstRow>):Map<string,number>{
  let map = new Map<string,number>();
  map.set('peak_time',burst1.peak_time!)
  map.set('peak_rate',burst1.peak_rate!)
  map.set('ml_conf',burst1.ml_conf!)
  map.set('class',-burst1.class?.charCodeAt(0)!)
  map.set('chisq-ns',burst1.ns?burst1.ns?.fit_params.ChiSq:Infinity)
  map.set('chisq-lm',burst1.lm?burst1.lm.fit_params.ChiSq:Infinity)
  return map;
}
sortBursts(value:string){

  let RBursts = this.filterRejected(this.bursts)
  let key = value
  let tieBreakerKey = 'peak_time';
  this.rejectedBursts = []
  // console.log(value.source.value)
  this.bursts = this.bursts.sort((burst1:Partial<burstRow>, burst2:Partial<burstRow>)=>{
    let map1 = this.stringMap(burst1)
    let map2 = this.stringMap(burst2)
    let compval = (map1.get(key)! - map2.get(key)!)
    if(compval===0){
      compval = (map1.get(tieBreakerKey)! - map2.get(tieBreakerKey)!)
    }
    return compval;
  })

  this.rejectedBursts = RBursts.map(v=>this.bursts.indexOf(v));
}
revertToUploadPage(){
  this.allowUnload = true;
  window.location.href = '/upload'
}
    ngOnInit(): void {
    this.server.getBursts().subscribe((data:any)=>{
      console.log(data)
      console.log(JSON.parse(data.flares))
      this.bursts = JSON.parse(data.flares)
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