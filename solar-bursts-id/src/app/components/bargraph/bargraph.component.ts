import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import { ChartOptions } from 'src/app/app.component';

@Component({
  selector: 'app-bargraph',
  templateUrl: './bargraph.component.html',
  styleUrls: ['./bargraph.component.css']
})
export class BargraphComponent implements OnInit {

  @ViewChild("chart") chart!:ChartComponent;
  @Input('data') data!:number[]
  @Input('cats') cats!:string[]
  public chartOptions!:Partial<ChartOptions>;
  
  constructor() { }

  ngOnInit(): void {
    this.chartOptions = {
      series:[
        {
          name:"My-series",
          data:this.data
        }
      ],
      chart:{
        height:350,
        type:"bar"
      },
      title:{
        text:"MyFAC"
      },
      xaxis:{
        categories:this.cats
      }
    }
  }

}
