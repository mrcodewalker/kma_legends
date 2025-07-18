import { Component } from '@angular/core';
import { Program, SecurityProgram, ElectronicsProgram, Semester } from '../../models/program.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  selectedProgram: string = 'it';
  activeTab: number = 0;

  // Existing IT Program data
  itProgram: Program = {
    name: 'Chương trình giáo dục đại học hệ Chính quy ngành Công nghệ thông tin',
    code: '7.48.01.01',
    level: 'Đại học',
    degree: 'Cử nhân và Kỹ sư',
    major: 'Công nghệ thông tin',
    majorCode: '7.48.01.01',
    specialization: 'Kỹ thuật phần mềm nhúng và phần mềm di động',
    type: 'Chính quy',
    programCode: 'KMC.1.1.1',
    approach: 'Chương trình được xây dựng theo hướng tiếp cận chuẩn đầu ra CDIO (Conceive – Design – Implement – Operate)',
    objectives: {
      general: [
        'Phẩm chất chính trị, đạo đức nghề nghiệp để đáp ứng yêu cầu hoạt động trong khu vực an ninh, quốc phòng, và kinh tế xã hội',
        'Kiến thức đại cương về khoa học tự nhiên, xã hội và kiến thức cơ sở, nền tảng về điện tử viễn thông và công nghệ thông tin',
        'Khối kiến thức nền tảng về công nghệ phần mềm, đáp ứng được các công việc của kỹ sư phát triển phần mềm',
        'Kiến thức lý thuyết và kỹ năng thực hành về chuyên ngành Kỹ thuật phần mềm nhúng và di động',
        'Kỹ năng xã hội cần thiết, khả năng tự học, tự nghiên cứu để thành công trong cuộc sống và nghề nghiệp',
        'Chương trình đào tạo cho phép khả năng chuyển đổi linh động giữa hai chuyên ngành "An toàn thông tin" và "Kỹ thuật phần mềm nhúng và di động"'
      ],
      specific: {
        political: [
          'MT1: Tuyệt đối trung thành với Tổ quốc, với nhân dân, với mục tiêu lý tưởng và đường lối cách mạng của Đảng',
          'MT2: Có ý thức tổ chức kỷ luật, nghiêm chỉnh chấp hành chủ trương, đường lối của Đảng'
        ],
        knowledge: [
          'MT3: Hiểu biết cơ bản về Chủ nghĩa Mác - Lênin và tư tưởng Hồ Chí Minh',
          'MT4: Nắm được các kiến thức cơ bản về toán học, vật lý học',
          'MT5: Nắm được các kiến thức cơ bản của chuyên ngành Kỹ thuật phần mềm',
          'MT6: Nắm được phương pháp, kỹ thuật phát triển phần mềm trên các hệ thống nhúng',
          'MT7: Nắm được phương pháp, kỹ thuật phát triển phần mềm trên các thiết bị di động',
          'MT8: Có thể giao tiếp, sử dụng tiếng Anh trong công việc',
          'MT9: Có đủ kiến thức để học tiếp lên bậc học cao hơn'
        ],
        professional: [
          'MT10: Kỹ sư phát triển phần mềm thông thường',
          'MT11: Kỹ sư phát triển phần mềm trên thiết bị di động',
          'MT12: Kỹ sư phát triển phần mềm nhúng'
        ],
        social: [
          'MT13: Kỹ năng làm việc nhóm và giao tiếp',
          'MT14: Kỹ năng ngoại ngữ và công nghệ thông tin',
          'MT15: Kỹ năng tư duy sáng tạo và giải quyết vấn đề'
        ]
      }
    },
    duration: '4 hoặc 5 năm',
    credits: 176,
    admissionRequirements: 'Công dân Việt Nam trúng tuyển kỳ thi (hoặc xét tuyển) đại học. Điểm xét tuyển là tổng điểm của một trong ba tổ hợp: A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh), D90 (Toán, KHTN, Anh)',
    graduationConditions: 'Theo qui chế hiện hành của Bộ Giáo dục và Đào tạo và các quy định của Học viện Kỹ thuật mật mã',
    semesters: [
      {
        name: 'Học kỳ 1',
        subjects: [
          { name: 'Giải tích 1', credits: 3 },
          { name: 'Đại số tuyến tính', credits: 3 },
          { name: 'Tin học đại cương', credits: 2 },
          { name: 'Triết học Mác – Lê nin', credits: 3 },
          { name: 'Giáo dục quốc phòng an ninh', credits: 8 },
          { name: 'Giáo dục thể chất 1', credits: 1 }
        ]
      },
      {
        name: 'Học kỳ 2',
        subjects: [
          { name: 'Vật lý đại cương 1', credits: 3 },
          { name: 'Giải tích 2', credits: 3 },
          { name: 'Lập trình căn bản', credits: 3 },
          { name: 'Kinh tế chính trị Mác – Lênin', credits: 2 },
          { name: 'Môn tự chọn', credits: 2, isOptional: true },
          { name: 'Lịch sử Đảng Cộng sản Việt Nam', credits: 2 },
          { name: 'Giáo dục thể chất 2', credits: 1 },
          { name: 'Kỹ năng mềm', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 3',
        subjects: [
          { name: 'Vật lý đại cương 2', credits: 3 },
          { name: 'Thực hành vật lý đại cương 1 & 2', credits: 2 },
          { name: 'Tiếng Anh 1', credits: 3 },
          { name: 'Xác suất thống kê', credits: 2 },
          { name: 'Phương pháp tính', credits: 2 },
          { name: 'Mạng máy tính', credits: 3 },
          { name: 'Tư tưởng Hồ Chí Minh', credits: 2 },
          { name: 'Giáo dục thể chất 3', credits: 1 }
        ]
      },
      {
        name: 'Học kỳ 4',
        subjects: [
          { name: 'Tiếng Anh 2', credits: 3 },
          { name: 'Toán rời rạc', credits: 2 },
          { name: 'Quản trị mạng máy tính', credits: 2 },
          { name: 'Otomat và ngôn ngữ hình thức', credits: 2 },
          { name: 'Chương trình dịch', credits: 2 },
          { name: 'Lý thuyết cơ sở dữ liệu', credits: 2 },
          { name: 'Điện tử tương tự và điện tử số', credits: 3 },
          { name: 'Giáo dục thể chất 4', credits: 1 },
          { name: 'Chủ Nghĩa xã hội Khoa học', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 5',
        subjects: [
          { name: 'Tiếng Anh 3', credits: 4 },
          { name: 'Lập trình hướng đối tượng', credits: 2 },
          { name: 'Phát triển phần mềm ứng dụng', credits: 2 },
          { name: 'Cấu trúc dữ liệu và giải thuật', credits: 2 },
          { name: 'Lý thuyết độ phức tạp tính toán', credits: 2 },
          { name: 'Hệ quản trị cơ sở dữ liệu', credits: 2 },
          { name: 'Kỹ thuật vi xử lý', credits: 2 },
          { name: 'Cơ sở lý thuyết truyền tin', credits: 2 },
          { name: 'Giáo dục thể chất 5', credits: 1 }
        ]
      },
      {
        name: 'Học kỳ 6',
        subjects: [
          { name: 'Tiếng Anh chuyên ngành', credits: 4 },
          { name: 'Kiến trúc máy tính', credits: 2 },
          { name: 'Nguyên lý hệ điều hành', credits: 2 },
          { name: 'Phát triển ứng dụng web', credits: 2 },
          { name: 'Công nghệ phần mềm', credits: 2 },
          { name: 'Phân tích, thiết kế hệ thống thông tin', credits: 2 },
          { name: 'Xử lý tín hiệu số', credits: 2 },
          { name: 'Kỹ thuật truyền số liệu', credits: 2 },
          { name: 'Hệ thống viễn thông', credits: 2 },
          { name: 'Hệ thống thông tin di động', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 7',
        subjects: [
          { name: 'Thiết kế hệ thống nhúng', credits: 3 },
          { name: 'Công nghệ phần mềm nhúng', credits: 2 },
          { name: 'Hệ điều hành nhúng thời gian thực', credits: 3 },
          { name: 'Kiểm thử phần mềm nhúng', credits: 2 },
          { name: 'Cơ sở an toàn và bảo mật thông tin', credits: 3 },
          { name: 'Linux và phần mềm nguồn mở', credits: 2 },
          { name: 'Lập trình hợp ngữ', credits: 3 },
          { name: 'Quản trị dự án phần mềm', credits: 2 },
          { name: 'Thực tập cơ sở chuyên ngành', credits: 3 }
        ]
      },
      {
        name: 'Học kỳ 8',
        subjects: [
          { name: 'Lập trình nhân Linux', credits: 4 },
          { name: 'Lập trình driver', credits: 4 },
          { name: 'Lập trình ARM cơ bản', credits: 3 },
          { name: 'Lập trình hệ thống nhúng Linux', credits: 3 },
          { name: 'Lập trình Android cơ bản', credits: 3 },
          { name: 'Phát triển phần mềm trong thẻ thông minh', credits: 3 }
        ]
      },
      {
        name: 'Học kỳ 9',
        subjects: [
          { name: 'Lập trình ARM nâng cao', credits: 3 },
          { name: 'Thị giác máy tính trên nền nhúng', credits: 3 },
          { name: 'An toàn và bảo mật trong hệ thống nhúng', credits: 3 },
          { name: 'Tối ưu phần mềm nhúng', credits: 3 },
          { name: 'Lập trình Android nâng cao', credits: 3 },
          { name: 'Phát triển game trên Android', credits: 3 },
          { name: 'An toàn và bảo mật trong phát triển phần mềm di động', credits: 3 },
          { name: 'Tối ưu phần mềm di động', credits: 3 }
        ]
      },
      {
        name: 'Học kỳ 10',
        subjects: [
          { name: 'Thực tập tốt nghiệp', credits: 3 },
          { name: 'Đồ án tốt nghiệp', credits: 8 }
        ]
      }
    ]
  };

  // Existing Security Program data
  securityProgram: SecurityProgram = {
    name: 'Chương trình giáo dục đại học hệ Chính quy ngành An toàn thông tin',
    code: '7.48.02.02',
    level: 'Đại học',
    degree: 'Cử nhân và Kỹ sư',
    major: 'An toàn thông tin',
    majorCode: '7.48.02.02',
    specialization: '',
    type: 'Chính quy',
    programCode: 'KM.A.2',
    approach: 'Chương trình được xây dựng theo hướng tiếp cận chuẩn đầu ra CDIO',
    objectives: {
      general: [
        'Kiến thức đại cương phù hợp với khối ngành đào tạo, đảm bảo tính liên thông với các chương trình đào tạo khác của Học viện và của các cơ sở đào tạo khác.',
        'Kiến thức cơ sở ngành An toàn thông tin để người học hiểu được cấu trúc, hoạt động của các hệ thống công nghệ thông tin, nắm bắt được các hiểm họa an toàn đối với các hệ thống công nghệ thông tin, cũng như các phương pháp để phòng chống các hiểm họa đó.',
        'Kiến thức và kỹ năng chuyên sâu để tác nghiệp trong lĩnh vực an toàn thông tin ứng với chuyên ngành được đào tạo.'
      ],
      specific: {
        political: [],
        knowledge: [],
        professional: [],
        social: []
      }
    },
    duration: '4 năm hoặc 4,5 năm',
    credits: 153,
    admissionRequirements: 'Công dân Việt Nam trúng tuyển kỳ thi (hoặc xét tuyển) đại học. Việc xét tuyển căn cứ kết quả thi của kỳ thi THPT quốc gia. Điểm xét tuyển là tổng điểm của một trong ba tổ hợp gồm 03 môn/bài thi: Toán, Vật lý, Hóa học (A00); Toán, Vật lý, Tiếng Anh (A01); Toán, Khoa học tự nhiên, Tiếng Anh (D90).',
    graduationConditions: 'Theo quy chế đào tạo trình độ đại học của Bộ Giáo dục và Đào tạo và các quy định của Học viện Kỹ thuật mật mã',
    specializations: [
      {
        code: 'KM.A.2.1',
        name: 'An toàn hệ thống thông tin',
        description: 'Chương trình đào tạo theo chuyên ngành An toàn hệ thống thông tin trang bị cho người học kiến thức, kỹ năng chuyên sâu để có thể:',
        objectives: [
          'Thiết kế, triển khai giải pháp đảm bảo an toàn cho một hệ thống thông tin',
          'Tư vấn giải pháp an toàn thông tin cho các cơ quan, tổ chức',
          'Vận hành các công cụ phần cứng, phần mềm nhằm đảm bảo an toàn cho hệ thống thông tin',
          'Giải quyết các sự cố an toàn thông tin phát sinh trong quá trình vận hành hệ thống'
        ]
      },
      {
        code: 'KM.A.2.2.1',
        name: 'Kỹ nghệ an toàn mạng',
        description: 'Chương trình đào tạo theo chuyên ngành Kỹ nghệ an toàn mạng trang bị cho người học kiến thức, kỹ năng chuyên sâu để có thể:',
        objectives: [
          'Tác nghiệp, triển khai các nghiệp vụ chuyên sâu liên quan đến an toàn thông tin, an toàn các hệ thống mạng',
          'Phân tích mã độc, giám sát an toàn hệ thống thông tin',
          'Phát hiện và khai thác lỗ hổng phần mềm',
          'Đánh giá và kiểm định an toàn hệ thống thông tin',
          'Thực hiện các tác vụ liên quan đến tấn công và phòng thủ hệ thống mạng'
        ]
      },
      {
        code: 'KM.A.2.3.1',
        name: 'Công nghệ phần mềm an toàn',
        description: 'Chương trình đào tạo theo chuyên ngành Công nghệ phần mềm an toàn trang bị cho người học kiến thức cơ bản và chuyên sâu về:',
        objectives: [
          'Công nghệ phần mềm, công nghệ phần mềm an toàn, giải pháp công nghệ an toàn',
          'Quy trình xây dựng, quản lý và bảo trì phần mềm an toàn',
          'Phân tích, thiết kế và quản lý các dự án phần mềm an toàn/giải pháp công nghệ an toàn',
          'Tổ chức thực hiện và quản lý các công việc trong lĩnh vực công nghệ phần mềm an toàn',
          'Phân tích, kiểm chứng, kiểm thử, đánh giá phần mềm an toàn'
        ]
      }
    ],
    semesters: [
      {
        name: 'Học kỳ 1',
        subjects: [
          { name: 'Giáo dục quốc phòng an ninh', credits: 8 },
          { name: 'Tin học đại cương', credits: 2 },
          { name: 'Triết học Mác –Lênin', credits: 3 },
          { name: 'Giải tích 1', credits: 3 },
          { name: 'Đại số tuyến tính', credits: 3 },
          { name: 'Giáo dục thể chất 1', credits: 1 },
          { name: 'Pháp luật đại cương', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 2',
        subjects: [
          { name: 'Giải tích 2', credits: 3 },
          { name: 'Vật lý đại cương 1', credits: 3 },
          { name: 'Kinh tế chính trị Mác – Lênin', credits: 2 },
          { name: 'Chủ Nghĩa xã hội Khoa học', credits: 2 },
          { name: 'Giáo dục thể chất 2', credits: 1 },
          { name: 'Tư tưởng Hồ Chí Minh', credits: 2 },
          { name: 'Lập trình căn bản', credits: 3 },
          { name: 'Pháp luật VN đại cương', credits: 2 },
          { name: 'Kỹ năng mềm', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 3',
        subjects: [
          { name: 'Vật lý đại cương 2', credits: 3 },
          { name: 'Toán xác suất thống kê', credits: 2 },
          { name: 'Toán chuyên đề', credits: 3 },
          { name: 'Tiếng Anh 1', credits: 3 },
          { name: 'Cấu trúc dữ liệu và giải thuật', credits: 2 },
          { name: 'Mạng máy tính', credits: 3 },
          { name: 'Toán rời rạc', credits: 2 },
          { name: 'Phương pháp tính', credits: 2 },
          { name: 'Giáo dục thể chất 3', credits: 1 },
          { name: 'Lịch sử Đảng Cộng sản Việt Nam', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 4',
        subjects: [
          { name: 'Tiếng Anh 2', credits: 3 },
          { name: 'Kỹ thuật truyền số liệu', credits: 2 },
          { name: 'Cơ sở lý thuyết truyền tin', credits: 2 },
          { name: 'Lý thuyết cơ sở dữ liệu', credits: 2 },
          { name: 'Hệ quản trị cơ sở dữ liệu', credits: 2 },
          { name: 'Quản trị mạng máy tính', credits: 2 },
          { name: 'Kiến trúc máy tính và hợp ngữ', credits: 3 }
        ]
      },
      {
        name: 'Học kỳ 5',
        subjects: [
          { name: 'Tiếng Anh 3', credits: 4 },
          { name: 'Lập trình hướng đối tượng', credits: 2 },
          { name: 'Phân tích, thiết kế hệ thống thông tin', credits: 2 },
          { name: 'Nguyên lý hệ điều hành', credits: 2 },
          { name: 'Linux và phần mềm nguồn mở', credits: 2 },
          { name: 'Thuật toán trong an toàn thông tin', credits: 2 },
          { name: 'Nhập môn mật mã học', credits: 3 }
        ]
      },
      {
        name: 'Học kỳ 6',
        subjects: [
          { name: 'Tiếng Anh chuyên ngành', credits: 4 },
          { name: 'Chuyên đề cơ sở', credits: 2 },
          { name: 'Cơ sở an toàn thông tin', credits: 3 },
          { name: 'An toàn mạng máy tính', credits: 3 },
          { name: 'Kỹ thuật lập trình', credits: 2 },
          { name: 'An toàn cơ sở dữ liệu', credits: 2 },
          { name: 'Giao thức an toàn mạng', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 7',
        subjects: [
          { name: 'Công nghệ web an toàn', credits: 3 },
          { name: 'Quản trị an toàn hệ thống', credits: 3 },
          { name: 'An toàn mạng không dây và di động', credits: 2 },
          { name: 'Phân tích thiết kế an toàn mạng máy tính', credits: 2 },
          { name: 'Mã độc', credits: 3 },
          { name: 'Chuyên đề An toàn hệ thống thông tin', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 8',
        subjects: [
          { name: 'Giám sát và ứng phó sự cố an toàn mạng', credits: 2 },
          { name: 'Kiểm thử và đánh giá an toàn hệ thống thông tin', credits: 3 },
          { name: 'Quản lý an toàn thông tin', credits: 2 },
          { name: 'Điều tra số', credits: 3 },
          { name: 'Học phần chuyên ngành tự chọn 1', credits: 2, isOptional: true },
          { name: 'Học phần chuyên ngành tự chọn 2', credits: 2, isOptional: true },
          { name: 'Học phần chuyên ngành tự chọn 3', credits: 2, isOptional: true }
        ]
      },
      {
        name: 'Học kỳ 9',
        subjects: [
          { name: 'Thực tập tốt nghiệp', credits: 3 },
          { name: 'Đồ án tốt nghiệp', credits: 8 }
        ]
      }
    ]
  };

  electronicsProgram: ElectronicsProgram = {
    name: 'Chương trình giáo dục đại học hệ Chính quy ngành Điện tử viễn thông',
    code: '7.52.02.07',
    level: 'Đại học',
    degree: 'Cử nhân và Kỹ sư',
    major: 'Điện tử viễn thông',
    majorCode: '7.52.02.07',
    specialization: 'Hệ thống nhúng và điều khiển tự động',
    type: 'Chính quy',
    programCode: 'KM.D.2.1',
    approach: 'Chương trình được xây dựng trên cơ sở khung chương trình đào tạo ngành Kỹ thuật điện tử, truyền thông của Bộ Giáo dục và Đào tạo',
    objectives: {
      general: [
        'Phẩm chất chính trị, đạo đức nghề nghiệp để đáp ứng yêu cầu hoạt động trong khu vực kinh tế xã hội và an ninh, quốc phòng.',
        'Kiến thức cơ sở chuyên môn vững chắc để thích ứng tốt với những công việc trong lĩnh vực Kỹ thuật điện tử, truyền thông.',
        'Có năng lực tham gia xây dựng và phát triển hệ thống điện tử, viễn thông, thiết kế chế tạo các sản phẩm điện tử, hệ thống nhúng và hệ thống PLC.',
        'Kỹ năng xã hội cần thiết, khả năng tự học, tự nghiên cứu để thành công trong cuộc sống và nghề nghiệp.',
        'Chương trình đào tạo cho phép khả năng chuyển đổi linh hoạt giữa các chuyên ngành trong ngành Kỹ thuật Điện tử, Truyền thông.'
      ],
      specific: {
        political: [
          'MT1: Tuyệt đối trung thành với Tổ quốc, với mục tiêu lý tưởng và đường lối cách mạng của Đảng cộng sản Việt Nam.',
          'MT2: Có ý thức tổ chức kỷ luật, nghiêm chỉnh chấp hành đường lối chủ trương chính sách của Đảng, pháp luật của Nhà nước.',
          'MT3: Có thế giới quan, nhân sinh quan đúng đắn và có khả năng nhận thức đánh giá các hiện tượng một cách logic và tích cực.'
        ],
        knowledge: [
          'MT4: Hiểu biết về các nguyên lý cơ bản của chủ nghĩa Mác - Lênin, Đường lối cách mạng của Đảng Cộng sản Việt Nam, Tư tưởng Hồ Chí Minh.',
          'MT5: Có khả năng áp dụng kiến thức cơ sở toán học, vật lý để tính toán, mô phỏng các hệ thống Điện tử, Truyền thông.',
          'MT6: Tiếng Anh đạt trình độ tương đương Toeic 400.',
          'MT7: Khả năng áp dụng kiến thức cốt lõi ngành.',
          'MT8: Khả năng thiết kế, phát triển các hệ thống nhúng.',
          'MT9: Phát triển hệ thống điều khiển PLC, mạng truyền thông công nghiệp.',
          'MT10: Có kiến thức nền tảng về các hệ thống mạch vi điện tử mật độ tích hợp rất cao (VLSI).'
        ],
        professional: [
          'MT11: Lập luận phân tích và giải quyết vấn đề kỹ thuật.',
          'MT12: Khả năng lập kế hoạch và tổ chức công việc.',
          'MT13: Khả năng nghiên cứu, thử nghiệm và khám phá tri thức.',
          'MT14: Tính năng động, sáng tạo và kỷ luật.',
          'MT15: Đạo đức và trách nhiệm nghề nghiệp.',
          'MT16: Hiểu biết các vấn đề đương đại và ý thức học suốt đời.'
        ],
        social: [
          'MT17: Kỹ năng làm việc nhóm.',
          'MT18: Kỹ năng giao tiếp thông qua việc tạo lập văn bản, thuyết trình, thảo luận, đàm phán, làm chủ tình huống.',
          'MT19: Kỹ năng sử dụng hiệu quả các công cụ và phương tiện hiện đại.'
        ]
      }
    },
    duration: '4 và 4,5 năm',
    credits: 169,
    admissionRequirements: 'Công dân Việt Nam trúng tuyển kỳ thi (hoặc xét tuyển) đại học. Việc xét tuyển căn cứ kết quả thi của kỳ thi THPT quốc gia. Điểm xét tuyển là tổng điểm của một trong ba tổ hợp gồm 03 môn/bài thi: Toán, Vật lý, Hóa học (A00); Toán, Vật lý, Tiếng Anh (A01); Toán, Khoa học tự nhiên, Tiếng Anh (D90).',
    graduationConditions: 'Theo quy chế hiện hành của Bộ Giáo dục và Đào tạo và các quy định của Học viện Kỹ thuật mật mã.',
    careerOpportunities: [
      'Giảng dạy các môn liên quan đến ngành Kỹ thuật điện tử, truyền thông tại các trường đại học, cao đẳng, trung học chuyên nghiệp.',
      'Nghiên cứu khoa học thuộc các lĩnh vực về Kỹ thuật điện tử, truyền thông tại các viện nghiên cứu, các trung tâm R&D.',
      'Làm việc tại các bộ phận thiết kế, bảo trì các hệ thống điện tử trong công nghiệp, dân dụng và chuyên dụng.',
      'Làm việc trong các lĩnh vực chuyên sâu về thiết kế các hệ thống nhúng, thiết kế hệ thống điều khiển công nghiệp và thiết kế vi mạch.',
      'Làm việc tại các cơ quan, đơn vị trong ngành Cơ yếu về các lĩnh vực như triển khai và phát triển các sản phẩm mật mã chuyên dụng.'
    ],
    developmentPath: 'Có khả năng tiếp tục học tập nghiên cứu ở các trình độ cao hơn.',
    references: [
      'Đại học Bách khoa Hà Nội',
      'Học viện Công nghệ Bưu chính Viễn thông',
      'Học viện KTQS',
      'Đại học Quốc gia TPHCM',
      'Đại học Brunel London (Brunel University London) – Vương quốc Anh',
      'Đại học Aalborg (Aalborg University) – Đan Mạch',
      'Đại học Nottingham Ningbo China (University of Nottingham Ningbo China) – Trung Quốc',
      'Đại học Quốc gia Ireland (National University of Ireland) – Ai Len',
      'Đại học Leeds (University of Leeds) – Vương quốc Anh'
    ],
    semesters: [
      {
        name: 'Học kỳ 1',
        subjects: [
          { name: 'Giáo dục quốc phòng an ninh', credits: 8 },
          { name: 'Triết học Mác – Lênin', credits: 3 },
          { name: 'Toán cao cấp 1', credits: 4 },
          { name: 'Vật lý đại cương 1', credits: 3 },
          { name: 'Tin học đại cương', credits: 2 },
          { name: 'Giáo dục thể chất 1', credits: 1 }
        ]
      },
      {
        name: 'Học kỳ 2',
        subjects: [
          { name: 'Toán cao cấp 2', credits: 3 },
          { name: 'Vật lý đại cương 2', credits: 3 },
          { name: 'Lập trình căn bản', credits: 3 },
          { name: 'Kinh tế chính trị Mác – Lênin', credits: 2 },
          { name: 'Lịch sử Đảng Cộng sản Việt Nam', credits: 2 },
          { name: 'Môn tự chọn', credits: 2, isOptional: true },
          { name: 'Giáo dục thể chất 2', credits: 1 },
          { name: 'Chủ Nghĩa xã hội Khoa học', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 3',
        subjects: [
          { name: 'Toán cao cấp 3', credits: 3 },
          { name: 'Xác suất thống kê', credits: 3 },
          { name: 'Thực hành vật lý đại cương 1&2', credits: 2 },
          { name: 'Tiếng Anh 1', credits: 3 },
          { name: 'Tư tưởng Hồ Chí Minh', credits: 2 },
          { name: 'Công nghệ mạng máy tính', credits: 2 },
          { name: 'Kỹ thuật lập trình', credits: 2 },
          { name: 'Giáo dục thể chất 3', credits: 1 },
          { name: 'Kỹ năng mềm', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 4',
        subjects: [
          { name: 'Tiếng Anh 2', credits: 3 },
          { name: 'Toán rời rạc', credits: 2 },
          { name: 'Tín hiệu và hệ thống', credits: 2 },
          { name: 'Kỹ thuật điện', credits: 2 },
          { name: 'Linh kiện điện tử', credits: 3 },
          { name: 'Lý thuyết mạch', credits: 2 },
          { name: 'Điện tử công suất', credits: 2 },
          { name: 'Điện tử tương tự', credits: 3 },
          { name: 'Giáo dục thể chất 4', credits: 1 }
        ]
      },
      {
        name: 'Học kỳ 5',
        subjects: [
          { name: 'Tiếng Anh 3', credits: 3 },
          { name: 'Thông tin số', credits: 2 },
          { name: 'Kỹ thuật đo lường điện tử', credits: 3 },
          { name: 'Kỹ thuật vi xử lý', credits: 2 },
          { name: 'Điện tử tương số', credits: 3 },
          { name: 'Thiết kế mạch điện tử sử dụng máy tính', credits: 2 },
          { name: 'Thực tập cơ sở 1', credits: 2 },
          { name: 'Cơ sở điều khiển tự động', credits: 2 },
          { name: 'Giáo dục thể chất 5', credits: 1 }
        ]
      },
      {
        name: 'Học kỳ 6',
        subjects: [
          { name: 'Tiếng Anh chuyên ngành', credits: 3 },
          { name: 'Cơ sở lý thuyết truyền tin', credits: 2 },
          { name: 'Kỹ thuật truyền số liệu', credits: 2 },
          { name: 'Hệ thống viễn thông', credits: 2 },
          { name: 'Lựa chọn cơ sở ngành', credits: 2, isOptional: true },
          { name: 'Thiết kế hệ thống số', credits: 3 },
          { name: 'Kiến trúc máy tính', credits: 2 },
          { name: 'Điện tử công nghiệp', credits: 2 },
          { name: 'Đồ án 1', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 7',
        subjects: [
          { name: 'Thiết bị ngoại vi và kỹ thuật ghép nối', credits: 2 },
          { name: 'Xử lý tín hiệu số', credits: 3 },
          { name: 'Hệ điều hành nhúng thời gian thực', credits: 3 },
          { name: 'Mật mã lý thuyết', credits: 2 },
          { name: 'Hệ thống nhúng', credits: 3 },
          { name: 'Cơ sở thiết kế VLSI', credits: 3 },
          { name: 'Thực tập cơ sở 2', credits: 2 },
          { name: 'Đồ án 2', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 8',
        subjects: [
          { name: 'Thiết kế hệ thống nhúng', credits: 3 },
          { name: 'Phát triển ứng dụng IoT', credits: 3 },
          { name: 'Thiết kế PLC', credits: 3 },
          { name: 'Lựa chọn 1', credits: 3, isOptional: true },
          { name: 'Lựa chọn 2', credits: 3, isOptional: true },
          { name: 'Thực tập cơ sở 3', credits: 2 },
          { name: 'Đồ án 3', credits: 2 }
        ]
      },
      {
        name: 'Học kỳ 9',
        subjects: [
          { name: 'Thực tập tốt nghiệp', credits: 3 },
          { name: 'Đồ án tốt nghiệp', credits: 8 }
        ]
      }
    ]
  };

  constructor() {}

  getTotalCredits(semester: Semester): number {
    return semester.subjects.reduce((total, subject) => total + subject.credits, 0);
  }

  getSemesterHeaderClass(index: number): string {
    const colors = [
      'bg-gradient-to-r from-blue-600 to-indigo-600',    // Học kỳ 1
      'bg-gradient-to-r from-purple-600 to-pink-600',    // Học kỳ 2
      'bg-gradient-to-r from-green-600 to-teal-600',     // Học kỳ 3
      'bg-gradient-to-r from-yellow-600 to-orange-600',  // Học kỳ 4
      'bg-gradient-to-r from-red-600 to-pink-600',       // Học kỳ 5
      'bg-gradient-to-r from-indigo-600 to-purple-600',  // Học kỳ 6
      'bg-gradient-to-r from-teal-600 to-cyan-600',      // Học kỳ 7
      'bg-gradient-to-r from-orange-600 to-red-600',     // Học kỳ 8
      'bg-gradient-to-r from-pink-600 to-rose-600',      // Học kỳ 9
      'bg-gradient-to-r from-cyan-600 to-blue-600'       // Học kỳ 10
    ];
    return colors[index % colors.length];
  }

  getSemesterIcon(index: number): string {
    const icons = [
      'fas fa-rocket text-white',           // Học kỳ 1
      'fas fa-brain text-white',            // Học kỳ 2
      'fas fa-laptop-code text-white',      // Học kỳ 3
      'fas fa-network-wired text-white',    // Học kỳ 4
      'fas fa-database text-white',         // Học kỳ 5
      'fas fa-microchip text-white',        // Học kỳ 6
      'fas fa-mobile-alt text-white',       // Học kỳ 7
      'fas fa-code text-white',             // Học kỳ 8
      'fas fa-shield-alt text-white',       // Học kỳ 9
      'fas fa-graduation-cap text-white'    // Học kỳ 10
    ];
    return icons[index % icons.length];
  }

  getSubjectCardClass(subject: any): string {
    if (subject.isOptional) {
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100';
    }

    const subjectType = this.getSubjectType(subject.name.toLowerCase());
    switch (subjectType) {
      case 'math':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100';
      case 'programming':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100';
      case 'hardware':
        return 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100';
      case 'network':
        return 'bg-gradient-to-r from-green-50 to-teal-50 border border-green-100';
      case 'security':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-100';
      case 'database':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100';
      case 'general':
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100';
    }
  }

  getSubjectIcon(subject: any): string {
    const subjectType = this.getSubjectType(subject.name.toLowerCase());
    switch (subjectType) {
      case 'math':
        return 'fas fa-square-root-alt text-purple-500';
      case 'programming':
        return 'fas fa-code text-blue-500';
      case 'hardware':
        return 'fas fa-microchip text-orange-500';
      case 'network':
        return 'fas fa-network-wired text-green-500';
      case 'security':
        return 'fas fa-shield-alt text-red-500';
      case 'database':
        return 'fas fa-database text-yellow-500';
      case 'general':
        return 'fas fa-book text-gray-500';
      default:
        return 'fas fa-book text-gray-500';
    }
  }

  private getSubjectType(subjectName: string): string {
    if (subjectName.includes('giải tích') || subjectName.includes('đại số') || subjectName.includes('toán') || 
        subjectName.includes('xác suất')) {
      return 'math';
    }
    if (subjectName.includes('lập trình') || subjectName.includes('phần mềm') || subjectName.includes('web') ||
        subjectName.includes('android') || subjectName.includes('java') || subjectName.includes('python')) {
      return 'programming';
    }
    if (subjectName.includes('mạng') || subjectName.includes('truyền thông') || subjectName.includes('protocol')) {
      return 'network';
    }
    if (subjectName.includes('vi xử lý') || subjectName.includes('kiến trúc') || subjectName.includes('phần cứng') ||
        subjectName.includes('điện tử')) {
      return 'hardware';
    }
    if (subjectName.includes('bảo mật') || subjectName.includes('an toàn') || subjectName.includes('mã hóa')) {
      return 'security';
    }
    if (subjectName.includes('cơ sở dữ liệu') || subjectName.includes('database') || subjectName.includes('sql')) {
      return 'database';
    }
    if (subjectName.includes('triết') || subjectName.includes('chính trị') || subjectName.includes('tư tưởng') ||
        subjectName.includes('thể chất') || subjectName.includes('quốc phòng')) {
      return 'general';
    }
    return 'general';
  }
}
