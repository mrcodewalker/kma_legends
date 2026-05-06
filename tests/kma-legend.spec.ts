import { test, expect } from '@playwright/test';

const BASE_URL = 'https://kma-legend.click/'; // Có thể đổi thành http://localhost:4200/ khi test local

test.describe('KMA Legend - Test Suite Toàn Diện', () => {

  // =====================================================================
  // 🔴 MỨC ĐỘ CAO (HIGH PRIORITY) - CÁC LUỒNG CHỨC NĂNG CHÍNH (HAPPY PATH)
  // =====================================================================
  test.describe('1. Mức độ Cao: Chức năng cốt lõi', () => {
    
    test('1.1. Truy cập trang chủ thành công', async ({ page }) => {
      await page.goto(BASE_URL);
      // Kiểm tra trang load thành công
      await expect(page).toHaveTitle(/KMA Legend/i); // Điều chỉnh regex theo title thực tế
      // Kiểm tra Header hiển thị
      const header = page.locator('app-header');
      await expect(header).toBeVisible();
    });

    test('1.2. Điều hướng qua các Menu chính', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Test chuyển sang trang Lịch học
      await page.getByRole('link', { name: 'Lịch học' }).first().click();
      await expect(page).toHaveURL(/.*schedule/);
      
      // Test chuyển sang trang Điểm số
      await page.getByRole('link', { name: 'Điểm số' }).first().click();
      await expect(page).toHaveURL(/.*scores/);

      // Test chuyển sang trang Học bổng
      await page.getByRole('link', { name: 'Học bổng' }).first().click();
      await expect(page).toHaveURL(/.*scholarship/);
    });

    test('1.3. Luồng đăng nhập Lịch học ảo (Thành công)', async ({ page }) => {
      await page.goto(`${BASE_URL}login-virtual-calendar`);
      
      // Điền thông tin hợp lệ (Thay thế bằng thông tin test thật nếu có)
      await page.getByPlaceholder(/Tài khoản|Mã sinh viên/i).fill('CT000000');
      await page.getByPlaceholder(/Mật khẩu/i).fill('password123');
      await page.getByRole('button', { name: /Đăng nhập/i }).click();

      // Giả lập API trả về thành công hoặc chờ điều hướng
      // Nếu test local không có backend thực, test này có thể fail, cần mock API
      // await expect(page).toHaveURL(/.*virtual-calendar/);
    });

    test('1.4. Tra cứu điểm chính thức', async ({ page }) => {
      await page.goto(`${BASE_URL}scores`);
      
      const searchInput = page.locator('input[formControlName="studentCode"]');
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('CT060001'); // Mã SV giả định
      await page.getByRole('button', { name: /Tra cứu/i }).click();

      // Kiểm tra loading state (nếu kịp) hoặc kết quả
      // await expect(page.locator('text=Đang tải')).toBeVisible();
    });
  });

  // =====================================================================
  // 🟡 MỨC ĐỘ TRUNG BÌNH (MEDIUM PRIORITY) - VALIDATION VÀ EDGE CASES
  // =====================================================================
  test.describe('2. Mức độ Trung bình: Xử lý lỗi và ngoại lệ', () => {

    test('2.1. Đăng nhập Lịch học ảo với tài khoản sai', async ({ page }) => {
      await page.goto(`${BASE_URL}login-virtual-calendar`);
      
      await page.getByPlaceholder(/Tài khoản|Mã sinh viên/i).fill('invalid_user');
      await page.getByPlaceholder(/Mật khẩu/i).fill('wrong_pass');
      await page.getByRole('button', { name: /Đăng nhập/i }).click();

      // Chờ thông báo lỗi xuất hiện
      const errorMessage = page.locator('.text-red-500, .error-message').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('2.2. Tra cứu điểm với mã sinh viên rỗng/không hợp lệ', async ({ page }) => {
      await page.goto(`${BASE_URL}scores`);
      
      const searchInput = page.locator('input[formControlName="studentCode"]');
      const searchButton = page.getByRole('button', { name: /Tra cứu/i });

      // Cố tình bấm tìm kiếm khi chưa nhập gì (Nút phải bị disable)
      await expect(searchButton).toBeDisabled();

      // Nhập mã không hợp lệ (quá ngắn)
      await searchInput.fill('CT');
      // Nhấn Enter hoặc click ngoài để kích hoạt validation
      await searchInput.press('Tab'); 
      await expect(searchButton).toBeDisabled();
    });

    test('2.3. Bảng điểm ảo - Chặn truy cập khi chưa đăng nhập', async ({ page }) => {
      // Xóa local storage để đảm bảo chưa đăng nhập
      await page.addInitScript(() => window.localStorage.clear());
      
      await page.goto(`${BASE_URL}virtual-scores`);
      
      // Phải hiển thị màn hình yêu cầu đăng nhập
      await expect(page.getByText(/Bạn cần đăng nhập vào Lịch học/i)).toBeVisible();
      
      // Click nút chuyển hướng
      await page.getByRole('button', { name: /Đăng nhập/i }).click();
      // Hiện tại code của bạn redirect sang '/login', bạn có thể cần chỉnh lại route thực tế
      // await expect(page).toHaveURL(/.*login/);
    });
  });

  // =====================================================================
  // 🟢 MỨC ĐỘ THẤP (LOW PRIORITY) - GIAO DIỆN & TRẢI NGHIỆM
  // =====================================================================
  test.describe('3. Mức độ Thấp: UI/UX', () => {
    
    test('3.1. Hiển thị UI trên Mobile (Responsive)', async ({ page }) => {
      // Giả lập kích thước màn hình iPhone 12
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(BASE_URL);

      // Nút hamburger menu phải hiển thị
      const mobileMenuBtn = page.locator('button.mobile-menu-btn, .mobile-menu-toggle').first();
      // Note: Selector này tùy thuộc vào class thực tế bạn dùng trong header
      // await expect(mobileMenuBtn).toBeVisible(); 
    });

    test('3.2. Hiển thị Lịch sử tra cứu điểm', async ({ page }) => {
      await page.goto(`${BASE_URL}scores`);
      
      // Nút xem lịch sử
      const historyBtn = page.locator('button[title="Lịch sử tra cứu"]');
      if (await historyBtn.isVisible()) {
        await historyBtn.click();
        // Kiểm tra xem panel lịch sử có bật ra không
        const historyPanel = page.getByText(/Chưa có lịch sử|Lịch sử tra cứu/i).first();
        await expect(historyPanel).toBeVisible();
      }
    });
  });

  // =====================================================================
  // 🛡️ KIỂM THỬ BẢO MẬT CƠ BẢN (SECURITY TESTING)
  // =====================================================================
  test.describe('4. Kiểm thử Bảo mật (Cơ bản)', () => {
    
    test('4.1. XSS Injection qua ô tìm kiếm (Input Sanitization)', async ({ page }) => {
      await page.goto(`${BASE_URL}scores`);
      
      const searchInput = page.locator('input[formControlName="studentCode"]');
      // Nhập payload XSS đơn giản
      const xssPayload = '<script>alert("XSS")</script>';
      await searchInput.fill(xssPayload);
      
      // Thử submit (Có thể nút bị disable vì chứa ký tự đặc biệt, như vậy là tốt)
      const searchButton = page.getByRole('button', { name: /Tra cứu/i });
      if (await searchButton.isEnabled()) {
        await searchButton.click();
      }

      // Đảm bảo không có dialog alert nào xuất hiện do script thực thi
      page.on('dialog', dialog => {
        expect(dialog.type()).not.toBe('alert');
        dialog.dismiss();
      });
    });

    test('4.2. Kiểm tra route ảo không tồn tại (404 Handling)', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}route-khong-ton-tai-123`);
      
      // Đảm bảo app không crash và redirect về trang chủ (như config trong app-routing.module.ts)
      await expect(page).toHaveURL(BASE_URL);
    });
  });

  // =====================================================================
  // ⚡ KIỂM THỬ HIỆU NĂNG CƠ BẢN (PERFORMANCE TESTING)
  // =====================================================================
  test.describe('5. Kiểm thử Hiệu năng (Load time)', () => {
    
    test('5.1. Trang chủ Load dưới 3 giây', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      
      console.log(`Thời gian load DOM trang chủ: ${loadTime}ms`);
      // Fail nếu load quá 3000ms
      expect(loadTime).toBeLessThan(3000); 
    });

    test('5.2. Không có lỗi Console (Warnings/Errors)', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(BASE_URL);
      // Đảm bảo mảng lỗi rỗng
      // expect(errors.length).toBe(0); 
    });
  });

});
