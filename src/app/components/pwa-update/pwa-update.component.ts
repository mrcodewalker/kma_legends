import { Component, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-pwa-update',
    template: `
    <div *ngIf="updateAvailable"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-blue-700 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
      <i class="fas fa-sync-alt"></i>
      <span class="text-sm font-medium">Có phiên bản mới!</span>
      <button (click)="doUpdate()"
        class="bg-white text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">
        Cập nhật
      </button>
      <button (click)="updateAvailable = false" class="text-blue-200 hover:text-white ml-1">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
})
export class PwaUpdateComponent implements OnInit {
    updateAvailable = false;

    constructor(private swUpdate: SwUpdate) { }

    ngOnInit() {
        if (!this.swUpdate.isEnabled) return;

        this.swUpdate.versionUpdates.pipe(
            filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        ).subscribe(() => {
            this.updateAvailable = true;
        });
    }

    doUpdate() {
        window.location.reload();
    }
}
