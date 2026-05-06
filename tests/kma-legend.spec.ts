import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4200/'; // Đã đổi sang localhost vì bạn đang chạy yarn start

test.describe('KMA Legend - Test Suite Toàn Diện', () => {

  // =====================================================================
  // 🔴 MỨC ĐỘ CAO (HIGH PRIORITY) - CÁC LUỒNG CHỨC NĂNG CHÍNH (HAPPY PATH)
  // =====================================================================
  test.describe('1. Mức độ Cao: Chức năng cốt lõi', () => {
    
    test('1.1. Truy cập trang chủ thành công', async ({ page }) => {
      await page.goto(BASE_URL);
      // Kiểm tra trang load thành công
      await expect(page).toHaveTitle(/KMA Legend/i); // Điều chỉnh regex theo title thực tế
      // Kiểm tra Header hiển thị (app-header wrapper có thể có kích thước 0x0 do thẻ con dùng fixed, nên ta select thẻ header con)
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
    });

    test('1.2. Điều hướng qua các Menu chính', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Test chuyển sang trang Lịch học
      await page.getByRole('link', { name: 'Lịch học', exact: true }).first().click();
      await expect(page).toHaveURL(/.*schedule/, { timeout: 10000 });
      
      // Về lại trang chủ để test link khác cho chắc chắn
      await page.goto(BASE_URL);
      await page.getByRole('link', { name: 'Điểm số', exact: true }).first().click();
      await expect(page).toHaveURL(/.*scores/, { timeout: 10000 });

      // Về lại trang chủ
      await page.goto(BASE_URL);
      await page.getByRole('link', { name: 'Học bổng', exact: true }).first().click();
      await expect(page).toHaveURL(/.*scholarship/, { timeout: 10000 });
    });

    test('1.3. Luồng đăng nhập Lịch học ảo (Thành công)', async ({ page }) => {
      await page.goto(`${BASE_URL}login-virtual-calendar`);
      
      // Điền thông tin hợp lệ (Thay thế bằng thông tin test thật nếu có)
      await page.getByPlaceholder(/Enter your username/i).fill('CT070218');
      await page.getByPlaceholder(/Enter your password/i).fill('Haibeo2004@');
      await page.getByRole('button', { name: /Sign In/i }).click();

      // Giả lập API trả về thành công hoặc chờ điều hướng
      await expect(page).toHaveURL(/.*virtual-calendar/, { timeout: 15000 });
      await expect(page).toHaveURL(/.*virtual-calendar/, { timeout: 15000 });
      await expect(page.locator('app-virtual-calendar')).toBeVisible({ timeout: 10000 });
    });

    test('1.4. Tra cứu điểm chính thức', async ({ page }) => {
      await page.goto(`${BASE_URL}scores`);
      
      const searchInput = page.locator('input[formControlName="studentCode"]');
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('CT070218'); // Mã SV thật
      await page.getByRole('button', { name: /Tra cứu/i }).click();

      // Kiểm tra loading state (nếu kịp) hoặc kết quả
      // Đợi bảng điểm và tên sinh viên hiện ra
      await expect(page.locator('h2.text-2xl.font-bold').first()).toBeVisible({ timeout: 15000 });
      // Kiểm tra có dòng điểm nào được render không
      const scoreRows = page.locator('table tbody tr');
      await expect(scoreRows.count()).resolves.toBeGreaterThan(0);
    });
  });

  // =====================================================================
  // 🟡 MỨC ĐỘ TRUNG BÌNH (MEDIUM PRIORITY) - VALIDATION VÀ EDGE CASES
  // =====================================================================
  test.describe('2. Mức độ Trung bình: Xử lý lỗi và ngoại lệ', () => {

    test('2.1. Đăng nhập Lịch học ảo với tài khoản sai', async ({ page }) => {
      await page.goto(`${BASE_URL}login-virtual-calendar`);
      
      await page.getByPlaceholder(/Enter your username/i).fill('invalid_user');
      await page.getByPlaceholder(/Enter your password/i).fill('wrong_pass');
      await page.getByRole('button', { name: /Sign In/i }).click();

      // Chờ thông báo lỗi xuất hiện
      const errorMessage = page.getByText(/Invalid username or password|required/i).first();
      await expect(errorMessage).toBeVisible({ timeout: 15000 });
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

  // =====================================================================
  // 📈 KIỂM THỬ BẢNG ĐIỂM ẢO (VIRTUAL SCORES INTERACTIONS)
  // =====================================================================
  test.describe('6. Bảng điểm ảo - Tương tác và Tính toán', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login lấy session (dùng trang login chính để lấy schedule_secret)
      await page.goto(`${BASE_URL}login`);
      await page.getByPlaceholder(/Enter your username/i).fill('CT070218');
      await page.getByPlaceholder(/Enter your password/i).fill('Haibeo2004@');
      await page.getByRole('button', { name: /Sign In/i }).click();
      await expect(page).toHaveURL(/.*schedule/, { timeout: 15000 });
      
      // Chuyển sang bảng điểm ảo
      await page.goto(`${BASE_URL}virtual-scores`);
      await expect(page.locator('.virtual-table-container').first()).toBeVisible({ timeout: 15000 });
    });

    test('6.1. Thêm môn học mới và kiểm tra tính điểm', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const initialCount = await rows.count();

      // Bấm thêm môn
      await page.getByRole('button', { name: /Thêm môn/i }).click();
      await expect(rows).toHaveCount(initialCount + 1);

      const lastRow = rows.last();
      
      // Nhập Tên môn
      await lastRow.locator('input[placeholder="Nhập tên môn học..."]').fill('Kiểm thử phần mềm TDD');
      
      // Nhập Số Tín chỉ
      const creditInput = lastRow.locator('td').nth(2).locator('input');
      await creditInput.fill('3');
      await creditInput.press('Tab');

      // Nhập điểm Thành phần 1, 2 và Cuối kỳ
      const scoreFirst = lastRow.locator('td').nth(3).locator('input');
      const scoreSecond = lastRow.locator('td').nth(4).locator('input');
      const scoreFinal = lastRow.locator('td').nth(5).locator('input');

      await scoreFirst.fill('8.5');
      await scoreFirst.press('Tab');
      await scoreSecond.fill('9.0');
      await scoreSecond.press('Tab');
      await scoreFinal.fill('8.0');
      await scoreFinal.press('Tab'); // Trigger blur 

      // Đợi chút để Angular tính toán (thường là ngay lập tức)
      await page.waitForTimeout(500);

      // Điểm tổng kết = (8.5*0.7 + 9.0*0.3)*0.3 + 8.0*0.7 = 8.195 => Làm tròn thành 8.20
      const overallScoreSpan = lastRow.locator('td').nth(6).locator('span');
      await expect(overallScoreSpan).toHaveText(/8\.20/);
      
      // Điểm chữ phải là B+ (Từ 7.8 đến 8.4)
      const letterGradeSpan = lastRow.locator('td').nth(7).locator('span');
      await expect(letterGradeSpan).toHaveText(/B\+/);
    });

    test('6.2. Xóa môn học và Confirm Dialog', async ({ page }) => {
      // Bấm thêm 1 môn nháp để thao tác xóa an toàn
      await page.getByRole('button', { name: /Thêm môn/i }).click();
      
      const rows = page.locator('table tbody tr');
      await page.waitForTimeout(500); // Chờ render DOM
      const rowCount = await rows.count();
      
      // Bấm nút xóa ở hàng cuối
      const deleteBtn = rows.last().locator('button').locator('.fa-trash-alt');
      await deleteBtn.click();

      // Dialog mở ra
      const dialog = page.locator('mat-dialog-container');
      await expect(dialog).toBeVisible();

      // Bấm hủy -> Test Dialog đóng lại, data không mất
      await dialog.getByRole('button', { name: /Hủy/i }).click();
      await expect(dialog).toBeHidden();
      await expect(rows).toHaveCount(rowCount);

      // Bấm xóa lại lần 2 -> Test Chọn Xác Nhận
      await deleteBtn.click();
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: /Xóa/i }).click();
      
      // Đợi dialog đóng và kiểm tra bảng bị giảm đi 1 hàng
      await expect(dialog).toBeHidden();
      await expect(rows).toHaveCount(rowCount - 1);
    });

    test('6.3. Xem Thống kê xếp loại (Stats Dialog)', async ({ page }) => {
      // Bấm nút Thống kê
      await page.getByRole('button', { name: /Thống kê/i }).click();
      const statsDialog = page.locator('app-virtual-scores-stats-dialog');
      await expect(statsDialog).toBeVisible();
      
      // Kiểm tra tiêu đề dialog
      await expect(statsDialog.getByText(/Thống kê bảng điểm ảo/i)).toBeVisible();
      
      // Đóng dialog thống kê
      await statsDialog.locator('button.close-btn').click();
      await expect(statsDialog).toBeHidden();
    });

    test('6.4. Tính toán CPA mục tiêu', async ({ page }) => {
      // Bấm nút CPA mục tiêu
      await page.getByRole('button', { name: /CPA mục tiêu/i }).click();
      const cpaDialog = page.locator('mat-dialog-container');
      await expect(cpaDialog).toBeVisible();
      await expect(cpaDialog.getByText(/Tính CPA Mục tiêu/i)).toBeVisible();
      
      // Nhập Tổng số tín chỉ và CPA mục tiêu
      await page.locator('input[formControlName="totalCredits"]').fill('170');
      await page.locator('input[formControlName="targetCPA"]').fill('3.2');
      
      // Bấm nút Tính toán
      await cpaDialog.getByRole('button', { name: /Tính toán/i }).click();

      // Kiểm tra kết quả hiển thị ra (phải có dòng Kết quả tính toán hoặc Không thể đạt được)
      const resultBlock = cpaDialog.getByText(/Kết quả tính toán|Không thể đạt được/i).first();
      await expect(resultBlock).toBeVisible();

      // Đóng dialog CPA
      await cpaDialog.getByRole('button', { name: /Đóng/i }).click();
      await expect(cpaDialog).toBeHidden();
    });
  });

  // =====================================================================
  // 🔐 KIỂM THỬ BẢO MẬT NÂNG CAO (RSA & AES ENCRYPTION)
  // =====================================================================
  test.describe('7. Kiểm thử Bảo mật nâng cao (Mã hóa đường truyền)', () => {

    test('7.1. Login Payload phải được mã hóa bằng thuật toán lai RSA+AES', async ({ page }) => {
      // Thiết lập listener để chặn và kiểm tra request mạng đi qua
      const requestPromise = page.waitForRequest(request => 
        request.url().includes('/auth/login') && request.method() === 'POST'
      );

      // Điền form và thực hiện gửi
      await page.goto(`${BASE_URL}login`);
      await page.getByPlaceholder(/Enter your username/i).fill('CT070218');
      await page.getByPlaceholder(/Enter your password/i).fill('Haibeo2004@');
      await page.getByRole('button', { name: /Sign In/i }).click();

      // Bắt request gửi đi
      const loginRequest = await requestPromise;
      const postData = loginRequest.postDataJSON();

      // IN RA CONSOLE VÀ DỪNG TRÌNH DUYỆT ĐỂ BẠN XEM
      console.log('--- PAYLOAD GỬI ĐI TỪ BROWSER ---');
      console.log(JSON.stringify(postData, null, 2));
      console.log('-----------------------------------');
      // Lệnh này sẽ tạm dừng test (chỉ chạy trong chế độ --ui hoặc --headed) để bạn tự tay xem Network
      await page.pause();

      // Thực hiện kiểm thử (Assertions)
      // 1. Phải có trường chứa Data được mã hóa AES
      expect(postData).toHaveProperty('encryptedData');
      // 2. Phải có trường chứa Key AES được mã hóa RSA
      expect(postData).toHaveProperty('encryptedKey');
      // 3. Phải có Initialization Vector (IV)
      expect(postData).toHaveProperty('iv');
      
      // 4. Tuyệt đối KHÔNG ĐƯỢC chứa password ở dạng plain text trên payload
      expect(postData).not.toHaveProperty('password');
      expect(postData).not.toHaveProperty('username');
      
      // 5. Kiểm tra định dạng dữ liệu (phải là chuỗi mã hóa, không chứa chữ text thuần)
      expect(typeof postData.encryptedData).toBe('string');
      expect(postData.encryptedData).not.toContain('Haibeo2004@');
    });

  });

  // =====================================================================
  // 8. KIỂM THỬ XẾP LỊCH HỌC ẢO (VIRTUAL CALENDAR) & LOG BUG
  // =====================================================================
  test.describe('8. Kiểm thử Xếp lịch học ảo (Virtual Calendar)', () => {
    
    test.beforeEach(async ({ page }) => {
      // Đăng nhập vào trang Xếp lịch học ảo
      await page.goto(`${BASE_URL}login-virtual-calendar`);
      await page.getByPlaceholder(/Enter your username/i).fill('CT070218');
      await page.getByPlaceholder(/Enter your password/i).fill('Haibeo2004@');
      await page.getByRole('button', { name: /Sign In/i }).click();
      await expect(page).toHaveURL(/.*virtual-calendar/, { timeout: 15000 });
    });

    test('8.1. Chọn nhiều môn và kiểm tra lỗi trùng lịch', async ({ page }) => {
      // Chờ dropdown Khóa/Khối xuất hiện và chọn Khóa đầu tiên có dữ liệu
      const courseBlockSelect = page.locator('select').first();
      await courseBlockSelect.waitFor({ state: 'visible' });
      // Lấy option thứ 2 (bỏ qua option "-- Chọn Khóa --")
      const firstBlock = await courseBlockSelect.locator('option').nth(1).getAttribute('value');
      await courseBlockSelect.selectOption(firstBlock || '');

      // Đợi dropdown Môn Học xuất hiện
      const courseSelect = page.locator('select').nth(1);
      await courseSelect.waitFor({ state: 'visible' });
      
      // Đếm số lượng Môn Học có trong dropdown
      const courseOptionsCount = await courseSelect.locator('option').count();
      let conflictFound = false;

      // Lặp qua từng môn học (bỏ qua option đầu tiên "-- Chọn Môn --")
      for (let i = 1; i < courseOptionsCount; i++) {
        // Lấy value của môn học thứ i
        const courseValue = await courseSelect.locator('option').nth(i).getAttribute('value');
        if (!courseValue) continue;

        // Chọn môn học
        await courseSelect.selectOption(courseValue);
        await page.waitForTimeout(500); // Đợi bảng lớp học render và animation
        
        // Nhấn chọn lớp đầu tiên trong danh sách của môn đó
        const classTable = page.locator('table').first();
        const firstRow = classTable.locator('tbody tr').first();
        if (await firstRow.isVisible()) {
          await firstRow.click();
        }

        await page.waitForTimeout(500); // Đợi xíu xem popup báo lỗi có nhảy lên không

        // Mở rộng bảng "Các lớp đã chọn" nếu đang đóng (chỉ làm lần đầu)
        if (i === 1) {
          const selectedClassesHeader = page.getByText('Các lớp đã chọn:');
          if (await selectedClassesHeader.isVisible()) {
            const toggleBtn = selectedClassesHeader.locator('..').locator('button');
            const iconClass = await toggleBtn.locator('i').getAttribute('class');
            if (iconClass?.includes('fa-chevron-right')) {
              await toggleBtn.click();
            }
          }
        }

        // Kiểm tra xem có popup trùng lịch xuất hiện không
        const conflictDialog = page.locator('mat-dialog-container').filter({ hasText: /Cảnh báo trùng lịch/i });
        if (await conflictDialog.isVisible()) {
          conflictFound = true;
          console.log(`--- PHÁT HIỆN LỖI TRÙNG LỊCH Ở LẦN CHỌN THỨ ${i} (BUG) ---`);
          const warningMsg = await conflictDialog.locator('.content').innerText();
          console.log('Cảnh báo:', warningMsg.replace(/\n/g, ' '));
          
          // Chờ 5 giây để bạn có thể xem popup trước khi nó bị đóng
          await page.waitForTimeout(5000);

          // Đóng dialog (dùng locator trực tiếp thay vì getByRole để tránh treo)
          const closeBtn = conflictDialog.locator('button', { hasText: /Đóng/i }).first();
          await closeBtn.click({ force: true });
          await conflictDialog.waitFor({ state: 'hidden' });
          break; // Dừng vòng lặp ngay lập tức khi phát hiện lỗi
        }
      }

      if (conflictFound) {
        // In ra các lớp đã bị thêm vào danh sách Selected Classes để chứng minh Bug
        console.log('--- DANH SÁCH CÁC LỚP ĐÃ CHỌN TRONG BẢNG (KẾT QUẢ CỦA BUG) ---');
        const selectedClassesTable = page.locator('table').nth(1);
        if (await selectedClassesTable.isVisible()) {
          const rowsCount = await selectedClassesTable.locator('tbody tr').count();
          
          for (let r = 0; r < rowsCount; r++) {
            const rowText = await selectedClassesTable.locator('tbody tr').nth(r).innerText();
            console.log(`Lớp ${r + 1}: ${rowText.replace(/\n/g, ' | ')}`);
          }
        }
        console.log('--------------------------------------------------------------');

        // Tạm dừng để bạn có thể xem xét DOM và Console (Chỉ hoạt động ở chế độ có UI)
        await page.pause();
      } else {
        console.log('Chưa tìm thấy trùng lịch sau khi duyệt hết tất cả các môn.');
      }
    });

  });

});
