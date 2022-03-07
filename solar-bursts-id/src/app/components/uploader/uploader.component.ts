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
  finalData!:any;
  fileNames:string[] = []
  progress:number = 0;
  submitted:boolean = false;
  propagateClick(){
    this.filesBox.nativeElement.click()
  }
  updateProgress(){
    if(this.progress>=100){
      //call redirect function/ngIf change
      return;
    }
    this.dataService.getOutput().subscribe((data:any)=>{
      if(data['taskDone']>=1){
        this.progress = 100;
        this.finalData = data;
      }
      else{
        this.progress = data['taskDone']*100
        setTimeout(()=>{
          this.updateProgress();
        },1000)            
      }
    })
  }
  updateFile(ev:any){
    for(let file of ev.target.files){
      if(!this.files.includes(file)){
        this.files.push(file)
        this.fileNames.push(file.name);
      }
    }
  }
  submit(){
    this.dataService.sendFiles(this.files).subscribe(v=>{
      console.log(v)
      this.submitted = true;
      setTimeout(()=>{
        this.updateProgress()
      },1000);
    })
  }
  constructor(private dataService:DataService) { }

  ngOnInit(): void {
  }

}
