# 🪶 우울 메모 (Depression Memo)

로그인 없이 감정을 기록하고, 수정/삭제 없이 그때의 마음을 남기는 공간

## ✨ 주요 기능

- **익명 글쓰기**: 로그인 없이 부담 없이 감정을 기록
- **수정/삭제 불가**: 그 순간의 진짜 감정을 보존
- **이모지 반응**: 댓글 대신 이모지로 공감 표현
- **사이드바**: 내가 쓴 글들을 쉽게 관리
- **공개 피드**: 다른 사람들의 마음을 구경할 수 있음

## 🚀 배포 방법

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화 (테스트 모드로 시작)
3. 프로젝트 설정에서 웹 앱 추가
4. `firebase-config.js` 파일의 설정값들을 실제 값으로 교체

### 2. Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com/)에서 GitHub 저장소 연결
3. 자동 배포 완료!

또는 Vercel CLI 사용:

```bash
npm install -g vercel
vercel
```

## 🛠️ 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📁 프로젝트 구조

```
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── app.js             # 메인 JavaScript 로직
├── firebase-config.js # Firebase 설정
├── package.json       # 프로젝트 설정
├── vercel.json        # Vercel 배포 설정
└── README.md          # 프로젝트 설명
```

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Build Tool**: Vite

## 📝 Firestore 데이터 구조

```javascript
/notes/{noteId}
{
  content: string,           // 글 내용
  createdAt: Timestamp,      // 생성 시간
  reactions: {               // 반응 수
    smile: number,
    sad: number,
    neutral: number,
    thought: number,
    heart: number
  },
  deleted: boolean          // 삭제 여부
}
```

## 🎨 디자인 특징

- **다크 테마**: 고요하고 편안한 분위기
- **그라데이션**: 부드러운 색상 전환
- **글래스모피즘**: 반투명 효과로 모던한 느낌
- **반응형**: 모바일과 데스크톱 모두 지원

## ⚠️ 주의사항

- Firebase 설정값을 실제 값으로 교체해야 합니다
- Firestore 보안 규칙을 프로덕션에 맞게 설정하세요
- 위기 상황 시 전문가 도움을 받으세요 (1393, 112)

## 📄 라이선스

MIT License
