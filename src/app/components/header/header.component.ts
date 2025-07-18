// header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface Notification {
  id: number;
  message: string;
  date: string;
  isRead: boolean;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  isNotificationOpen = false;
  private allNotifications: Notification[] = [
    {
      id: 1,
      message: 'Chào mừng bạn đến với KMA Legend! Khám phá ngay các tính năng hữu ích.',
      date: this.getRandomPastDate(0),
      isRead: false
    },
    {
      id: 2,
      message: 'Điểm thi học kỳ mới đã được cập nhật. Kiểm tra ngay!',
      date: this.getRandomPastDate(1),
      isRead: false
    },
    {
      id: 3,
      message: 'Lịch học tuần này đã được cập nhật. Xem ngay để không bỏ lỡ bất kỳ tiết học nào!',
      date: this.getRandomPastDate(2),
      isRead: false
    },
    {
      id: 4,
      message: 'Bạn có biết? KMA Legend có tính năng tính CPA tự động. Thử ngay!',
      date: this.getRandomPastDate(3),
      isRead: false
    },
    {
      id: 5,
      message: 'Chương trình học bổng mới đã được cập nhật. Cơ hội không thể bỏ lỡ!',
      date: this.getRandomPastDate(4),
      isRead: false
    },
    {
      id: 6,
      message: 'Tính năng xếp lịch học ảo giúp bạn lên kế hoạch học tập hiệu quả hơn.',
      date: this.getRandomPastDate(5),
      isRead: false
    },
    {
      id: 7,
      message: 'Cập nhật mới: Giao diện người dùng được cải thiện để trải nghiệm tốt hơn.',
      date: this.getRandomPastDate(6),
      isRead: false
    },
    {
      id: 8,
      message: 'Đã thêm tính năng chuyển đổi điểm số giữa các thang điểm khác nhau.',
      date: this.getRandomPastDate(7),
      isRead: false
    },
    {
      id: 9,
      message: 'Khám phá tính năng "Buy me a coffee" để ủng hộ đội ngũ phát triển!',
      date: this.getRandomPastDate(8),
      isRead: false
    },
    {
      id: 10,
      message: 'Góp ý của bạn giúp chúng tôi phát triển KMA Legend tốt hơn mỗi ngày.',
      date: this.getRandomPastDate(9),
      isRead: false
    },
    {
      id: 11,
      message: 'Tính năng mới: Xuất lịch học sang Google Calendar để theo dõi dễ dàng hơn.',
      date: this.getRandomPastDate(10),
      isRead: false
    },
    {
      id: 12,
      message: 'Bạn đã biết về tính năng tự động tính toán học bổng dựa trên CPA chưa?',
      date: this.getRandomPastDate(11),
      isRead: false
    }
  ];

  notifications: Notification[] = [];

  constructor(private router: Router) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAllMenus();
    });
    this.selectRandomNotifications();
  }

  private getRandomPastDate(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysOffset);
    return date.toISOString();
  }

  private selectRandomNotifications(): void {
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...this.allNotifications];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Take first 3 notifications and sort by date (newest first)
    this.notifications = shuffled.slice(0, 3)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.handleEscKey.bind(this));
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    document.removeEventListener('keydown', this.handleEscKey.bind(this));
  }

  private handleEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }

  private closeAllMenus(): void {
    this.isMobileMenuOpen = false;
    this.isUserMenuOpen = false;
    this.isNotificationOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isNotificationOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleNotifications(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) {
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(notification => !notification.isRead).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }
}
