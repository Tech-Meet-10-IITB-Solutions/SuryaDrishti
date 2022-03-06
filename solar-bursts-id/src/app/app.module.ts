import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {NgApexchartsModule} from 'ng-apexcharts';

import { TableComponent } from './components/table/table.component';
import { BargraphComponent } from './components/bargraph/bargraph.component';
import { LinechartComponent } from './components/linechart/linechart.component';
@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    LinechartComponent,
    BargraphComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    NgApexchartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
