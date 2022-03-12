import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Components
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { ReportComponent } from './report/report.component';

// Material Modules
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

// Addons
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    ReportComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    NgApexchartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
