import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";
import { HeaderComponent } from "../../layout/header/header.component";
import { TableComponent } from '../../shared/components/table/table.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [NgClass, SidebarComponent, HeaderComponent, TableComponent, NgSelectModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent {
  activeTabId: string = 'manufacturer';
  activateTab(activeTab: string) {
    this.activeTabId = activeTab;
  }
  
}
