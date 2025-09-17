import { Component, AfterViewInit, Renderer2, ElementRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CdkNoDataRow } from "@angular/cdk/table";
import { IconsComponent } from '../../shared/components/icons/icons.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, CdkNoDataRow, IconsComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router, private authService: AuthService) {
    this.router.events.subscribe(() => {
      const url = this.router.url;
    });
  }

  ngOnInit() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
  }
  handleResize(): void {
    const slidingDiv = document.getElementById('pageBody');
    if (!slidingDiv) return;

    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 767) {
      slidingDiv.classList.remove('fullscreen');
      slidingDiv.classList.remove('mobilescreen');
    } else {
      slidingDiv.classList.remove('mobilescreen');
    }
  }
  toggleSlide(): void {
    const slidingDiv = document.getElementById('pageBody');
    if (!slidingDiv) {
      console.warn('#pageBody not found');
      return;
    }

    const viewportWidth = window.innerWidth;

    if (viewportWidth > 767) {
      slidingDiv.classList.toggle('fullscreen');
      if (slidingDiv.classList.contains('fullscreen')) {
        const openSubmenus = document.querySelectorAll('.accordion-collapse.show');
        openSubmenus.forEach((submenu) => submenu.classList.remove('show'));
      }
    } else {
      slidingDiv.classList.toggle('mobilescreen');
    }
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const pageBody = document.getElementById('pageBody');
    const target = event.target as HTMLElement;

    if (pageBody && pageBody.classList.contains('mobilescreen')) {
      if (!pageBody.contains(target)) {
        pageBody.classList.remove('mobilescreen');
      }
    }
  }
  ngAfterViewInit(): void {
    this.checkAndApplyFullscreen();
    this.setupSidebarHover();
    this.closeAllSubmenus();

    const menuItems = this.el.nativeElement.querySelectorAll('.menu-dropdown');
    menuItems.forEach((menu: HTMLElement) => {
      const submenu = menu.nextElementSibling as HTMLElement;

      if (!submenu) return;

      let hoverTimeout: any;
      let isHoveringMenu = false;
      let isHoveringSubmenu = false;

      const showSubmenu = () => {
        if (window.innerWidth > 768) {
          const rect = menu.getBoundingClientRect();
          submenu.style.display = 'block';
          submenu.style.top = `${rect.top + 13}px`;
          //submenu.style.left = `${rect.right}px`;
          submenu.style.zIndex = '9999';
        }
      };
      const hideSubmenu = () => {
        submenu.style.display = 'none';
      };
      this.renderer.listen(menu, 'mouseenter', () => {
        if (window.innerWidth > 768) {
          isHoveringMenu = true;
          clearTimeout(hoverTimeout);
          showSubmenu();
        }
      });

      this.renderer.listen(menu, 'mouseleave', () => {
        if (window.innerWidth > 768) {
          isHoveringMenu = false;
          hoverTimeout = setTimeout(() => {
            if (!isHoveringSubmenu) {
              hideSubmenu();
            }
          }, 200);
        }
      });
      if (window.innerWidth > 768) {
        this.renderer.listen(submenu, 'mouseenter', () => {
          isHoveringSubmenu = true;
          clearTimeout(hoverTimeout);
        });

        this.renderer.listen(submenu, 'mouseleave', () => {
          isHoveringSubmenu = false;
          hoverTimeout = setTimeout(() => {
            if (!isHoveringMenu) {
              hideSubmenu();
            }
          }, 200);
        });
      }
    });
  }
  closeAllSubmenus(): void {
    const openSubmenus = document.querySelectorAll('.accordion-collapse.show');
    openSubmenus.forEach((submenu) => {
      submenu.classList.remove('show');
    });
  }
  @HostListener('window:resize')
  onResize() {
    this.checkAndApplyFullscreen();
  }
  @HostListener('window:load')
  onLoad() {
    this.checkAndApplyFullscreen();
  }
  checkAndApplyFullscreen(): void {
    const slidingDiv = document.getElementById('pageBody');
    const viewportWidth = window.innerWidth;
    // if (slidingDiv) {
    //   if (viewportWidth >= 768 && viewportWidth <= 3840) {
    //     slidingDiv.classList.add('fullscreen');
    //   } else {
    //     slidingDiv.classList.remove('fullscreen');
    //   }
    // }
    if (slidingDiv) {
      if (viewportWidth >= 768) {
        setTimeout(() => {
          slidingDiv.classList.add('fullscreen');
        }, 10);
      } else {
        slidingDiv.classList.remove('fullscreen');
      }
    }
  }
  setupSidebarHover(): void {
    const sidebarItems = this.el.nativeElement.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item: HTMLElement) => {
      this.renderer.listen(item, 'mouseenter', () => {
        const pageBody = document.getElementById('pageBody');
        const submenu = item.querySelector('.accordion-collapse');
        if (pageBody?.classList.contains('fullscreen') && submenu) {
          submenu.classList.add('show');
        }
      });
      this.renderer.listen(item, 'mouseleave', () => {
        const pageBody = document.getElementById('pageBody');
        const submenu = item.querySelector('.accordion-collapse');
        if (pageBody?.classList.contains('fullscreen') && submenu) {
          submenu.classList.remove('show');
        }
      });
    });
  }

  logout() {
    this.authService.deleteToken();
    this.router.navigate(['/Zone/login'])
  }
}
