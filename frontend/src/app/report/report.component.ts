import { Component, ElementRef, HostListener, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
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
export interface totalData{
  start:number,
  flare_count:number,
  lc_data:point[],
  ptlineData:point[],
  file_name:string,
  chartSeries:ApexAxisChartSeries
}
export interface statModelData{
  fit_data:point[],
  true_data:point[],
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
export interface point{
  x:number,
  y:number|null
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
  totalChartMode:number = 0;
  burstsDecoded:boolean = false;
  public chartOptions:Partial<ChartOptions>[] = []
  public tableChartOptions:Partial<ChartOptions>[] = []
  metaData:any[] = [];
  tableData:any[] = [];
  binSzMin:number = 20;
  binSzMax:number=  500;
  binSzValue:number = 100;
  varSzMin:number = 5;
  varSzMax:number=  50;
  varSzValue:number = 10;
  @HostListener('window:resize', ['$event'])
  OnResize(event:any){
      this.innerWidth = window.innerWidth;
  }
  mapClass:Function = (burst:number[][])=>{
    if(this.rejectedBursts.includes(this.data.indexOf(burst))){
      return 'disabled';
    }
    return ''
  }
  totalData!: totalData;
  proceedToML(){}
  resubmit(){
    this.allowUnload = true;
    window.location.href = `report/${this.binSzValue}`
  }
  innerWidth: number = window.innerWidth;
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
      let ns = obj.ns;let lm = obj.lm;
      if(ns?.is_detected){
        obj.ns = {
          ...ns,
          fit_params:{
            A:Number.parseFloat(ns.fit_params.A.toPrecision(2)),
            B:Number.parseFloat(ns.fit_params.B.toPrecision(2)),
            C:Number.parseFloat(ns.fit_params.C.toPrecision(2)),
            D:Number.parseFloat(ns.fit_params.D.toPrecision(2)),
            ChiSq:Number.parseFloat(ns.fit_params.ChiSq.toPrecision(2)),
          }
        }
      }
      if(lm?.is_detected){
        obj.lm = {
          ...lm,
          fit_params:{
            A:Number.parseFloat(lm.fit_params.A.toPrecision(2)),
            B:Number.parseFloat(lm.fit_params.B.toPrecision(2)),
            C:Number.parseFloat(lm.fit_params.C.toPrecision(2)),
            D:Number.parseFloat(lm.fit_params.D.toPrecision(2)),
            ChiSq:Number.parseFloat(lm.fit_params.ChiSq.toPrecision(2)),
          }
        }
      }
      obj.bg_rate = Math.round(100*obj.bg_rate!)/100
      obj.ml_conf = Math.round(100*obj.ml_conf!)/100
      obj.peak_rate = Math.round(100*obj.peak_rate!)/100
      obj.peak_time = Math.round(obj.peak_time!)
      return obj
      }
    )
    return cleaned;
  }
  constructor(public dialog:MatDialog,
    private server:ServerService,
    private router:Router,
    private route:ActivatedRoute) {
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
    let binsize = JSON.parse(JSON.stringify(this.route.snapshot.paramMap.get('binsize') || '{}'));
    console.log(binsize)
    this.binSzValue = binsize
    this.server.getBursts(binsize).subscribe((data:any)=>{
      console.log(data)
      // console.log(JSON.parse(data.flares))
      this.bursts = this.cleanedData(data.flares)
      
      this.totalData = {
        ...data.total,
         start:Math.round(data.total.start),
          ptlineData:this.bursts.filter(burst=>
            //TODO:Change boolean conditions
            [
               !burst.ns!.is_detected,
               !burst.lm!.is_detected,
               !(burst.lm!.is_detected||burst.ns!.is_detected)
            ][this.totalChartMode]
        ).map(burst=>{
            return {
                'x':burst.peak_time,
                'y':burst.peak_rate
            }
        })};
        let tempptdata = this.totalData.ptlineData
        this.totalData.ptlineData = []
        for(let i = 0;i<tempptdata.length;i++){
          this.totalData.ptlineData.push(tempptdata[i]);
          // this.totalData.ptlineData.push({x:tempptdata[i].x+0.01,y:null})
        }
        this.totalData.chartSeries = [
          {
            name:'Peaks',
            data:this.totalData.ptlineData.map(obj=>[obj.x,obj.y]),
            type:'scatter'
          },
          {
            name:'Rates',
            data:this.totalData.lc_data.map(obj=>[obj.x,obj.y]).filter((pt,j,[])=>(j%5===0)),
            type:'scatter'
          }
        ] as ApexAxisChartSeries
        console.log(this.totalData)
      this.burstsDecoded = true;
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
  binSzMin:number = 20;
  binSzMax:number=  500;
  binSzValue:number = 100;
  varSzMin:number = 5;
  varSzMax:number=  50;
  varSzValue:number = 10;  
  ngOnInit(){
  }
}