import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { burstRow } from 'src/app/report/report.component';

@Component({
  selector: 'app-burst-table',
  templateUrl: './burst-table.component.html',
  styleUrls: ['./burst-table.component.scss']
})
export class BurstTableComponent implements OnInit {
  @Input('bursts') bursts!:Partial<burstRow>[]
  @Input('areDeleted') areDeleted!:boolean;
  // @Output('removeBurst') removeBurst:EventEmitter<number> = new EventEmitter()
  // @Output('addBurst') addBurst:EventEmitter<number> = new EventEmitter()
  @Output('rejectedBurstsChange') rejectedBurstsChange = new EventEmitter<number[]>()
  @Input('burstListEditable') burstListEditable!:boolean;
  @Input('rejectedBursts') rejectedBursts!:number[]
  displayedColumnsMain:string[]= ['peak_time','meta','chartNS', 'dataNS','chartLM','dataLM'];
  // rejectedBursts:number[] = []
  filterAccepted(data:Partial<burstRow>[]){
    return data.filter((v,i,[])=>!this.rejectedBursts.includes(i));
  }
  filterRejected(data:Partial<burstRow>[]){
    // console.log('rejcheck')
    return data.filter((v,i,[])=>this.rejectedBursts.includes(i))
  }
  remove(i:number){
    this.rejectedBursts.push(i)
    // this.removeBurst.emit(i)
  }
  add(i:number){
    this.rejectedBursts.splice(this.rejectedBursts.indexOf(i),1)
    // this.addBurst.emit(i)
  }
  constructor() { }

  ngOnInit(): void {
  }

}
