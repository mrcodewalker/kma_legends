import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let toast of toasts"
        [class]="getToastClasses(toast.type)"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
        [@slideInOut]
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <i [class]="getIconClasses(toast.type)" class="h-5 w-5"></i>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 break-words whitespace-normal">{{ toast.message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                (click)="removeToast(toast.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Đóng</span>
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getToastClasses(type: string): string {
    const baseClasses = 'border-l-4';
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-400 bg-green-50`;
      case 'error':
        return `${baseClasses} border-red-400 bg-red-50`;
      case 'warning':
        return `${baseClasses} border-yellow-400 bg-yellow-50`;
      case 'info':
      default:
        return `${baseClasses} border-blue-400 bg-blue-50`;
    }
  }

  getIconClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle text-green-400';
      case 'error':
        return 'fas fa-exclamation-circle text-red-400';
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-400';
      case 'info':
      default:
        return 'fas fa-info-circle text-blue-400';
    }
  }
}
