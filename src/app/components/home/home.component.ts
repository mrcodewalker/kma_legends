import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  authorName = 'Mr.CodeWalker x Hải Code Dạo';
  currentSlide = 0;
  constructor(readonly router: Router) {}
  slides = [
    {
      image: 'assets/images/TV.jpg',
      title: 'Môi trường học tập hiện đại',
      description: 'Trang thiết bị hiện đại, phòng học thông minh'
    },
    {
      image: 'assets/images/2nd.jpg',
      title: 'Đội ngũ giảng viên xuất sắc',
      description: 'Giảng viên có trình độ cao, nhiều kinh nghiệm giảng dạy'
    },
    {
      image: 'assets/images/4rd.jpg',
      title: 'Cơ hội nghề nghiệp rộng mở',
      description: 'Kết nối doanh nghiệp, cơ hội việc làm sau tốt nghiệp'
    }
  ];

  features = [
    {
      title: 'Quản lý điểm số',
      description: 'Theo dõi và phân tích kết quả học tập một cách chi tiết',
      icon: 'fa-chart-line'
    },
    {
      title: 'Lịch học thông minh',
      description: 'Quản lý thời gian học tập hiệu quả với lịch học được tối ưu',
      icon: 'fa-calendar-alt'
    },
    {
      title: 'Học bổng dự kiến',
      description: 'Dự đoán và theo dõi cơ hội nhận học bổng dựa trên kết quả học tập',
      icon: 'fa-graduation-cap'
    },
    {
      title: 'Thông báo thông minh',
      description: 'Nhận thông báo kịp thời về lịch học, điểm số và học bổng',
      icon: 'fa-bell'
    }
  ];

  stats = [
    { value: '5000+', label: 'Sinh viên', icon: 'fa-users' },
    { value: '200+', label: 'Giảng viên', icon: 'fa-chalkboard-teacher' },
    { value: '50+', label: 'Phòng học', icon: 'fa-door-open' },
    { value: '95%', label: 'Tỷ lệ việc làm', icon: 'fa-briefcase' }
  ];

  departments = [
    {
      name: 'An toàn thông tin',
      description: 'Đào tạo chuyên gia bảo mật và an ninh mạng',
      icon: 'fa-shield-alt'
    },
    {
      name: 'Công nghệ thông tin',
      description: 'Phát triển ứng dụng và hệ thống phần mềm',
      icon: 'fa-laptop-code'
    },
    {
      name: 'Điện tử viễn thông',
      description: 'Nghiên cứu và phát triển hệ thống thông tin',
      icon: 'fa-broadcast-tower'
    },
    {
      name: 'An toàn mạng',
      description: 'Bảo vệ hệ thống mạng và cơ sở hạ tầng',
      icon: 'fa-network-wired'
    }
  ];

  news = [
    {
      title: 'Lễ tốt nghiệp khóa 2024',
      date: '2024-06-15',
      image: 'assets/images/cntt.jpg',
      description: 'Hơn 1000 sinh viên nhận bằng tốt nghiệp năm 2024'
    },
    {
      title: 'Hội thảo An toàn thông tin',
      date: '2024-05-20',
      image: 'assets/images/vcris.jpg',
      description: 'Chuyên gia hàng đầu chia sẻ xu hướng bảo mật mới',
      link: 'https://vcris.org'
    },
    {
      title: 'Ký kết hợp tác doanh nghiệp',
      date: '2024-04-10',
      image: 'assets/images/bsv.jpg',
      description: 'Mở rộng cơ hội việc làm cho sinh viên'
    }
  ];

  testimonials = [
    {
      name: 'Hà Phương Thảo',
      position: 'Security Engineer tại Google',
      avatar: 'assets/images/chase_badge_canine_patrol_paw_patrol_icon_263831.png',
      content: 'KMA đã trang bị cho tôi nền tảng vững chắc về an toàn thông tin, giúp tôi tự tin làm việc tại các tập đoàn công nghệ lớn.'
    },
    {
      name: 'Nguyễn Đặng Khải',
      position: 'Product Manager tại Microsoft',
      avatar: 'assets/images/everest_badge_canine_patrol_paw_patrol_icon_263832.png',
      content: 'Môi trường học tập năng động và chuyên nghiệp tại KMA đã giúp tôi phát triển không chỉ kỹ năng chuyên môn mà còn cả kỹ năng mềm.'
    },
    {
      name: 'Hồ Huỳnh Thanh Uyên',
      position: 'CTO tại VNG',
      avatar: 'assets/images/marshall_badge_canine_patrol_paw_patrol_icon_263862.png',
      content: 'Kiến thức và kinh nghiệm từ các giảng viên tại KMA là nền tảng quan trọng cho sự phát triển sự nghiệp của tôi.'
    }
  ];

  achievements = [
    {
      title: 'Top 5 trường đào tạo CNTT hàng đầu',
      year: '2024',
      icon: 'fa-trophy'
    },
    {
      title: 'Giải thưởng An ninh mạng quốc gia',
      year: '2023',
      icon: 'fa-award'
    },
    {
      title: '100+ công trình nghiên cứu khoa học',
      year: '2023',
      icon: 'fa-microscope'
    },
    {
      title: '50+ hợp tác quốc tế',
      year: '2024',
      icon: 'fa-handshake'
    }
  ];

  ngOnInit() {
    this.startSlideShow();
  }

  startSlideShow() {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
  }

  openLink(link?: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }
}
