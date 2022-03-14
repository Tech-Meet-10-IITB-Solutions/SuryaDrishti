import { Component, ElementRef, OnInit, Output, ViewChild,EventEmitter, HostListener } from '@angular/core';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  @ViewChild('files') filesBox!:ElementRef
  @Output('onDataReceived') onDataReceived:EventEmitter<string> = new EventEmitter();
  files:any[] = []
  finalData!:any;
  dragAreaClass!:string;
  error!:string;
  fileNames:string[] = []
  progress:number = 0;
  submitted:boolean = false;
  shareData!:Function;
  onFileChange(event:any){
    let files:FileList = event.target.files;
    this.saveFiles(files);
  }
  @HostListener("dragover", ["$event"]) onDragOver(event: any) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }
  @HostListener("dragenter", ["$event"]) onDragEnter(event: any) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }
  @HostListener("dragend", ["$event"]) onDragEnd(event: any) {
    this.dragAreaClass = "droparea";
    event.preventDefault();
  }
  @HostListener("dragleave", ["$event"]) onDragLeave(event: any) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }
  @HostListener("drop", ["$event"]) onDrop(event: any) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      let files: FileList = event.dataTransfer.files;
      this.saveFiles(files);
    }
  }

  saveFiles(files:FileList){
    if(files.length>1) {this.error = "Only one file at a time allowed."}
    else{
      this.error = ""
      this.files = [files[0]];
      this.fileNames = [files[0].name]
    }
  }
  
  
  
  
  
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
        console.log(data);
        console.log('emitted')
        this.onDataReceived.emit('OK');
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
    this.dragAreaClass = 'dragarea';
  }

}
