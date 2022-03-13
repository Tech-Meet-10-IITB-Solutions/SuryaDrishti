import { Component, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UploadComponent } from './upload/upload.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  constructor(private route:ActivatedRoute){}
  onBurstsReady(elementRef:any){
    console.log('hi')
    elementRef.onBurstsReady.subscribe((ev:any)=>{
      console.log(ev);
    })
    window.location.href = "/report"
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    window.opener.location.reload();
}
}
