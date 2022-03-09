import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatChipsModule} from '@angular/material/chips';
import {NgApexchartsModule} from 'ng-apexcharts';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms'
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { TableComponent } from './components/table/table.component';
import { BargraphComponent } from './components/bargraph/bargraph.component';
import { LinechartComponent } from './components/linechart/linechart.component';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { UploaderComponent } from './components/uploader/uploader.component';
import { HttpClientModule } from '@angular/common/http';
import { BurstsgridComponent } from './components/burstsgrid/burstsgrid.component';
@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    LinechartComponent,
    BargraphComponent,
    UploaderComponent,
    BurstsgridComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatProgressBarModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatButtonToggleModule,
    NgApexchartsModule,
    MatFormFieldModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
