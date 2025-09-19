import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CameraService } from '../../core/services/camera.service';
import { CommonService } from '../../core/services/common.service';
import { HistoricaleventService } from '../../core/services/historicalevent.service';
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";
import { HeaderComponent } from "../../layout/header/header.component";
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';

interface Camera { cameraId: number; cameraName: string; }

interface RoiPoint { x: number; y: number; }

interface Roi {
  id?: number;
  cameraId: number;
  points: RoiPoint[];
  isNew?: boolean;
  isDeleted?: boolean;
}

@Component({
  selector: 'app-roi',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, NgSelectModule, FormsModule, CommonModule],
  templateUrl: './roi.component.html',
  styleUrls: ['./roi.component.scss']
})
export class RoiComponent {
  cameraArr: Camera[] = [];
  selectedCamera: Camera | null = null;

  snapshotUrl: string | null = null;
  cameraDisconnected = false;

  @ViewChild('snapshotImage', { static: false }) snapshotImage!: ElementRef<HTMLImageElement>;
  @ViewChild('roiCanvas', { static: false }) roiCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  rois: Roi[] = [];
  drawingPoints: RoiPoint[] = [];

  constructor(
    private cameraService: CameraService,
    private historicalEventService: HistoricaleventService,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getCameraDropdownList();
  }

  getCameraDropdownList() {
    this.cameraService.GetCameraDropdownList().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.cameraArr = res.data;
          if (this.cameraArr.length > 0) this.changeCameraDropdown(this.cameraArr[0]);
        } else this.cameraArr = [];
      },
      error: () => { this.cameraArr = []; }
    });
  }

  changeCameraDropdown(camera: Camera | null) {
    if (!camera) return;
    this.selectedCamera = camera;
    this.getSnapshot(camera.cameraName);
    this.loadRois(camera.cameraId);
  }

  getSnapshot(cameraName: string) {
    document.getElementById('overlayloader')?.classList.remove('d-none');
    this.snapshotUrl = null;
    this.cameraDisconnected = false;

    this.cameraService.getSnapshot(cameraName).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          document.getElementById('overlayloader')?.classList.add('d-none');
          this.snapshotUrl = reader.result as string;
          setTimeout(() => this.onImageLoad(), 0);
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        document.getElementById('overlayloader')?.classList.add('d-none');
        this.snapshotUrl = null;
        this.cameraDisconnected = true;
      }
    });
  }

  loadRois(cameraId: number) {
    this.cameraService.getRois(cameraId).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          // Parse points JSON from backend
          this.rois = (Array.isArray(res.data) ? res.data : [res.data])
            .map((r: any): Roi => ({
              id: r.id,
              cameraId: r.cameraId,
              points: JSON.parse(r.points)
            }));
        } else {
          this.rois = [];
        }
        setTimeout(() => this.drawAllRois(), 0);
      },
      error: () => { this.rois = []; setTimeout(() => this.drawAllRois(), 0); }
    });
  }

  @HostListener('window:resize') onResize() { this.onImageLoad(); }

  onImageLoad() {
    const image = this.snapshotImage?.nativeElement;
    const canvas = this.roiCanvas?.nativeElement;
    if (!image || !canvas) return;

    canvas.width = image.width;
    canvas.height = image.height;
    this.ctx = canvas.getContext('2d')!;
    this.drawAllRois();
  }

  onCanvasMouseDown(evt: MouseEvent) {
    if (!this.ctx) return;
    const canvas = this.roiCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = (evt.clientX - rect.left) / canvas.width * 100;
    const y = (evt.clientY - rect.top) / canvas.height * 100;

    this.drawingPoints.push({ x, y });

    this.drawAllRois();
    this.drawTempRoi();

    if (this.drawingPoints.length === 4) {
      this.addNewRoi(this.drawingPoints);
      this.drawingPoints = [];
      this.drawAllRois();
    }
  }

  addNewRoi(points: RoiPoint[]) {
    if (!this.selectedCamera) return;
    this.rois.push({
      cameraId: this.selectedCamera.cameraId,
      points: [...points],
      isNew: true
    });
  }

  drawAllRois() {
    if (!this.ctx) return;
    const canvas = this.roiCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const roi of this.rois) {
      if (roi.isDeleted) continue; // <-- skip deleted ROIs

      // Draw filled polygon
      this.ctx.beginPath();
      roi.points.forEach((p, i) => {
        const x = p.x / 100 * canvas.width;
        const y = p.y / 100 * canvas.height;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.closePath();
      this.ctx.fillStyle = 'rgba(0,255,204,0.2)';
      this.ctx.fill();

      // Outline
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([]);
      this.ctx.stroke();

      // Corner circles
      roi.points.forEach(p => {
        const x = p.x / 100 * canvas.width;
        const y = p.y / 100 * canvas.height;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
      });
    }
  }


  drawTempRoi() {
    if (!this.ctx || this.drawingPoints.length === 0) return;
    const canvas = this.roiCanvas.nativeElement;

    this.ctx.beginPath();
    this.drawingPoints.forEach((p, i) => {
      const x = p.x / 100 * canvas.width;
      const y = p.y / 100 * canvas.height;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);

      this.ctx.fillStyle = 'red';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.stroke();
  }

  removeRoi(roi: Roi) {
    if (roi.isNew) {
      this.rois = this.rois.filter(r => r !== roi);
    } else {
      roi.isDeleted = true;
    }
    this.drawAllRois();
  }


  saveChanges() {
    if (!this.selectedCamera) return;
    const camId = this.selectedCamera.cameraId;

    const newRois = this.rois.filter(r => r.isNew && !r.isDeleted);
    const updatedRois = this.rois.filter(r => !r.isNew && !r.isDeleted && r.id !== undefined);
    const deletedRois = this.rois.filter(r => r.isDeleted && r.id !== undefined);

    const create$ = newRois.length
      ? this.cameraService.createRoi(
        newRois.map(r => ({ cameraId: r.cameraId, points: JSON.stringify(r.points) }))
      )
      : null;

    const update$ = updatedRois.length
      ? this.cameraService.updateRoi(
        updatedRois.map(r => ({ id: r.id!, cameraId: r.cameraId, points: JSON.stringify(r.points) }))
      )
      : null;

    const deletedRoiIds = deletedRois
      .map(r => r.id!)
      .filter(id => id !== undefined);

    const delete$ = deletedRoiIds.length
      ? this.cameraService.deleteRoi(deletedRoiIds)
      : null;

    const requests: any[] = [];
    if (create$) requests.push(create$);
    if (update$) requests.push(update$);
    if (delete$) requests.push(delete$);

    if (!requests.length) return;

    forkJoin(requests).subscribe({
      next: () => {
        this.drawingPoints = [];
        this.loadRois(camId);
      },
      error: err => console.error('Error saving ROIs:', err)
    });
  }

  cancelChanges() {
    if (!this.selectedCamera) return;
    this.drawingPoints = [];
    this.loadRois(this.selectedCamera.cameraId);
  }

  getRoiTopRight(roi: Roi) {
    if (!roi.points || roi.points.length === 0) return { x: 0, y: 0 };
    const lastPoint = roi.points[roi.points.length - 1];
    return { x: lastPoint.x, y: lastPoint.y };
  }

  getTopRightVertex(roi: Roi) {
    if (!roi.points || roi.points.length === 0) return { x: 0, y: 0 };
    let maxX = roi.points[0].x;
    let topY = roi.points[0].y;

    roi.points.forEach(p => {
      if (p.x > maxX || (p.x === maxX && p.y < topY)) {
        maxX = p.x;
        topY = p.y;
      }
    });

    return { x: maxX, y: topY };
  }
}
