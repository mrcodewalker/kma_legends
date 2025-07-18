import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CelebrationService } from 'src/app/services/celebration.service';

@Component({
  selector: 'app-celebration-canvas',
  template: `<canvas #celebrationCanvas class="celebration-canvas"></canvas>`,
  styles: [`
    .celebration-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99;
    }
  `]
})
export class CelebrationCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('celebrationCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private fireworks: Firework[] = [];
  private stars: Star[] = [];
  private animationId: number = 0;
  private subscription: Subscription;
  private isCelebrating: boolean = false;
  private isCanvasReady: boolean = false; // Added
  private resizeObserver!: ResizeObserver;

  constructor(private ngZone: NgZone, private celebrationService: CelebrationService) {
    this.subscription = this.celebrationService.celebration$.subscribe(
      isCelebrating => {
        this.isCelebrating = isCelebrating;
        if (isCelebrating && this.isCanvasReady) { // Updated
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      }
    );
  }

  ngOnInit() {
    // Canvas is not ready yet, so we don't do anything here
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.createStars();
    this.isCanvasReady = true; // Added
    if (this.isCelebrating) { // Added
      this.startAnimation(); // Added
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.createStars();
    };

    updateCanvasSize();

    this.resizeObserver = new ResizeObserver(updateCanvasSize);
    this.resizeObserver.observe(document.body);
  }

  private createStars() {
    this.stars = [];
    const canvas = this.canvasRef.nativeElement;
    const numberOfStars = Math.floor(canvas.width * canvas.height / 15000);
    for (let i = 0; i < numberOfStars; i++) {
      this.stars.push(new Star(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }
  }

  private startAnimation() {
    if (!this.animationId && this.isCanvasReady) { // Updated
      this.ngZone.runOutsideAngular(() => this.animate());
    }
  }

  private stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
      // Clear the canvas when stopping
      if (this.ctx && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      // Clear arrays
      this.particles = [];
      this.fireworks = [];
    }
  }

  private animate() {
    if (!this.isCelebrating || !this.isCanvasReady) { // Updated
      this.stopAnimation();
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.stars.forEach(star => {
      star.update();
      star.draw(this.ctx);
    });

    if (Math.random() < 0.03) {
      this.fireworks.push(new Firework(
        Math.random() * canvas.width,
        canvas.height
      ));
    }

    this.fireworks = this.fireworks.filter((firework) => { // Updated - removed index parameter
      firework.update();
      firework.draw(this.ctx);

      if (firework.shouldExplode()) {
        const particles = firework.explode();
        this.particles.push(...particles);
        return false;
      }
      return true;
    });

    this.particles = this.particles.filter(particle => {
      particle.update();
      particle.draw(this.ctx);
      return particle.alpha > 0;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    this.stopAnimation();
    this.subscription.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

class Star {
  private size: number;
  private flickerRate: number;
  private brightness: number;

  constructor(
    private x: number,
    private y: number
  ) {
    this.size = Math.random() * 2;
    this.flickerRate = 0.05 + Math.random() * 0.1;
    this.brightness = Math.random();
  }

  update() {
    this.brightness += (Math.random() - 0.5) * this.flickerRate;
    this.brightness = Math.max(0, Math.min(1, this.brightness));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}


class Particle {
  public velocity: { x: number; y: number };
  public alpha: number = 1;
  private rotation: number = Math.random() * Math.PI * 2;
  private rotationSpeed: number = (Math.random() - 0.5) * 0.2;
  private size: number;
  private fadeSpeed: number;

  constructor(
    private x: number,
    private y: number,
    private color: string,
    private type: 'normal' | 'sparkle' | 'trail' = 'normal'
  ) {
    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'trail' ? Math.random() * 2 + 1 : Math.random() * 4 + 3;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };

    this.size = type === 'sparkle' ? Math.random() * 3 + 2 : Math.random() * 2 + 1;
    this.fadeSpeed = type === 'trail' ? 0.03 : 0.01;
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += this.type === 'trail' ? 0.05 : 0.07;
    this.rotation += this.rotationSpeed;
    this.alpha -= this.fadeSpeed;

    // Thêm hiệu ứng lấp lánh cho sparkle
    if (this.type === 'sparkle') {
      this.alpha = Math.max(0, this.alpha * (0.95 + Math.random() * 0.05));
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    if (this.type === 'sparkle') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 + this.rotation;
        const x1 = this.x + Math.cos(angle) * this.size;
        const y1 = this.y + Math.sin(angle) * this.size;
        if (i === 0) {
          ctx.moveTo(x1, y1);
        } else {
          ctx.lineTo(x1, y1);
        }
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Vẽ hạt thường
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class Firework {
  private velocity: { x: number; y: number };
  private gravity: number = 0.2;
  private color: string;
  private tailParticles: Particle[] = [];
  private type: 'normal' | 'multi' | 'spiral' | 'heart';
  private hasExploded: boolean = false;

  constructor(
    private x: number,
    private y: number
  ) {
    const targetY = Math.random() * (window.innerHeight * 0.6);
    // const targetY = Math.random() * (window.innerHeight * 0.6);
    const angle = Math.atan2(targetY - y, 0);
    const speed = 13 + Math.random() * 7;
    const second_speed = (Math.random() * (15 - 13 + 1) + 13);

    this.velocity = {
      x: Math.random() * 4 - 2,
      y: Math.sin(angle) * second_speed
    };

    const types: ('normal' | 'multi' | 'spiral' | 'heart')[] = ['normal', 'multi', 'spiral', 'heart'];
    this.type = types[Math.floor(Math.random() * types.length)];

    if (this.type === 'multi') {
      this.color = `hsl(${Math.random() * 360}, 100%, 70%)`; // Màu rực rỡ hơn
    } else if (this.type === 'heart') {
      this.color = 'rgb(255, 50, 50)'; // Màu đỏ cho trái tim
    } else {
      const hue = Math.random() * 360;
      this.color = `hsl(${hue}, 100%, 60%)`; // Màu sáng hơn
    }
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += this.gravity;

    // Thêm đuôi pháo với xác suất cao hơn
    if (Math.random() < 0.5) {
      this.tailParticles.push(new Particle(this.x, this.y, this.color, 'trail'));
    }

    // Cập nhật đuôi pháo
    this.tailParticles = this.tailParticles.filter(particle => {
      particle.update();
      return particle.alpha > 0;
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Vẽ quả pháo với hiệu ứng phát sáng
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Vẽ đuôi pháo
    this.tailParticles.forEach(particle => particle.draw(ctx));
  }

  shouldExplode(): boolean {
    return this.velocity.y >= -2;
  }

  explode(): Particle[] {
    if (this.hasExploded) return [];
    this.hasExploded = true;

    const particles: Particle[] = [];

    switch (this.type) {
      case 'multi':
        // Nổ nhiều màu
        const explode = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
        for (let i = 0; i < explode; i++) {
          const hue = Math.random() * 360;
          const color = `hsl(${hue}, 100%, 60%)`;
          particles.push(new Particle(this.x, this.y, color,
            Math.random() < 0.3 ? 'sparkle' : 'normal'));
        }
        break;

      case 'spiral':
        // Nổ xoắn ốc
        const arms = 3;
        const particlesPerArm = 40;
        for (let arm = 0; arm < arms; arm++) {
          for (let i = 0; i < particlesPerArm; i++) {
            const angle = (i / particlesPerArm) * Math.PI * 2 + (arm * Math.PI * 2 / arms);
            const speed = 2 + Math.random() * 3;
            const particle = new Particle(this.x, this.y, this.color);
            particle.velocity = {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed
            };
            particles.push(particle);
          }
        }
        break;

      case 'heart':
        // Nổ hình trái tim
        for (let i = 0; i < 100; i++) {
          const angle = (i / 180) * Math.PI * 2;
          const r = Math.sin(angle) * Math.sqrt(Math.abs(Math.cos(angle))) / (Math.sin(angle) + 1.4);
          const speed = 3 + Math.random() * 2;
          const particle = new Particle(this.x, this.y, this.color);
          particle.velocity = {
            x: Math.cos(angle) * r * speed * 2,
            y: Math.sin(angle) * r * speed * 2
          };
          particles.push(particle);
        }
        break;

      default:
        // Nổ thường với nhiều hạt lấp lánh hơn
        for (let i = 0; i < 50; i++) {
          particles.push(new Particle(this.x, this.y, this.color,
            Math.random() < 0.4 ? 'sparkle' : 'normal'));
        }
        break;
    }

    return particles;
  }
}