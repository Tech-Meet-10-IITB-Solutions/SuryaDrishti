import { Component, OnInit, Input} from '@angular/core';
import { DataRow } from 'src/app/interfaces';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input('data') TableData!:DataRow[]
  // TableData:DataRow[] = [];
  displayedColumns:string[] = [
    'name',
    'age'
  ]
  constructor() { }
  ngOnInit(): void {
    
  }

}
