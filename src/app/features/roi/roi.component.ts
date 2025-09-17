import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CameraService } from '../../core/services/camera.service';
import { CommonService } from '../../core/services/common.service';
import { HistoricaleventService } from '../../core/services/historicalevent.service';
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";
import { HeaderComponent } from "../../layout/header/header.component";
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roi',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, NgSelectModule, FormsModule, CommonModule],
  templateUrl: './roi.component.html',
  styleUrl: './roi.component.scss'
})

export class RoiComponent {
  private savedRoi: {
    roiStartPercentageWidth: number;
    roiEndPercentageWidth: number;
    roiStartPercentageHeight: number;
    roiEndPercentageHeight: number;
  } = {
      roiStartPercentageWidth: 0,
      roiEndPercentageWidth: 0,
      roiStartPercentageHeight: 0,
      roiEndPercentageHeight: 0
    };
  selectedCamera: any;
  selectedCameraName: any;
  selectedCameraId: any;
  @ViewChild('roiCanvas', { static: false }) roiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('snapshotImage', { static: false }) snapshotImage!: ElementRef<HTMLImageElement>;
  roiStartPercentageWidth = 0;
  roiEndPercentageWidth = 0;
  roiStartPercentageHeight = 0;
  roiEndPercentageHeight = 0;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  constructor(private cameraService: CameraService, private historicalEventService: HistoricaleventService, public commonService: CommonService) {

  }

  ngOnInit(){
    this.GetCameraDropdownList();
  }
  cameraArr: any[] = []
  GetCameraDropdownList() {
    this.cameraService.GetCameraDropdownList().subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          this.cameraArr = res.data;
          if (this.cameraArr.length > 0) {
            const firstCamera = this.cameraArr[0];
            this.selectedCamera = firstCamera.cameraName;
            this.changeCameraDropdown(firstCamera.cameraName); // Load snapshot and set other data
          }
        }
        else {
          this.cameraArr = [];
        }
      },
      error: (error) => {

      }
    })
  }


  changeCameraDropdown(selectedName: string) {
    const selectedCamera = this.cameraArr.find(cam => cam.cameraName === selectedName);
    if (selectedCamera) {
      this.selectedCameraName = selectedCamera.cameraName;
      this.selectedCameraId = selectedCamera.cameraId;
      this.getCameraById(this.selectedCameraId);
    } else {
      this.selectedCameraName = null;
    }
    this.clearCanvas();
    this.getSnapshot(selectedName);

    this.roiStartPercentageWidth = 0;
    this.roiEndPercentageWidth = 0;
    this.roiStartPercentageHeight = 0;
    this.roiEndPercentageHeight = 0;
  }

  clearCanvas() {
    if (this.roiCanvas && this.ctx) {
      const canvas = this.roiCanvas.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  snapshotUrl: string | null = null;
  cameraDisconnected = false;
  getSnapshot(cameraName: string) {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.cameraDisconnected = false;
    this.snapshotUrl = null;

    this.cameraService.getSnapshot(cameraName).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          document.getElementById('overlayloader')?.classList.add('d-none');
          this.snapshotUrl = reader.result as string;
          this.cameraDisconnected = false;
        };
        reader.readAsDataURL(blob);
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        this.snapshotUrl = null;
        this.cameraDisconnected = true;
      }
    });
  }

  getCameraById(cameraId: any) {
    this.cameraService.getCameraByCameraId(cameraId).subscribe({
      next: (res) => {
        if (res.statusCode == 200) {
          const data = res.data;

          this.roiStartPercentageWidth = data.roistartPercentageWidth ?? 0;
          this.roiEndPercentageWidth = data.roiendPercentageWidth ?? 0;
          this.roiStartPercentageHeight = data.roistartPercentageHeight ?? 0;
          this.roiEndPercentageHeight = data.roiendPercentageHeight ?? 0;

          // ✅ Save current state to backup
          this.savedRoi = {
            roiStartPercentageWidth: this.roiStartPercentageWidth,
            roiEndPercentageWidth: this.roiEndPercentageWidth,
            roiStartPercentageHeight: this.roiStartPercentageHeight,
            roiEndPercentageHeight: this.roiEndPercentageHeight
          };

          // After snapshot loads, ROI will be drawn inside onImageLoad
        }
      },
      error: (error) => { }
    });
  }

  ngAfterViewInit(): void {
    this.onImageLoad();
  }
  @HostListener('window:resize')
  onResize() {
    this.onImageLoad();
  }

  private naturalWidth = 0;
  private naturalHeight = 0;
  onImageLoad() {
    const image = this.snapshotImage?.nativeElement;
    this.naturalWidth = image.naturalWidth;
    this.naturalHeight = image.naturalHeight;
    const canvas = this.roiCanvas?.nativeElement;
    const wrapper = image?.parentElement;
    if (!wrapper) {
      return;
    }
    const wrapperRect = wrapper.getBoundingClientRect();
    const imgNaturalWidth = image.naturalWidth;
    const imgNaturalHeight = image.naturalHeight;
    const imgAspectRatio = imgNaturalWidth / imgNaturalHeight;
    const wrapperAspectRatio = wrapperRect.width / wrapperRect.height;
    let renderedImageWidth: number;
    let renderedImageHeight: number;
    let offsetLeft = 0;
    let offsetTop = 0;
    if (imgAspectRatio > wrapperAspectRatio) {
      renderedImageWidth = wrapperRect.width;
      renderedImageHeight = wrapperRect.width / imgAspectRatio;
      offsetTop = (wrapperRect.height - renderedImageHeight) / 2;
    } else {
      renderedImageHeight = wrapperRect.height;
      renderedImageWidth = wrapperRect.height * imgAspectRatio;
      offsetLeft = (wrapperRect.width - renderedImageWidth) / 2;
    }
    canvas.width = renderedImageWidth;
    canvas.height = renderedImageHeight;
    canvas.style.width = `${renderedImageWidth}px`;
    canvas.style.height = `${renderedImageHeight}px`;
    canvas.style.left = `${offsetLeft}px`;
    canvas.style.top = `${offsetTop}px`;

    this.ctx = canvas.getContext('2d')!;
    this.attachMouseListeners(canvas);
    setTimeout(() => {
      this.drawRoiBox();
    }, 0);
  }

  drawRoiBox() {
    if (!this.ctx) return;

    const canvas = this.roiCanvas.nativeElement;
    const width = canvas.width;   // rendered canvas width
    const height = canvas.height; // rendered canvas height

    // Percentages → scale them to current canvas
    const startX = (this.roiStartPercentageWidth / 100) * width;
    const startY = (this.roiStartPercentageHeight / 100) * height;
    const endX = (this.roiEndPercentageWidth / 100) * width;
    const endY = (this.roiEndPercentageHeight / 100) * height;

    const rectWidth = endX - startX;
    const rectHeight = endY - startY;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(startX, startY, rectWidth, rectHeight);
  }

  attachMouseListeners(canvas: HTMLCanvasElement) {
    canvas.onmousedown = (e: MouseEvent) => {
      this.drawing = true;
      const rect = canvas.getBoundingClientRect();
      this.startX = e.clientX - rect.left;
      this.startY = e.clientY - rect.top;
    };

    canvas.onmousemove = (e: MouseEvent) => {
      if (!this.drawing) return;
      const rect = canvas.getBoundingClientRect();
      this.currentX = e.clientX - rect.left;
      this.currentY = e.clientY - rect.top;
      this.drawRect();
    };

    canvas.onmouseup = () => {
      this.drawing = false;
      this.savePercentageValues();
    };
  }

  drawRect() {
    const ctx = this.ctx;
    const width = this.currentX - this.startX;
    const height = this.currentY - this.startY;

    ctx.clearRect(0, 0, this.roiCanvas.nativeElement.width, this.roiCanvas.nativeElement.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.startX, this.startY, width, height);
  }

  editedFields: { [key: string]: any } = {};
  savePercentageValues() {
    const canvas = this.roiCanvas.nativeElement;

    const x1 = Math.min(this.startX, this.currentX);
    const y1 = Math.min(this.startY, this.currentY);
    const x2 = Math.max(this.startX, this.currentX);
    const y2 = Math.max(this.startY, this.currentY);

    // Scaling factors between canvas (UI) and actual frame (natural size)
    const scaleX = this.naturalWidth / canvas.width;
    const scaleY = this.naturalHeight / canvas.height;

    // Convert canvas coordinates → natural image coordinates
    const natX1 = x1 * scaleX;
    const natY1 = y1 * scaleY;
    const natX2 = x2 * scaleX;
    const natY2 = y2 * scaleY;

    // Save as percentages of natural frame
    this.roiStartPercentageWidth = Math.round((natX1 / this.naturalWidth) * 100);
    this.roiEndPercentageWidth = Math.round((natX2 / this.naturalWidth) * 100);
    this.roiStartPercentageHeight = Math.round((natY1 / this.naturalHeight) * 100);
    this.roiEndPercentageHeight = Math.round((natY2 / this.naturalHeight) * 100);

    this.editedFields = {
      roiStartPercentageWidth: this.roiStartPercentageWidth,
      roiEndPercentageWidth: this.roiEndPercentageWidth,
      roiStartPercentageHeight: this.roiStartPercentageHeight,
      roiEndPercentageHeight: this.roiEndPercentageHeight,
    };
  }

  updateCamera() {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.cameraService.updateCamera(this.selectedCameraId, this.editedFields).subscribe({
      next: (res) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        if (res.statusCode === 200) {
        }
      },
      error: (error) => {
        document.getElementById('overlayloader')?.classList.add('d-none');
      }
    });
  }

  cancelRoidraw() {
    // Check if any ROI was saved (not default zeros)
    const hasSavedRoi =
      this.savedRoi.roiStartPercentageWidth !== 0 ||
      this.savedRoi.roiEndPercentageWidth !== 0 ||
      this.savedRoi.roiStartPercentageHeight !== 0 ||
      this.savedRoi.roiEndPercentageHeight !== 0;

    if (hasSavedRoi) {
      // 🔁 Re-fetch ROI from API to get latest values
      this.getCameraById(this.selectedCameraId);

      // ⏱ Give time for snapshot to load and canvas to be sized
      setTimeout(() => {
        this.drawRoiBox();
      }, 100);
    } else {
      // 🚫 No saved ROI, clear canvas
      const canvas = this.roiCanvas.nativeElement;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // ❌ Clear unsaved changes (optional)
    this.editedFields = {};
  }
}
