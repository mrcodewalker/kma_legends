# API Guide cho Mobile App — KMA Legend

Base URL: `https://kma-legend.click/api/v1`

> Lưu ý bảo mật: Tất cả request POST (trừ `/encryption/public-key`) phải mã hóa body bằng RSA+AES trước khi gửi.
> Xem phần cuối để biết cách mã hóa.

---

## 1. Màn hình Đăng nhập Lịch học (LoginActivity)

### Nút "Đăng nhập"
**API:** `POST /api/v1/auth/login`

**Body (trước khi mã hóa):**
```json
{ "username": "CT070218", "password": "yourpassword" }
```

**Response thành công (200):**
```json
{
  "code": "200",
  "data": {
    "student_info": {
      "display_name": "Nguyễn Văn An",
      "student_code": "CT070218",
      "gender": "Nam",
      "birthday": "01/01/2000",
      "birth_place": "Hà**",
      "id_card": "01**********",
      "bank_account": "12********",
      "enroll_semester": "20**",
      "phone": "09********",
      "email": "ex******@gmail.com"
    },
    "student_schedule": [
      {
        "course_name": "Lập trình Java",
        "course_code": "INT1234",
        "study_days": "14/04/2026 21/04/2026",
        "lessons": "1,2,3 1,2,3",
        "study_location": "P.101",
        "teacher": "Nguyễn Văn B"
      }
    ]
  }
}
```

**Response lỗi:**
- `401`: `{ "code": "401", "message": "Wrong Password" }`
- `400`: `{ "code": "400", "message": "Missing Item" }`

**Sau khi thành công:** Lưu toàn bộ response vào SharedPreferences key `schedule_secret`. Chuyển sang màn hình Lịch học.

---

## 2. Màn hình Lịch học (ScheduleActivity)

Không gọi API. Đọc dữ liệu từ SharedPreferences `schedule_secret` đã lưu lúc đăng nhập.

**Parse lịch học:**
- `study_days`: chuỗi ngày cách nhau bởi dấu cách, format `dd/MM/yyyy`
- `lessons`: chuỗi nhóm tiết cách nhau bởi dấu cách, mỗi nhóm tương ứng với một ngày

**Mapping tiết → giờ:**
| Tiết | Bắt đầu | Kết thúc |
|---|---|---|
| 1,2,3 | 07:00 | 09:25 |
| 4,5,6 | 09:35 | 12:00 |
| 7,8,9 | 12:30 | 14:55 |
| 10,11,12 | 15:05 | 17:30 |
| 13,14,15,16 | 18:00 | 20:30 |

### Nút "Đăng xuất"
Xóa key `schedule_secret` khỏi SharedPreferences. Về màn hình Login.

---

## 3. Màn hình Tra cứu điểm (ScoresActivity)

### Nút "Tra cứu" (tìm điểm theo mã SV)
**API:** `GET /api/v1/scores/users/{studentCode}`

Không cần mã hóa, gọi thẳng.

**Response (200):**
```json
{
  "studentDTO": {
    "studentCode": "CT070218",
    "studentName": "N* V* A*",
    "studentClass": "CT7B"
  },
  "scoreDTOS": [
    {
      "scoreText": "A",
      "scoreFirst": 8.5,
      "scoreSecond": 9.0,
      "scoreFinal": 8.0,
      "scoreOverall": 8.5,
      "subjectName": "Lập***********",
      "subjectCredit": 3
    }
  ]
}
```

**Response lỗi:**
- `404`: Sinh viên chưa có dữ liệu → hiện dialog hướng dẫn đăng nhập lịch học trước

---

### Nút "Mở bảng điểm ảo"
Yêu cầu: `schedule_secret` phải tồn tại VÀ `studentCode` đang tra cứu phải trùng với `student_code` trong `schedule_secret`.

Nếu chưa đăng nhập → hiện dialog yêu cầu đăng nhập lịch học.
Nếu đang xem điểm người khác → hiện dialog cảnh báo.

**API:** `POST /api/v1/score-batch/get-by-encrypted`

**Body (trước khi mã hóa):**
```json
{ "studentCode": "CT070218" }
```

**Response (200):**
```json
{
  "student_info": { ...StudentInfo },
  "score_batch": {
    "batchId": 1,
    "studentCode": "CT070218",
    "studentName": "Nguyễn Văn An",
    "studentClass": "CT7B",
    "lastUpdated": "2026-04-13T10:00:00",
    "scoreItems": [
      {
        "itemId": 1,
        "scoreText": "A",
        "scoreFirst": 8.5,
        "scoreSecond": 9.0,
        "scoreFinal": 8.0,
        "scoreOverall": 8.5,
        "subjectName": "Lập trình Java",
        "subjectCredit": 3,
        "isSelected": true
      }
    ]
  }
}
```

**Response 404:** Chưa có bảng điểm ảo trên server → tạo mới từ dữ liệu tra cứu.

---

### Nút "Lưu bảng điểm ảo lên server"
**API:** `POST /api/v1/score-batch/create-or-update`

**Body (trước khi mã hóa):**
```json
{
  "studentInfo": {
    "studentCode": "CT070218",
    "studentName": "Nguyễn Văn An",
    "studentClass": "CT7B"
  },
  "scores": [
    {
      "scoreText": "A",
      "scoreFirst": 8.5,
      "scoreSecond": 9.0,
      "scoreFinal": 8.0,
      "scoreOverall": 8.5,
      "subjectName": "Lập trình Java",
      "subjectCredit": 3,
      "isSelected": true
    }
  ],
  "lastUpdated": "2026-04-13T10:00:00"
}
```

**Response (200):** Trả về bảng điểm đã lưu (cấu trúc giống score_batch ở trên).

---

### Nút "Khôi phục điểm gốc"
**API:** `POST /api/v1/scores/restore`

**Body (trước khi mã hóa):**
```json
{ "studentCode": "CT070218" }
```

**Response (200):** Cấu trúc giống `GET /scores/users/{studentCode}` — trả về điểm thật không mask để điền lại vào bảng ảo.

---

## 4. Màn hình Học bổng (ScholarshipActivity)

### Dropdown chọn khóa → tự động gọi API
**API:** `POST /api/v1/semester/filter/scholarship`

**Body (trước khi mã hóa):**
```json
{ "code": "CT07" }
```

Các giá trị `code` hợp lệ: `CT05`–`CT09`, `AT17`–`AT21`, `DT04`–`DT08`

**Response (200):** Mảng sinh viên học bổng:
```json
[
  {
    "studentCode": "CT070218",
    "studentName": "Nguyễn Văn An",
    "studentClass": "CT7B",
    "ranking": 1,
    "gpa": 3.85,
    "asiaGpa": 9.2
  }
]
```

---

## 5. Màn hình Đăng nhập Lịch ảo (LoginVirtualCalendarActivity)

### Nút "Đăng nhập"
**API:** `POST /api/v1/auth/virtual-calendar`

**Body (trước khi mã hóa):**
```json
{ "username": "CT070218", "password": "yourpassword" }
```

**Response (200):**
```json
{
  "code": "200",
  "data": {
    "student_info": { ...StudentInfo },
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

**Sau khi thành công:** Lưu response vào SharedPreferences key `virtual_calendar_secret`. Chuyển sang màn hình Lịch ảo.

---

## 6. Màn hình Lịch ảo / Đăng ký học phần (VirtualCalendarActivity)

Không gọi API thêm. Đọc dữ liệu từ SharedPreferences `virtual_calendar_secret`.

### Nút "Lưu lớp đã chọn"
Lưu danh sách lớp vào SharedPreferences key `saved_classes`. Không gọi API.

### Nút "Đăng xuất"
Xóa key `virtual_calendar_secret`. Về màn hình LoginVirtualCalendar.

---

## 7. Lấy RSA Public Key (dùng nội bộ, không gắn vào nút)

**API:** `GET /api/v1/encryption/public-key`

**Response:** Chuỗi PEM public key (plain text).

Gọi 1 lần khi app khởi động, cache lại. Dùng để mã hóa tất cả POST request.

---

## 8. Cơ chế mã hóa request (áp dụng cho mọi POST trừ `/encryption/public-key`)

**Bước 1:** Lấy RSA public key (đã cache).

**Bước 2:** Tạo AES key ngẫu nhiên 256-bit + IV ngẫu nhiên 128-bit.

**Bước 3:** Mã hóa body JSON bằng AES-256-CBC.

**Bước 4:** Mã hóa AES key bằng RSA public key (PKCS1 v1.5).

**Bước 5:** Gửi payload sau (thay thế body gốc):
```json
{
  "encryptedKey": "<RSA encrypted AES key — Base64>",
  "encryptedData": "<AES encrypted body — Base64>",
  "iv": "<IV — hex string>"
}
```

**Header bắt buộc:**
```
Content-Type: application/json
X-Encrypted: true
```

**Thư viện Android:**
- AES + RSA: `javax.crypto.Cipher` (built-in)
- Base64: `android.util.Base64`

---

## Tóm tắt nhanh

| Màn hình | Nút / Trigger | Method | Endpoint |
|---|---|---|---|
| Login lịch học | Đăng nhập | POST | `/auth/login` |
| Lịch học | Đăng xuất | — | Xóa SharedPrefs |
| Tra cứu điểm | Tra cứu | GET | `/scores/users/{code}` |
| Bảng điểm ảo | Mở bảng ảo | POST | `/score-batch/get-by-encrypted` |
| Bảng điểm ảo | Lưu lên server | POST | `/score-batch/create-or-update` |
| Bảng điểm ảo | Khôi phục | POST | `/scores/restore` |
| Học bổng | Chọn khóa | POST | `/semester/filter/scholarship` |
| Login lịch ảo | Đăng nhập | POST | `/auth/virtual-calendar` |
| Lịch ảo | Đăng xuất | — | Xóa SharedPrefs |
| App khởi động | Tự động | GET | `/encryption/public-key` |
