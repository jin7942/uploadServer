# Upload Image Server

NextUse 중고거래 플랫폼에서 사용하는 독립형 이미지 업로드 서버입니다.  
DB 없이 운영되며, 단순하고 가볍게 구성되었습니다.

## 주요 기능

- 이미지 업로드 (다중 파일 가능)
- 첫 번째 이미지 썸네일 리사이징 (400x400)
- 업로드된 이미지 URL 반환
- 이미지 삭제 API
- 정적 이미지 접근 지원 (/upload 경로)

## 디렉토리 구조

```
uploadServer/
├── helper/
│   ├── fileHelper.js
│   └── _config.js
├── src/
│   └── views/
│       └── index.html
├── upload/               # 저장 디렉토리 (년/월/일)
└── index.js              # 메인 서버 코드
```

## 기술 스택

- Node.js + Express
- Multer
- Sharp
- CORS
- UUID
- path / fs

## 업로드 흐름

1. 클라이언트에서 FormData로 이미지 업로드
2. 서버는 날짜 디렉토리 생성 후 저장
3. 첫 번째 이미지는 썸네일 리사이징
4. JSON 응답으로 메타데이터 반환

### POST /api/uploadImg

- Content-Type: multipart/form-data
- 필드명: `images`
- 응답 예시:

```json
{
  "data": [
    {
      "path": "http://localhost:4000/upload/2025/03/29/",
      "originalname": "sample.jpg",
      "uuidName": "uuid.jpg",
      "ext": ".jpg",
      "fileSize": 123456,
      "sort": 0
    }
  ]
}
```

### DELETE /api/uploadImg

- Header: `filename` (상대경로)
- 예시: `/upload/2025/03/29/uuid.jpg`

## 정적 이미지 경로

- URL: `/upload/yyyy/mm/dd/filename`
- 예시: `http://localhost:4000/upload/2025/03/29/uuid.jpg`

## 실행 방법

```bash
npm install
node index.js
```

또는

```bash
npm start
```

> `package.json`에 `"start": "node index.js"` 설정이 되어 있어야 함

## 향후 계획

- API Key 기반 인증 추가
- 클라이언트 리사이징 전환
- 이미지 최적화 고도화
- CDN 연동 (예: Cloudflare)
