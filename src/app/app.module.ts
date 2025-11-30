import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventDialogComponent } from './components/schedule/event-dialog/event-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { SharedModule } from './components/shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ScoresComponent } from './components/scores/scores.component';
import { ScholarshipComponent } from './components/scholarship/scholarship.component';
import { VirtualCalendarComponent } from './components/virtual-calendar/virtual-calendar.component';
import { EncryptionService } from './services/encryption.service';
import { PublicKeyService } from './services/public-key.service';
import { EncryptionInterceptor } from './common/interceptors/encryption.interceptor';
import { LoginVirtualCalendarComponent } from './components/login-virtual-calendar/login-virtual-calendar.component';
import { CelebrationCanvasComponent } from './components/celebration-canvas/celebration-canvas.component';
import { GradeConversionDialogComponent } from './components/scores/grade-conversion-dialog/grade-conversion-dialog.component';
import { AboutComponent } from './components/about/about.component';
import { BuyMeCoffeeComponent } from './components/buy-me-coffee/buy-me-coffee.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { ToastComponent } from './components/toast/toast.component';
import { UnsavedChangesDialogComponent } from './components/scores/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { VirtualCPACalculatorDialogComponent } from './components/scores/virtual-cpa-calculator-dialog/virtual-cpa-calculator-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    ScheduleComponent,
    ScoresComponent,
    ScholarshipComponent,
    VirtualCalendarComponent,
    EventDialogComponent,
    LoginVirtualCalendarComponent,
    CelebrationCanvasComponent,
    GradeConversionDialogComponent,
    AboutComponent,
    BuyMeCoffeeComponent,
    FeedbackComponent,
    ToastComponent,
    UnsavedChangesDialogComponent,
    VirtualCPACalculatorDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FullCalendarModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    SharedModule,
    FormsModule,
    MatTooltipModule
  ],
  providers: [
    EncryptionService,
    PublicKeyService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EncryptionInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
