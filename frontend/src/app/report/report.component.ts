import { Component, ElementRef, HostListener, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import beautify from 'json-beautify';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
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
// import { LinescatterComponent } from '../components/linescatter/linescatter.component';
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
  // fit_data:point[],
  // true_data:point[],
  plot_base64:string,
  is_detected:boolean,
  fit_params:statModelParams,
  duration:number
}
export interface burstRow{
  bg_rate:number,
  peak_time:number,
  peak_temp:number,
  peak_flux:number,
  peak_em:number,
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
  totalChartMode:number = 3;
  burstsDecoded:boolean = false;
  public chartOptions:Partial<ChartOptions>[] = []
  public tableChartOptions:Partial<ChartOptions>[] = []
  metaData:any[] = [];
  tableData:any[] = [];
  binSzMin:number = 50;
  binSzMax:number=  500;
  binSzValue:number = 200;
  varSzMin:number = 5;
  varSzMax:number=  50;
  varSzValue:number = 10;
  printing: boolean = false;
  @HostListener('window:resize', ['$event'])
  OnResize(event:any){
      this.innerWidth = window.innerWidth;
  }
  formatSeconds(totalSeconds:number){
    let days = Math.floor(totalSeconds/(3600*24))
    totalSeconds %=(24*3600)
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.round(totalSeconds % 60);
    return `${days}:${hours}:${minutes}:${seconds}`
  }
  mapClass:Function = (burst:number[][])=>{
    if(this.rejectedBursts.includes(this.data.indexOf(burst))){
      return 'disabled';
    }
    return ''
  }
  totalData!: totalData;
  saveData(){
    let btns = document.querySelectorAll('button')
    this.printing = true;
    // let tb = document.querySelectorAll('mat-toolbar')
    // let sel = document.querySelectorAll('mat-select')
    for(let i=0;i<btns.length;i++){
      btns.item(i).style.display = 'none';
    }

    
    setTimeout(()=>{
      window.print()
      for(let i=0;i<btns.length;i++){
        btns.item(i).style.display = '';
      }
      this.printing = false
  
    },1000)
    const doc = new jsPDF()
    autoTable(doc, { html: '#mainTable' })
    // doc.save(this.totalData.file_name.split('.').slice(0,-1).join('.')+'_BinSz_'+this.binSzValue.toString()+'.pdf')
    let data = this.bursts
    let textdata = beautify(this.bursts, null, 2, 5);
    textdata = textdata.split('},{').join('},\n{')
    // let blob = new Blob([textdata]);
    // FileSaver.saveAs(blob, this.totalData.file_name.split('.').slice(0,-1).join('.')+'_BinSz_'+this.binSzValue.toString()+".txt")

  }
  trainModel(){
    let ptbursts = this.sortBurstArray(this.sortables[1].value,this.sortables[1].value)
    let boolArray = ptbursts.map((v,j,[])=>{
      if(this.rejectedBursts.includes(this.bursts.indexOf(v))){return 0}
      else{return 1}
    })
    console.log(boolArray)
    this.server.trainModel(boolArray).subscribe(v=>{
      console.log(v)
    })
  }
  formatLabel(value: number) {
      return Math.round(value);
  }
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
  sortableIndex:number = 0
  scatterData!:any[]
  lineData!:any[]
  bursts:Partial<burstRow>[] = []
  mapChartOptions!:Function
  sortables = [
    {viewValue:'Peak Value',value:'peak_rate'},
    {viewValue:'Peak Time',value:'peak_time'},
    {viewValue:'Peak Flux',value:'peak_flux'},
    {viewValue:'Peak Temp',value:'peak_temp'},
    {viewValue:'Peak EM', value:'peak_em'},
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
    if(!this.allowUnload&&(!(localStorage.getItem('allowUnload')! === 'true'))){
      window.opener.location.reload();
    }

}
stringMap(burst1:Partial<burstRow>):Map<string,number>{
  let map = new Map<string,number>();
  map.set('peak_time',burst1.peak_time!)
  map.set('peak_rate',burst1.peak_rate!)
  map.set('peak_temp',burst1.peak_temp!)
  map.set('peak_flux',burst1.peak_flux!)
  map.set('peak_em',burst1.peak_em!)
  map.set('ml_conf',burst1.ml_conf!)
  map.set('class',-burst1.class?.charCodeAt(0)!)
  map.set('chisq-ns',burst1.ns?burst1.ns?.fit_params.ChiSq:Infinity)
  map.set('chisq-lm',burst1.lm?burst1.lm.fit_params.ChiSq:Infinity)
  return map;
}
sortBurstArray(key:string, tbk:string){
  return this.bursts.sort((burst1:Partial<burstRow>, burst2:Partial<burstRow>)=>{
    let map1 = this.stringMap(burst1)
    let map2 = this.stringMap(burst2)
    let compval = (map1.get(key)! - map2.get(key)!)
    if(compval===0){
      compval = (map1.get(tbk)! - map2.get(tbk)!)
    }
    return compval;
  })
}
sortBursts(value:string){

  let RBursts = this.filterRejected(this.bursts)
  let key = value
  let tieBreakerKey = 'peak_time';
  this.rejectedBursts = []
  this.bursts = this.sortBurstArray(key,tieBreakerKey)
  this.rejectedBursts = RBursts.map(v=>this.bursts.indexOf(v));
}
getDate(moment:number){
  console.log(moment)
  let date = new Date();
  date.setTime(moment*1000)
  return date
}
totalChartReady:boolean = false;
updateTotalData(){
  this.totalChartReady = false;
  this.totalData = {
    ...this.totalData,
     start:Math.round(this.totalData.start*100)/100,
     ptlineData:this.bursts.filter(burst=>[
       burst.ns?.is_detected,
       burst.lm?.is_detected,
       burst.ns?.is_detected&&burst.lm?.is_detected,
       burst.ns?.is_detected||burst.lm?.is_detected,
     ][this.totalChartMode]).map(burst=>{return{x:burst.peak_time,y:burst.peak_rate} as point;})
   };
   this.totalData.chartSeries = [
    {
      name:'Peaks',
      data:this.totalData.ptlineData.map(obj=>[obj.x,obj.y]),
      type:'scatter'
    },
    {
      name:'All points',
      data:this.totalData.lc_data.map(obj=>[obj.x,obj.y]).filter((pt,j,[])=>(j%5===0)),
      type:'line'
    }
    ] as ApexAxisChartSeries
    // console.log(this.totalData)
    setTimeout(()=>{
      this.totalChartReady = true;
    },1000)
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
         start:Math.round(data.total.start*100)/100,
          ptlineData:this.bursts.filter(burst=>
            [
               burst.ns!.is_detected,
               burst.lm!.is_detected,
               (burst.lm!.is_detected||burst.ns!.is_detected)
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
            name:'All points',
            data:this.totalData.lc_data.map(obj=>[obj.x,obj.y]).filter((pt,j,[])=>(j%5===0)),
            type:'line'
          }
        ] as ApexAxisChartSeries
        console.log(this.totalData)
      this.burstsDecoded = true;
      this.totalChartReady = true;
    })
    this.innerWidth = window.innerWidth;
    // this.displayedColumns = ['max','maxAt','avg']
  }
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.totalChartReady = false
    this.innerWidth = window.innerWidth;
    setTimeout(()=>this.totalChartReady=true,1000)
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