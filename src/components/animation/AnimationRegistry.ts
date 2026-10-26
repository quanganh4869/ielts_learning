/**
 * Animation Registry - Centralized mapping for all Nori Mascot and Brand animations.
 * 
 * STRICT RULES:
 * - 100% original filenames preserved without renaming or duplicating.
 * - Exact paths served via Vite static server in dev and copied during production build.
 * - Mapped directly based on verified visual frames and business events.
 */

export type AnimationEventType =
  | 'lesson_completed'       // Sách mở ra & dấu tích khi hoàn thành bài học
  | 'grand_celebration'      // Nori nhảy tung hoa giấy khi hoàn thành thi thử / đạt band mục tiêu
  | 'study_streak'           // Nori đứng cạnh ngọn lửa streak & vòng năng lượng Google Flow đa sắc
  | 'module_added'           // Thẻ module bay vào với huy hiệu tick xanh xác nhận
  | 'data_saved'             // Đĩa mềm chuyển hóa thành dấu tick xanh thành công
  | 'unlock_padlock'         // Ổ khóa mở ra cuốn sách tri thức
  | 'error_feedback'         // Nori gãi đầu bối rối & bóng đèn chập chờn khi có lỗi
  | 'network_retry'          // Nori cầm vòng xoay refresh khi timeout / mất mạng
  | 'study_session'          // Nori ngồi học bài, vẫy tay chào với chồng sách và flashcards
  | 'ui_transition'          // Nori cầm tablet giới thiệu các thẻ học phần lộ trình
  | 'icon_closing'           // Nori vẫy tay chào tạm biệt và thu nhỏ biến mất
  | 'loading_juggling'       // Nori tung hứng sách và khối tri thức khi đang tải dữ liệu

export interface AnimationAssetMeta {
  id: AnimationEventType
  name: string
  primaryPath: string
  fallbackPath?: string
  fallbackImage: string
  format: 'mp4' | 'webm'
  durationSeconds: number
  loop: boolean
  aspectRatio: '16/9' | '1/1'
  backgroundHex: string
  descriptionVi: string
  intendedEvent: string
  verificationStatus: 'verified' | 'needs_verification'
}

export const ANIMATION_REGISTRY: Record<AnimationEventType, AnimationAssetMeta> = {
  lesson_completed: {
    id: 'lesson_completed',
    name: 'Book opening with checkmark',
    primaryPath: '/animation/Book_opening_with_checkmark_anim…_1080p_20261026220238.mp4',
    fallbackImage: '/stickers/metric-lessons.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#ECEAEB',
    descriptionVi: 'Cuốn sách 3D mở ra, dấu tích xanh teal hiện lên và Nori ló đầu chào với các ngôi sao xanh lấp lánh.',
    intendedEvent: 'Xác nhận hoàn thành bài học (Lesson completion).',
    verificationStatus: 'verified',
  },
  grand_celebration: {
    id: 'grand_celebration',
    name: 'Otter jumping for celebration',
    primaryPath: '/animation/Otter_jumping_for_celebration_an…_1080p_20261026215954.mp4',
    fallbackImage: '/stickers/sticker_15_.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Mưa hoa giấy confetti rơi ngập tràn, Nori giơ tay và nhảy bật lên cao ăn mừng thành tích lớn.',
    intendedEvent: 'Nộp bài thi thử IELTS thành công, đạt Band mục tiêu hoặc hoàn thành khóa học.',
    verificationStatus: 'verified',
  },
  study_streak: {
    id: 'study_streak',
    name: 'Otter study streak flame',
    primaryPath: '/animation/Otter_character_study_streak_ani…_1080p_20261026220556.mp4',
    fallbackImage: '/stickers/metric-streak.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FAF7F8',
    descriptionVi: 'Nori đứng cạnh ngọn lửa Streak bập bùng, các vòng sóng năng lượng Google Flow đa sắc lan tỏa.',
    intendedEvent: 'Đạt mốc chuỗi ngày học tập chuyên cần (Streak milestone).',
    verificationStatus: 'verified',
  },
  module_added: {
    id: 'module_added',
    name: 'Module added successfully UI card',
    primaryPath: '/animation/Module_added_successfully_UI_ani…_1080p_20261026220700.mp4',
    fallbackImage: '/stickers/nav-roadmap.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'UI card chứa avatar Nori bay vào tâm, huy hiệu tròn màu xanh ngọc nổi lên và kích hoạt tick xanh.',
    intendedEvent: 'Thêm module học tập mới trong Admin hoặc ghi danh khóa học thành công.',
    verificationStatus: 'verified',
  },
  data_saved: {
    id: 'data_saved',
    name: 'Floppy disk transforms into checkmark',
    primaryPath: '/animation/Floppy_disk_transforms_into_chec…_1080p_20261026220952.mp4',
    fallbackImage: '/stickers/activity-write.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Biểu tượng đĩa mềm xoay nhẹ rồi chuyển hóa thành dấu tích chữ V xanh ngọc xác nhận đã lưu.',
    intendedEvent: 'Lưu tiến độ bài thi, đánh giá thẻ flashcard hoặc cập nhật cài đặt thành công.',
    verificationStatus: 'verified',
  },
  unlock_padlock: {
    id: 'unlock_padlock',
    name: 'Padlock unlocks revealing book icon',
    primaryPath: '/animation/Padlock_unlocks_revealing_book_icon_1080p_20261026221821.mp4',
    fallbackImage: '/stickers/nav-roadmap.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#F5F5F5',
    descriptionVi: 'Ổ khóa trắng viền xanh teal bật mở quai kèm hào quang, biến hóa thành cuốn sách tri thức mở rộng.',
    intendedEvent: 'Mở khóa giai đoạn (Phase) hoặc bài học tiếp theo trên Lộ trình học.',
    verificationStatus: 'verified',
  },
  error_feedback: {
    id: 'error_feedback',
    name: 'Otter character shaking error doubt',
    primaryPath: '/animation/Otter_character_shaking_error_do…_1080p_20261026220956.mp4',
    fallbackImage: '/stickers/sticker_10_.png',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Nori cầm kẹp tài liệu gãi đầu lo lắng, bong bóng dấu chấm than và bóng đèn chập chờn rung lắc nghi vấn.',
    intendedEvent: 'Báo lỗi thao tác thất bại, câu trả lời bài tập chưa đúng hoặc dữ liệu không hợp lệ.',
    verificationStatus: 'verified',
  },
  network_retry: {
    id: 'network_retry',
    name: 'Otter holding refresh loop retry indicator',
    primaryPath: '/animation/Otter_holding_refresh_loop_indic…_1080p_20261026221301.mp4',
    fallbackImage: '/stickers/nav-tutor.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: true,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Nori nhìn sổ tay băn khoăn, dấu hỏi chấm hiện lên rồi Nori mỉm cười giơ biểu tượng vòng xoay refresh.',
    intendedEvent: 'Kết nối mạng bị gián đoạn, API timeout hoặc nút thử lại dữ liệu.',
    verificationStatus: 'verified',
  },
  study_session: {
    id: 'study_session',
    name: 'Nori study session with flashcards and books',
    primaryPath: '/animation/ô.mp4',
    fallbackImage: '/brand/nori-study.png',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: true,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Nori ngồi khoanh chân trên sàn với sách và thẻ bài tập, ngoe nguẩy đuôi và vẫy tay chào vui vẻ.',
    intendedEvent: 'Không gian học từ vựng Flashcard, tự luyện thi hoặc chào đón vào bài học.',
    verificationStatus: 'verified',
  },
  ui_transition: {
    id: 'ui_transition',
    name: 'Otter character UI transition guide',
    primaryPath: '/animation/Otter_character_UI_transition_an…_1080p_20261026221626.mp4',
    fallbackImage: '/stickers/activity-upnext.webp',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FAF7F8',
    descriptionVi: 'Nori cầm tablet chỉ tay thân thiện giới thiệu danh sách các thẻ bài học lộ trình bay vào xếp tầng.',
    intendedEvent: 'Màn hình rỗng hướng dẫn lộ trình (Roadmap Guide Empty State) hoặc chào mừng khóa học mới.',
    verificationStatus: 'verified',
  },
  icon_closing: {
    id: 'icon_closing',
    name: 'Otter icon closing animation',
    primaryPath: '/Otter_icon_closing_animation_1080p_20261025225329.mp4',
    fallbackImage: '/brand/nori-mascot-sm.png',
    format: 'mp4',
    durationSeconds: 4.0,
    loop: false,
    aspectRatio: '16/9',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Nori đứng vẫy tay tạm biệt rồi từ từ thu nhỏ dần vào tâm điểm và biến mất nhẹ nhàng.',
    intendedEvent: 'Hiệu ứng đóng popup, đóng drawer hoặc đăng xuất.',
    verificationStatus: 'verified',
  },
  loading_juggling: {
    id: 'loading_juggling',
    name: 'Nori juggling books loading indicator',
    primaryPath: '/loading-nori.webm',
    fallbackPath: '/loading-nori.mp4',
    fallbackImage: '/brand/nori-study.png',
    format: 'webm',
    durationSeconds: 4.0,
    loop: true,
    aspectRatio: '1/1',
    backgroundHex: '#FFFFFF',
    descriptionVi: 'Nori ngồi tung hứng sách và các khối tri thức đa sắc màu theo quỹ đạo vòng cung mượt mà.',
    intendedEvent: 'Trạng thái đang tải dữ liệu thực tế, AI Tutor đang suy nghĩ hoặc nạp phòng thi.',
    verificationStatus: 'verified',
  },
}
