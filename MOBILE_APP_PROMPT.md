# KMA Legend — Prompt cho Mobile App Android Studio

> Đây là tài liệu mô tả đầy đủ hệ thống web **KMA Legend** (Angular 16) để làm tài liệu tham chiếu khi xây dựng lại ứng dụng Android tương đương.

---

## 1. Tổng quan hệ thống

**KMA Legend** là ứng dụng hỗ trợ sinh viên Học viện Kỹ thuật Mật mã (KMA) với các chức năng:
- Xem lịch học cá nhân
- Tra cứu bảng điểm
- Bảng điểm ảo (mô phỏng, chỉnh sửa, tính CPA)
- Đăng ký học phần ảo (xây dựng thời khóa biểu)
- Xem danh sách học bổng
- Thông tin chương trình học

**Base API URL:** `https://kma-legend.click/api/v1`

**Bảo mật:** Tất cả request POST đều được mã hóa bằng RSA + AES hybrid trước khi gửi lên server.

---

## 2. Màn hình & Chức năng (tương đương Routes)

> Trên web có 2 màn hình đăng nhập riêng (`/login` và `/login-virtual-calendar`) vì dữ liệu lấy theo yêu cầu. Mobile gộp thành **1 màn hình đăng nhập duy nhất**, gọi song song cả 2 API và cache kết quả.

| Route (Web) | Màn hình Android | Mô tả |
|---|---|---|
| `/` | HomeActivity / HomeFragment | Trang chủ |
| `/login` + `/login-virtual-calendar` | LoginActivity | **1 màn hình đăng nhập duy nhất** (gọi 2 API song song) |
| `/schedule` | ScheduleActivity | Xem lịch học dạng calendar |
| `/scores` | ScoresActivity | Tra cứu & quản lý điểm |
| `/scholarship` | ScholarshipActivity | Danh sách học bổng |
| `/virtual-calendar` | VirtualCalendarActivity | Đăng ký học phần ảo |
| `/about` | AboutActivity | Thông tin chương trình học |
| `/buy-me-coffee` | DonateActivity | Trang ủng hộ |
| `/feedback` | FeedbackActivity | Gửi phản hồi |
| `/qa` | QAActivity | Hỏi đáp |

---

## 3. Chi tiết từng màn hình

### 3.1 HomeActivity — Trang chủ

**Nội dung hiển thị:**
- Carousel ảnh trường (tự động chuyển 5 giây/slide), gồm 3 slide: môi trường học tập, giảng viên, cơ hội nghề nghiệp
- Danh sách tính năng nổi bật (4 card): Quản lý điểm số, Lịch học thông minh, Học bổng dự kiến, Thông báo thông minh
- Thống kê trường: 5000+ sinh viên, 200+ giảng viên, 50+ phòng học, 95% tỷ lệ việc làm
- Danh sách khoa: An toàn thông tin, Công nghệ thông tin, Điện tử viễn thông, An toàn mạng
- Tin tức (3 bài): Lễ tốt nghiệp, Hội thảo ATTT, Ký kết hợp tác
- Testimonials (3 cựu sinh viên)
- Thành tích (4 mục)

**Điều hướng:** Các nút trên màn hình dẫn đến các màn hình tương ứng.

---

### 3.2 LoginActivity — Đăng nhập

> **Khác biệt quan trọng so với web:** Trên web có 2 màn hình đăng nhập riêng biệt (`/login` cho lịch học, `/login-virtual-calendar` cho lịch ảo) vì dữ liệu được lấy theo yêu cầu (on-demand). Trên **mobile**, chỉ có **1 màn hình đăng nhập duy nhất** — khi đăng nhập, app gọi **song song cả 2 API** và cache cả 2 kết quả vào local storage. Các màn hình sau chỉ đọc từ cache, không cần đăng nhập lại.

**Form:**
- Input: Mã sinh viên (username), Mật khẩu (password)
- Nút: Đăng nhập
- Loading indicator trong khi gọi API

**Logic đăng nhập (gọi song song 2 API):**
```kotlin
fun login(username: String, password: String) {
    showLoading()
    val credentials = mapOf("username" to username, "password" to password)

    // Gọi song song cả 2 API
    viewModelScope.launch {
        val scheduleDeferred = async { loginService.login(credentials) }
        val virtualCalDeferred = async { loginService.loginVirtualCalendar(credentials) }

        try {
            val scheduleResult = scheduleDeferred.await()
            val virtualCalResult = virtualCalDeferred.await()

            // Cache cả 2 vào SharedPreferences
            prefs.edit()
                .putString("schedule_secret", gson.toJson(scheduleResult))
                .putString("virtual_calendar_secret", gson.toJson(virtualCalResult))
                .apply()

            navigateTo(HomeActivity)
        } catch (e: Exception) {
            showError(e)
        } finally {
            hideLoading()
        }
    }
}
```

**API gọi:**
1. `POST /api/v1/auth/login` → lưu vào `schedule_secret`
2. `POST /api/v1/auth/virtual-calendar` → lưu vào `virtual_calendar_secret`

Cả 2 request đều dùng cùng `{ username, password }` đã mã hóa RSA+AES.

**Response `/auth/login`:**
```json
{
  "code": "200",
  "data": {
    "student_info": { "display_name", "student_code", "gender", "birthday", ... },
    "student_schedule": [ { "course_name", "course_code", "study_days", "lessons", "study_location", "teacher" } ]
  }
}
```

**Response `/auth/virtual-calendar`:**
```json
{
  "code": "200",
  "data": {
    "student_info": { ... },
    "virtual_calendar": [ { "course", "course_name", "details": {...}, "base_time" } ]
  }
}
```

**Lỗi:**
- `401`: Sai mật khẩu → hiển thị thông báo lỗi
- `400`: Thiếu thông tin
- Nếu 1 trong 2 API lỗi → hiển thị lỗi, không lưu gì cả

**Đăng xuất:**
- Xóa cả 2 key `schedule_secret` và `virtual_calendar_secret` khỏi SharedPreferences
- Xóa `saved_classes`, `virtualScoresTable`, `virtualScoresSnapshot`
- Quay về LoginActivity

**Kiểm tra đã đăng nhập (khi mở app):**
```kotlin
fun isLoggedIn(): Boolean {
    return prefs.getString("schedule_secret", null) != null
}
// Nếu đã đăng nhập → vào HomeActivity, nếu chưa → LoginActivity
```

---

### 3.3 ScheduleActivity — Lịch học

**Hiển thị:**
- Calendar view (tháng/tuần/ngày) — dùng thư viện như `CalendarView` hoặc `FSCalendar` port
- Mỗi sự kiện hiển thị: tên môn, phòng học, giờ bắt đầu/kết thúc
- Màu sắc mỗi môn học khác nhau (hash từ tên môn)
- Click vào sự kiện → Dialog chi tiết: tên môn, mã môn, giảng viên, phòng, giờ

**Mapping tiết học → giờ:**
| Tiết | Giờ bắt đầu | Giờ kết thúc |
|---|---|---|
| 1,2,3 | 07:00 | 09:25 |
| 4,5,6 | 09:35 | 12:00 |
| 7,8,9 | 12:30 | 14:55 |
| 10,11,12 | 15:05 | 17:30 |
| 13,14,15,16 | 18:00 | 20:30 |

**Dữ liệu:** Đọc từ SharedPreferences `schedule_secret` (đã lưu khi login).

**Tính năng thêm:**
- Xuất file ICS (để import vào Google Calendar)
- Tùy chỉnh màu từng môn học
- Nút đăng xuất (xóa `schedule_secret`, về màn hình Login)

---

### 3.4 ScoresActivity — Tra cứu & Quản lý điểm

**Phần 1 — Tra cứu điểm:**
- Input: Mã sinh viên
- Nút: Tra cứu
- Lịch sử tìm kiếm (tối đa 10 mục, lưu SharedPreferences)
- Hiển thị bảng điểm: tên môn, số tín chỉ, TP1, TP2, điểm thi, điểm HP, điểm chữ
- Thống kê: CPA tổng, số tín chỉ tích lũy, số môn trượt

**API:** `GET /api/v1/scores/users/{studentCode}` (không cần mã hóa)

**Response:**
```json
{
  "studentDTO": { "studentCode", "studentName", "studentClass" },
  "scoreDTOS": [ { "scoreText", "scoreFirst", "scoreSecond", "scoreFinal", "scoreOverall", "subjectName", "subjectCredit" } ]
}
```

**Quy tắc tính điểm:**
- Công thức điểm HP: `(TP1*0.7 + TP2*0.3)*0.3 + CK*0.7`
- Trượt khi: điểm thi < 2 HOẶC điểm HP < 4
- Không tính GPA: môn Giáo dục thể chất, Thực hành vật lý

**Bảng quy đổi điểm (10 → 4 → chữ):**
| Phân loại | Thang 10 | Thang 4 | Chữ |
|---|---|---|---|
| Xuất sắc | 9.0 - 10.0 | 4.0 | A+ |
| Giỏi | 8.5 - 8.9 | 3.8 | A |
| Khá | 7.8 - 8.4 | 3.5 | B+ |
| Khá | 7.0 - 7.7 | 3.0 | B |
| Trung bình | 6.3 - 6.9 | 2.4 | C+ |
| Trung bình | 5.5 - 6.2 | 2.0 | C |
| Trung bình yếu | 4.8 - 5.4 | 1.5 | D+ |
| Trung bình yếu | 4.0 - 4.7 | 1.0 | D |
| Kém | 0.0 - 3.9 | 0.0 | F |

---

**Phần 2 — Bảng điểm ảo (chỉ dành cho sinh viên đã đăng nhập lịch học):**

> Yêu cầu: `schedule_secret` phải tồn tại và mã sinh viên đang tra cứu phải trùng với mã sinh viên đã đăng nhập.

**Tính năng:**
- Tạo bảng điểm ảo từ dữ liệu tra cứu
- Chỉnh sửa từng ô: tên môn, số tín chỉ, TP1, TP2, điểm thi (điểm HP tự tính)
- Chọn/bỏ chọn môn học (checkbox) để tính CPA
- Thêm môn học mới
- Xóa môn học
- Lưu lên server (POST encrypted)
- Tải từ server (POST encrypted)
- Khôi phục từ server (POST encrypted)
- Cảnh báo thay đổi chưa lưu khi thoát

**API bảng điểm ảo:**
- Lưu: `POST /api/v1/score-batch/create-or-update` (body encrypted)
- Tải: `POST /api/v1/score-batch/get-by-encrypted` (body encrypted)
- Khôi phục: `POST /api/v1/scores/restore` (body encrypted)

**Lưu trữ local:** SharedPreferences key `virtualScoresTable`

---

**Phần 3 — Import điểm từ Khảo Thí:**
- Dialog 2 bước:
  - Bước 1: Paste dữ liệu dạng tab-separated từ trang Khảo Thí
  - Bước 2: Preview bảng, highlight môn trùng (màu vàng), chọn môn muốn thêm
- Hỗ trợ 2 format cột (có/không có cột "Lựa chọn")

---

**Phần 4 — CPA Calculator (Dialog):**

**Dialog 1 — CPA Calculator cơ bản (từ điểm tra cứu):**
- Input: Tổng tín chỉ chương trình, CPA mục tiêu
- Output: GPA cần đạt cho các môn còn lại, số tín chỉ còn lại

**Dialog 2 — Virtual CPA Calculator (từ bảng điểm ảo):**
- Input: Tổng tín chỉ chương trình, CPA mục tiêu
- Output:
  - GPA cần đạt
  - Đề xuất "Hardcore" (cần bao nhiêu môn A+)
  - Đề xuất "Chill" (cần bao nhiêu môn B+)
  - Phân bổ thông minh theo khả năng học tập (slider D → A+)
  - Tính cho môn 2 tín, 3 tín, 4 tín (có thể chọn)

**Thông tin chương trình học (tổng tín chỉ):**
| Mã | Ngành | Tổng tín chỉ |
|---|---|---|
| CT | Công nghệ thông tin | 176 |
| AT | An toàn thông tin | 153 |
| DT | Điện tử viễn thông | 169 |

---

### 3.5 ScholarshipActivity — Học bổng

**Tính năng:**
- Dropdown chọn khóa học (CT05-CT09, AT17-AT21, DT04-DT08)
- Hiển thị bảng xếp hạng: STT, MSSV, Họ tên, Lớp, Xếp hạng, GPA 4.0, GPA 10.0
- Top 5: nền vàng; Top 6-10: nền xanh nhạt
- Xuất Excel
- Hiệu ứng pháo hoa (confetti) khi tải dữ liệu thành công
- Toggle bật/tắt pháo hoa + dark mode

**API:** `POST /api/v1/semester/filter/scholarship` (body encrypted)
```json
// Request
{ "code": "CT07" }

// Response: mảng ScholarshipStudent
[{ "studentCode", "studentName", "studentClass", "ranking", "gpa", "asiaGpa" }]
```

---

### 3.6 VirtualCalendarActivity — Đăng ký học phần ảo

**Yêu cầu:** `virtual_calendar_secret` phải tồn tại trong SharedPreferences (đã được lưu khi đăng nhập). Nếu không có → redirect về LoginActivity.

**Luồng chọn lớp (3 cấp filter):**
1. Chọn **Khối học phần** (course block, VD: "2024-2025")
2. Chọn **Môn học** (lọc theo khối)
3. Chọn **Lớp học** (lọc theo môn)

**Tính năng:**
- Hiển thị danh sách lớp đã chọn
- Phát hiện trùng lịch: cảnh báo khi 2 lớp cùng ngày, cùng giờ
- Calendar preview (FullCalendar) hiển thị lịch các lớp đã chọn
- Lưu danh sách lớp vào SharedPreferences `saved_classes`
- Xóa tất cả lựa chọn
- Xuất file TXT (danh sách tên lớp)
- Nhập từ file TXT
- Xuất file ICS
- Đăng xuất

**API:** `POST /api/v1/auth/virtual-calendar` (body encrypted)
```json
// Response
{
  "code": "200",
  "data": {
    "student_info": { ... },
    "virtual_calendar": [
      {
        "course": "2024-2025",
        "course_name": "Lập trình Java (3 TC)",
        "details": {
          "study_days": "14/04/2026 21/04/2026",
          "teacher": "Nguyễn Văn B",
          "course_code": "INT1234",
          "course_name": "LT Java-1-25 (C702)",
          "study_location": "P.101",
          "lessons": "1,2,3 1,2,3"
        },
        "base_time": "Từ 14/04/2026 đến 30/06/2026: Thứ 2 tiết 1,2,3"
      }
    ]
  }
}
```

---

### 3.7 AboutActivity — Thông tin chương trình học

Hiển thị thông tin 3 ngành, mỗi ngành có tab: Tổng quan, Mục tiêu, Chương trình học (từng kỳ).

---

#### Ngành CT — Công nghệ thông tin
- Mã ngành: `7.48.01.01` | Mã chương trình: `KMC.1.1.1`
- Bằng: Cử nhân và Kỹ sư | Thời gian: 4 hoặc 5 năm | Tổng tín chỉ: **176**
- Chuyên ngành: Kỹ thuật phần mềm nhúng và phần mềm di động
- Tổ hợp xét tuyển: A00, A01, D90

**Chương trình học theo kỳ:**

| Học kỳ | Môn học | Tín chỉ |
|---|---|---|
| HK1 | Giải tích 1 | 3 |
| HK1 | Đại số tuyến tính | 3 |
| HK1 | Tin học đại cương | 2 |
| HK1 | Triết học Mác – Lê nin | 3 |
| HK1 | Giáo dục quốc phòng an ninh | 8 |
| HK1 | Giáo dục thể chất 1 | 1 |
| HK2 | Vật lý đại cương 1 | 3 |
| HK2 | Giải tích 2 | 3 |
| HK2 | Lập trình căn bản | 3 |
| HK2 | Kinh tế chính trị Mác – Lênin | 2 |
| HK2 | Môn tự chọn *(tự chọn)* | 2 |
| HK2 | Lịch sử Đảng Cộng sản Việt Nam | 2 |
| HK2 | Giáo dục thể chất 2 | 1 |
| HK2 | Kỹ năng mềm | 2 |
| HK3 | Vật lý đại cương 2 | 3 |
| HK3 | Thực hành vật lý đại cương 1 & 2 | 2 |
| HK3 | Tiếng Anh 1 | 3 |
| HK3 | Xác suất thống kê | 2 |
| HK3 | Phương pháp tính | 2 |
| HK3 | Mạng máy tính | 3 |
| HK3 | Tư tưởng Hồ Chí Minh | 2 |
| HK3 | Giáo dục thể chất 3 | 1 |
| HK4 | Tiếng Anh 2 | 3 |
| HK4 | Toán rời rạc | 2 |
| HK4 | Quản trị mạng máy tính | 2 |
| HK4 | Otomat và ngôn ngữ hình thức | 2 |
| HK4 | Chương trình dịch | 2 |
| HK4 | Lý thuyết cơ sở dữ liệu | 2 |
| HK4 | Điện tử tương tự và điện tử số | 3 |
| HK4 | Giáo dục thể chất 4 | 1 |
| HK4 | Chủ Nghĩa xã hội Khoa học | 2 |
| HK5 | Tiếng Anh 3 | 4 |
| HK5 | Lập trình hướng đối tượng | 2 |
| HK5 | Phát triển phần mềm ứng dụng | 2 |
| HK5 | Cấu trúc dữ liệu và giải thuật | 2 |
| HK5 | Lý thuyết độ phức tạp tính toán | 2 |
| HK5 | Hệ quản trị cơ sở dữ liệu | 2 |
| HK5 | Kỹ thuật vi xử lý | 2 |
| HK5 | Cơ sở lý thuyết truyền tin | 2 |
| HK5 | Giáo dục thể chất 5 | 1 |
| HK6 | Tiếng Anh chuyên ngành | 4 |
| HK6 | Kiến trúc máy tính | 2 |
| HK6 | Nguyên lý hệ điều hành | 2 |
| HK6 | Phát triển ứng dụng web | 2 |
| HK6 | Công nghệ phần mềm | 2 |
| HK6 | Phân tích, thiết kế hệ thống thông tin | 2 |
| HK6 | Xử lý tín hiệu số | 2 |
| HK6 | Kỹ thuật truyền số liệu | 2 |
| HK6 | Hệ thống viễn thông | 2 |
| HK6 | Hệ thống thông tin di động | 2 |
| HK7 | Thiết kế hệ thống nhúng | 3 |
| HK7 | Công nghệ phần mềm nhúng | 2 |
| HK7 | Hệ điều hành nhúng thời gian thực | 3 |
| HK7 | Kiểm thử phần mềm nhúng | 2 |
| HK7 | Cơ sở an toàn và bảo mật thông tin | 3 |
| HK7 | Linux và phần mềm nguồn mở | 2 |
| HK7 | Lập trình hợp ngữ | 3 |
| HK7 | Quản trị dự án phần mềm | 2 |
| HK7 | Thực tập cơ sở chuyên ngành | 3 |
| HK8 | Lập trình nhân Linux | 4 |
| HK8 | Lập trình driver | 4 |
| HK8 | Lập trình ARM cơ bản | 3 |
| HK8 | Lập trình hệ thống nhúng Linux | 3 |
| HK8 | Lập trình Android cơ bản | 3 |
| HK8 | Phát triển phần mềm trong thẻ thông minh | 3 |
| HK9 | Lập trình ARM nâng cao | 3 |
| HK9 | Thị giác máy tính trên nền nhúng | 3 |
| HK9 | An toàn và bảo mật trong hệ thống nhúng | 3 |
| HK9 | Tối ưu phần mềm nhúng | 3 |
| HK9 | Lập trình Android nâng cao | 3 |
| HK9 | Phát triển game trên Android | 3 |
| HK9 | An toàn và bảo mật trong phát triển phần mềm di động | 3 |
| HK9 | Tối ưu phần mềm di động | 3 |
| HK10 | Thực tập tốt nghiệp | 3 |
| HK10 | Đồ án tốt nghiệp | 8 |

---

#### Ngành AT — An toàn thông tin
- Mã ngành: `7.48.02.02` | Mã chương trình: `KM.A.2`
- Bằng: Cử nhân và Kỹ sư | Thời gian: 4 hoặc 4,5 năm | Tổng tín chỉ: **153**
- Tổ hợp xét tuyển: A00, A01, D90

**Chuyên ngành:**
1. `KM.A.2.1` — An toàn hệ thống thông tin: thiết kế/triển khai giải pháp ATTT, tư vấn, vận hành, xử lý sự cố
2. `KM.A.2.2.1` — Kỹ nghệ an toàn mạng: phân tích mã độc, giám sát, khai thác lỗ hổng, kiểm định ATTT, tấn công/phòng thủ mạng
3. `KM.A.2.3.1` — Công nghệ phần mềm an toàn: xây dựng/quản lý/kiểm thử phần mềm an toàn

**Chương trình học theo kỳ:**

| Học kỳ | Môn học | Tín chỉ |
|---|---|---|
| HK1 | Giáo dục quốc phòng an ninh | 8 |
| HK1 | Tin học đại cương | 2 |
| HK1 | Triết học Mác – Lênin | 3 |
| HK1 | Giải tích 1 | 3 |
| HK1 | Đại số tuyến tính | 3 |
| HK1 | Giáo dục thể chất 1 | 1 |
| HK1 | Pháp luật đại cương | 2 |
| HK2 | Giải tích 2 | 3 |
| HK2 | Vật lý đại cương 1 | 3 |
| HK2 | Kinh tế chính trị Mác – Lênin | 2 |
| HK2 | Chủ Nghĩa xã hội Khoa học | 2 |
| HK2 | Giáo dục thể chất 2 | 1 |
| HK2 | Tư tưởng Hồ Chí Minh | 2 |
| HK2 | Lập trình căn bản | 3 |
| HK2 | Pháp luật VN đại cương | 2 |
| HK2 | Kỹ năng mềm | 2 |
| HK3 | Vật lý đại cương 2 | 3 |
| HK3 | Toán xác suất thống kê | 2 |
| HK3 | Toán chuyên đề | 3 |
| HK3 | Tiếng Anh 1 | 3 |
| HK3 | Cấu trúc dữ liệu và giải thuật | 2 |
| HK3 | Mạng máy tính | 3 |
| HK3 | Toán rời rạc | 2 |
| HK3 | Phương pháp tính | 2 |
| HK3 | Giáo dục thể chất 3 | 1 |
| HK3 | Lịch sử Đảng Cộng sản Việt Nam | 2 |
| HK4 | Tiếng Anh 2 | 3 |
| HK4 | Kỹ thuật truyền số liệu | 2 |
| HK4 | Cơ sở lý thuyết truyền tin | 2 |
| HK4 | Lý thuyết cơ sở dữ liệu | 2 |
| HK4 | Hệ quản trị cơ sở dữ liệu | 2 |
| HK4 | Quản trị mạng máy tính | 2 |
| HK4 | Kiến trúc máy tính và hợp ngữ | 3 |
| HK5 | Tiếng Anh 3 | 4 |
| HK5 | Lập trình hướng đối tượng | 2 |
| HK5 | Phân tích, thiết kế hệ thống thông tin | 2 |
| HK5 | Nguyên lý hệ điều hành | 2 |
| HK5 | Linux và phần mềm nguồn mở | 2 |
| HK5 | Thuật toán trong an toàn thông tin | 2 |
| HK5 | Nhập môn mật mã học | 3 |
| HK6 | Tiếng Anh chuyên ngành | 4 |
| HK6 | Chuyên đề cơ sở | 2 |
| HK6 | Cơ sở an toàn thông tin | 3 |
| HK6 | An toàn mạng máy tính | 3 |
| HK6 | Kỹ thuật lập trình | 2 |
| HK6 | An toàn cơ sở dữ liệu | 2 |
| HK6 | Giao thức an toàn mạng | 2 |
| HK7 | Công nghệ web an toàn | 3 |
| HK7 | Quản trị an toàn hệ thống | 3 |
| HK7 | An toàn mạng không dây và di động | 2 |
| HK7 | Phân tích thiết kế an toàn mạng máy tính | 2 |
| HK7 | Mã độc | 3 |
| HK7 | Chuyên đề An toàn hệ thống thông tin | 2 |
| HK8 | Giám sát và ứng phó sự cố an toàn mạng | 2 |
| HK8 | Kiểm thử và đánh giá an toàn hệ thống thông tin | 3 |
| HK8 | Quản lý an toàn thông tin | 2 |
| HK8 | Điều tra số | 3 |
| HK8 | Học phần chuyên ngành tự chọn 1 *(tự chọn)* | 2 |
| HK8 | Học phần chuyên ngành tự chọn 2 *(tự chọn)* | 2 |
| HK8 | Học phần chuyên ngành tự chọn 3 *(tự chọn)* | 2 |
| HK9 | Thực tập tốt nghiệp | 3 |
| HK9 | Đồ án tốt nghiệp | 8 |

---

#### Ngành DT — Điện tử viễn thông
- Mã ngành: `7.52.02.07` | Mã chương trình: `KM.D.2.1`
- Bằng: Cử nhân và Kỹ sư | Thời gian: 4 hoặc 4,5 năm | Tổng tín chỉ: **169**
- Chuyên ngành: Hệ thống nhúng và điều khiển tự động
- Tổ hợp xét tuyển: A00, A01, D90

**Cơ hội nghề nghiệp:**
- Giảng dạy tại các trường ĐH, CĐ, THCN
- Nghiên cứu khoa học tại viện nghiên cứu, trung tâm R&D
- Thiết kế/bảo trì hệ thống điện tử công nghiệp và dân dụng
- Thiết kế hệ thống nhúng, điều khiển công nghiệp, vi mạch
- Làm việc tại các đơn vị Cơ yếu về sản phẩm mật mã chuyên dụng

**Chương trình học theo kỳ:**

| Học kỳ | Môn học | Tín chỉ |
|---|---|---|
| HK1 | Giáo dục quốc phòng an ninh | 8 |
| HK1 | Triết học Mác – Lênin | 3 |
| HK1 | Toán cao cấp 1 | 4 |
| HK1 | Vật lý đại cương 1 | 3 |
| HK1 | Tin học đại cương | 2 |
| HK1 | Giáo dục thể chất 1 | 1 |
| HK2 | Toán cao cấp 2 | 3 |
| HK2 | Vật lý đại cương 2 | 3 |
| HK2 | Lập trình căn bản | 3 |
| HK2 | Kinh tế chính trị Mác – Lênin | 2 |
| HK2 | Lịch sử Đảng Cộng sản Việt Nam | 2 |
| HK2 | Môn tự chọn *(tự chọn)* | 2 |
| HK2 | Giáo dục thể chất 2 | 1 |
| HK2 | Chủ Nghĩa xã hội Khoa học | 2 |
| HK3 | Toán cao cấp 3 | 3 |
| HK3 | Xác suất thống kê | 3 |
| HK3 | Thực hành vật lý đại cương 1&2 | 2 |
| HK3 | Tiếng Anh 1 | 3 |
| HK3 | Tư tưởng Hồ Chí Minh | 2 |
| HK3 | Công nghệ mạng máy tính | 2 |
| HK3 | Kỹ thuật lập trình | 2 |
| HK3 | Giáo dục thể chất 3 | 1 |
| HK3 | Kỹ năng mềm | 2 |
| HK4 | Tiếng Anh 2 | 3 |
| HK4 | Toán rời rạc | 2 |
| HK4 | Tín hiệu và hệ thống | 2 |
| HK4 | Kỹ thuật điện | 2 |
| HK4 | Linh kiện điện tử | 3 |
| HK4 | Lý thuyết mạch | 2 |
| HK4 | Điện tử công suất | 2 |
| HK4 | Điện tử tương tự | 3 |
| HK4 | Giáo dục thể chất 4 | 1 |
| HK5 | Tiếng Anh 3 | 3 |
| HK5 | Thông tin số | 2 |
| HK5 | Kỹ thuật đo lường điện tử | 3 |
| HK5 | Kỹ thuật vi xử lý | 2 |
| HK5 | Điện tử tương số | 3 |
| HK5 | Thiết kế mạch điện tử sử dụng máy tính | 2 |
| HK5 | Thực tập cơ sở 1 | 2 |
| HK5 | Cơ sở điều khiển tự động | 2 |
| HK5 | Giáo dục thể chất 5 | 1 |
| HK6 | Tiếng Anh chuyên ngành | 3 |
| HK6 | Cơ sở lý thuyết truyền tin | 2 |
| HK6 | Kỹ thuật truyền số liệu | 2 |
| HK6 | Hệ thống viễn thông | 2 |
| HK6 | Lựa chọn cơ sở ngành *(tự chọn)* | 2 |
| HK6 | Thiết kế hệ thống số | 3 |
| HK6 | Kiến trúc máy tính | 2 |
| HK6 | Điện tử công nghiệp | 2 |
| HK6 | Đồ án 1 | 2 |
| HK7 | Thiết bị ngoại vi và kỹ thuật ghép nối | 2 |
| HK7 | Xử lý tín hiệu số | 3 |
| HK7 | Hệ điều hành nhúng thời gian thực | 3 |
| HK7 | Mật mã lý thuyết | 2 |
| HK7 | Hệ thống nhúng | 3 |
| HK7 | Cơ sở thiết kế VLSI | 3 |
| HK7 | Thực tập cơ sở 2 | 2 |
| HK7 | Đồ án 2 | 2 |
| HK8 | Thiết kế hệ thống nhúng | 3 |
| HK8 | Phát triển ứng dụng IoT | 3 |
| HK8 | Thiết kế PLC | 3 |
| HK8 | Lựa chọn 1 *(tự chọn)* | 3 |
| HK8 | Lựa chọn 2 *(tự chọn)* | 3 |
| HK8 | Thực tập cơ sở 3 | 2 |
| HK8 | Đồ án 3 | 2 |
| HK9 | Thực tập tốt nghiệp | 3 |
| HK9 | Đồ án tốt nghiệp | 8 |

---

### 3.8 FeedbackActivity — Phản hồi

Form gửi phản hồi qua EmailJS (hoặc API tương đương).

---

### 3.9 QAActivity — Hỏi đáp

Danh sách câu hỏi thường gặp dạng accordion (expand/collapse).

---

### 3.10 DonateActivity — Ủng hộ

Hiển thị thông tin tài khoản ngân hàng, QR code.

---

## 4. Bảo mật — Mã hóa RSA + AES Hybrid

> Lưu ý quan trọng: Đây là mã hóa **hybrid** — KHÔNG phải chỉ AES đơn thuần. Dữ liệu được mã hóa bằng AES-256-CBC, nhưng AES key lại được mã hóa thêm bằng RSA public key trước khi gửi. Server dùng RSA private key để giải mã AES key, rồi dùng AES key đó để giải mã dữ liệu thực.

**Tất cả POST request** (trừ `/encryption/public-key`) phải được mã hóa theo quy trình:

### Bước 1: Lấy RSA Public Key
```
GET /api/v1/encryption/public-key
Response: chuỗi PEM public key (plain text)
```
Cache lại trong memory (hoặc SharedPreferences), không cần gọi lại mỗi request.

### Bước 2: Mã hóa dữ liệu (mỗi request)
```
1. Sinh ngẫu nhiên AES key 256-bit (32 bytes)
2. Sinh ngẫu nhiên IV 128-bit (16 bytes)
3. Serialize body thành JSON string
4. Mã hóa JSON string bằng AES-256-CBC (key + IV ở trên) → encryptedData (Base64)
5. Mã hóa AES key bằng RSA public key PKCS1 v1.5 → encryptedKey (Base64)
6. Encode IV thành hex string → iv
```

### Bước 3: Gửi payload
```json
{
  "encryptedKey": "<RSA-encrypted AES key, Base64>",
  "encryptedData": "<AES-CBC encrypted JSON, Base64>",
  "iv": "<IV hex string>"
}
```

### Header bắt buộc:
```
Content-Type: application/json
X-Encrypted: true
```

### Ví dụ Kotlin (Android):
```kotlin
fun encryptPayload(data: Any, publicKeyPem: String): EncryptedPayload {
    // 1. Parse RSA public key
    val keyBytes = Base64.decode(
        publicKeyPem.replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replace("\n", ""),
        Base64.DEFAULT
    )
    val rsaKey = KeyFactory.getInstance("RSA")
        .generatePublic(X509EncodedKeySpec(keyBytes))

    // 2. Sinh AES key + IV
    val aesKey = ByteArray(32).also { SecureRandom().nextBytes(it) }
    val iv = ByteArray(16).also { SecureRandom().nextBytes(it) }

    // 3. Mã hóa data bằng AES-256-CBC
    val aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
    aesCipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(aesKey, "AES"), IvParameterSpec(iv))
    val encryptedData = Base64.encodeToString(
        aesCipher.doFinal(Gson().toJson(data).toByteArray()), Base64.DEFAULT
    )

    // 4. Mã hóa AES key bằng RSA
    val rsaCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
    rsaCipher.init(Cipher.ENCRYPT_MODE, rsaKey)
    val encryptedKey = Base64.encodeToString(rsaCipher.doFinal(aesKey), Base64.DEFAULT)

    // 5. IV → hex
    val ivHex = iv.joinToString("") { "%02x".format(it) }

    return EncryptedPayload(encryptedKey, encryptedData, ivHex)
}
```

### Thư viện Android cần:
- AES + RSA: `javax.crypto.Cipher` (built-in, không cần thêm dependency)
- Base64: `android.util.Base64`
- SecureRandom: `java.security.SecureRandom`

---

## 5. Data Models

### StudentInfo
```kotlin
data class StudentInfo(
    val display_name: String,
    val student_code: String,
    val gender: String,
    val birthday: String,
    val birth_place: String,   // masked
    val id_card: String,       // masked
    val bank_account: String,  // masked
    val enroll_semester: String, // masked
    val phone: String,         // masked
    val email: String          // masked
)
```

### CourseSchedule
```kotlin
data class CourseSchedule(
    val course_name: String,
    val course_code: String,
    val study_days: String,   // "14/04/2026 21/04/2026"
    val lessons: String,      // "1,2,3 1,2,3"
    val study_location: String,
    val teacher: String
)
```

### ScoreDTO
```kotlin
data class ScoreDTO(
    val scoreText: String,
    val scoreFirst: Double,
    val scoreSecond: Double,
    val scoreFinal: Double,
    val scoreOverall: Double,
    val subjectName: String,
    val subjectCredit: Int
)
```

### VirtualScore
```kotlin
data class VirtualScore(
    val scoreText: String,
    val scoreFirst: Double,
    val scoreSecond: Double,
    val scoreFinal: Double,
    val scoreOverall: Double,
    val subjectName: String,
    val subjectCredit: Int,
    val isSelected: Boolean
)
```

### ScoreBatchRequest
```kotlin
data class ScoreBatchRequest(
    val studentInfo: StudentBasicInfo,
    val scores: List<VirtualScore>,
    val lastUpdated: String  // ISO 8601
)
```

### ScholarshipStudent
```kotlin
data class ScholarshipStudent(
    val studentCode: String,
    val studentName: String,
    val studentClass: String,
    val ranking: Int,
    val gpa: Double,      // thang 4.0
    val asiaGpa: Double   // thang 10.0
)
```

### VirtualCalendarItem
```kotlin
data class VirtualCalendarItem(
    val course: String,
    val course_name: String,
    val details: CourseDetails,
    val base_time: String
)

data class CourseDetails(
    val study_days: String,
    val teacher: String,
    val course_code: String,
    val course_name: String,
    val study_location: String,
    val lessons: String
)
```

### EncryptedPayload
```kotlin
data class EncryptedPayload(
    val encryptedKey: String,
    val encryptedData: String,
    val iv: String
)
```

---

## 6. Local Storage (SharedPreferences)

> Trên web, `schedule_secret` và `virtual_calendar_secret` được lưu riêng lẻ sau 2 lần đăng nhập khác nhau. Trên mobile, **cả 2 được lưu cùng lúc** ngay sau khi đăng nhập 1 lần duy nhất.

| Key | Nội dung | Ghi vào lúc | Đọc ở đâu |
|---|---|---|---|
| `schedule_secret` | JSON response từ `/auth/login` | Đăng nhập | ScheduleActivity, ScoresActivity |
| `virtual_calendar_secret` | JSON response từ `/auth/virtual-calendar` | Đăng nhập (song song) | VirtualCalendarActivity |
| `virtualScoresTable` | JSON bảng điểm ảo | ScoresActivity | ScoresActivity |
| `virtualScoresSnapshot` | Snapshot điểm gốc để restore | ScoresActivity | ScoresActivity |
| `schedule_course_colors` | Map màu sắc từng môn | ScheduleActivity | ScheduleActivity |
| `saved_classes` | Danh sách lớp đã chọn | VirtualCalendarActivity | VirtualCalendarActivity |
| `scores_search_history` | Lịch sử tra cứu điểm (max 10) | ScoresActivity | ScoresActivity |
| `rsa_public_key` | RSA public key đã cache | Lần đầu gọi API | Mọi nơi cần mã hóa |

**Xóa khi đăng xuất:** `schedule_secret`, `virtual_calendar_secret`, `saved_classes`, `virtualScoresTable`, `virtualScoresSnapshot`

**Giữ lại khi đăng xuất:** `scores_search_history`, `schedule_course_colors`, `rsa_public_key`

---

## 7. Dialogs / Bottom Sheets

| Dialog | Trigger | Nội dung |
|---|---|---|
| EventDialog | Click sự kiện trên calendar | Tên môn, mã, giảng viên, phòng, giờ |
| GradeConversionDialog | Nút "Bảng quy đổi" | Bảng 9 hàng thang điểm |
| CPACalculatorDialog | Nút "Tính CPA" (điểm thật) | Input tổng TC + CPA mục tiêu → GPA cần đạt |
| VirtualCPACalculatorDialog | Nút "Tính CPA" (bảng ảo) | CPA calculator nâng cao với đề xuất học tập |
| ImportScoresDialog | Nút "Import từ Khảo Thí" | 2 bước: paste text → preview & chọn môn |
| UnsavedChangesDialog | Thoát khi có thay đổi chưa lưu | Lưu / Bỏ qua / Hủy |
| ConfirmDialog | Nhiều nơi | Generic: title, message, status, confirm/cancel |

---

## 8. Toast / Snackbar

Hệ thống toast với 4 loại:
- `success` — màu xanh lá
- `error` — màu đỏ
- `warning` — màu vàng
- `info` — màu xanh dương

Tự động ẩn sau thời gian cấu hình (mặc định 3000ms).

---

## 9. Hiệu ứng đặc biệt

### Celebration / Fireworks
- Dùng thư viện confetti (Android: `nl.dionsegijn:konfetti` hoặc tương đương)
- Kích hoạt khi: tải dữ liệu học bổng thành công, xuất Excel học bổng
- Toggle bật/tắt thủ công trên màn hình Scholarship
- Khi bật fireworks → bật dark mode

---

## 10. Navigation & Header

**Header (Toolbar):**
- Logo + tên app "KMA Legend"
- Menu hamburger (mobile) hoặc navigation drawer
- Các mục menu: Trang chủ, Lịch học, Điểm số, Học bổng, Lịch ảo, Giới thiệu, Ủng hộ, Phản hồi, Q&A

**Footer:**
- Thông tin tác giả: "Mr.CodeWalker x Hải Code Dạo"
- Links

---

## 11. Ghi chú kỹ thuật

### Masking dữ liệu nhạy cảm (server trả về đã mask)
- `birth_place`, `id_card`, `bank_account`, `enroll_semester`, `phone`: giữ 2 ký tự đầu, còn lại `*`
- `email`: giữ 2 ký tự đầu phần local, domain giữ nguyên
- `studentName`: mỗi từ giữ ký tự đầu + `*` (VD: `N* V* A*`)
- `subjectName` (trong tra cứu điểm): giữ 3 ký tự đầu, còn lại `*`

### Parse lịch học
- `study_days`: chuỗi ngày cách nhau bởi dấu cách, format `dd/MM/yyyy`
- `lessons`: chuỗi nhóm tiết cách nhau bởi dấu cách, VD: `"1,2,3 4,5,6"`
- Mỗi ngày tương ứng với một nhóm tiết theo thứ tự

### Tính màu sự kiện
```kotlin
fun getColorFromSeed(seed: String): Int {
    var hash = 0
    for (char in seed) {
        hash = char.code + ((hash shl 5) - hash)
    }
    val hue = Math.abs(hash % 360).toFloat()
    return Color.HSVToColor(floatArrayOf(hue, 0.7f, 0.5f))
}
```

### Kiểm tra trùng lịch
Hai lớp trùng lịch khi: có ngày học chung VÀ cùng giờ bắt đầu.

---

## 12. Thư viện Android gợi ý

| Chức năng | Thư viện |
|---|---|
| HTTP Client | Retrofit2 + OkHttp3 |
| JSON | Gson hoặc Moshi |
| Calendar View | `com.kizitonwose:calendar-view` |
| Excel Export | Apache POI hoặc `com.github.doyaaaaaken:kotlin-csv` |
| Confetti/Fireworks | `nl.dionsegijn:konfetti` |
| ICS Export | Tự implement (RFC 5545) |
| RSA/AES | `javax.crypto` (built-in Android) |
| Image Loading | Glide hoặc Coil |
| Charts/Stats | MPAndroidChart |

---

*Tài liệu này được tạo tự động từ mã nguồn Angular của KMA Legend.*
