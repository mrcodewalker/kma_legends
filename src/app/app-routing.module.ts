import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ScheduleComponent } from './components/schedule/schedule.component';
import { ScoresComponent } from './components/scores/scores.component';
import { ScholarshipComponent } from './components/scholarship/scholarship.component';
import { VirtualCalendarComponent } from './components/virtual-calendar/virtual-calendar.component';
import { LoginVirtualCalendarComponent } from './components/login-virtual-calendar/login-virtual-calendar.component';
import { AboutComponent } from './components/about/about.component';
import { BuyMeCoffeeComponent } from './components/buy-me-coffee/buy-me-coffee.component';
import { FeedbackComponent } from './components/feedback/feedback.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'scores', component: ScoresComponent },
  { path: 'scholarship', component: ScholarshipComponent },
  { path: 'virtual-calendar', component: VirtualCalendarComponent },
  { path: 'login-virtual-calendar', component: LoginVirtualCalendarComponent },
  { path: 'about', component: AboutComponent },
  { path: 'buy-me-coffee', component: BuyMeCoffeeComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 
