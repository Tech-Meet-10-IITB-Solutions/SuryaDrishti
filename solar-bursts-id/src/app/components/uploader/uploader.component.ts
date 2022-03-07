import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  @ViewChild('files') filesBox!:ElementRef
  files:any[] = []
  updateFile(ev:any){
    for(let file of ev.target.files){
      if(!this.files.includes(file)){
        this.files.push(file)
      }
    }
  }
  submit(){
    this.dataService.sendFiles(this.files).subscribe(v=>{
      console.log(v)
    })
  }
  constructor(private dataService:DataService) { }

  ngOnInit(): void {
  }

}
