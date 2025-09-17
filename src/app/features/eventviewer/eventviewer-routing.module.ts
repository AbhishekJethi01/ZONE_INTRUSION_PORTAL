import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventviewerComponent } from './eventviewer.component';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [{
  path: "", component: EventviewerComponent, canActivate: [authGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventviewerRoutingModule { }
