# Upload Server (이미지 업로드 API)

Node.js + Express 기반 이미지 업로드 서버.  
Multer와 Sharp를 사용하여 이미지 저장 및 리사이징을 처리하며, 프론트엔드에서 쉽게 연동 가능하다.

## 주요 기능

- 날짜별 디렉토리 생성 및 자동 저장
- 첫 번째 이미지 1장 리사이징 (400x400)
- 업로드 및 삭제 API 제공
- CORS 허용 (모든 출처)
- 설정 파일 기반 구성

## 기술 스택

- Node.js + Express
- Multer
- Sharp
- UUID
- CORS

## 설치 및 실행

```bash
git clone https://github.com/jin7942/uploadServer.git
cd uploadServer
npm install
npm start
```

접속: http://localhost:4000

## 업로드 API

- POST /api/uploadImg
- multipart/form-data
- 필드명: uploadedImage
- 다중 파일 업로드 가능

### 응답 형식

```json
{
  "data": [
    {
      "path": "http://localhost:4000/upload/2025/03/22/",
      "originalname": "test.png",
      "uuidName": "uuid-image.png",
      "ext": ".png",
      "fileSize": 12345,
      "sort": 0
    }
  ]
}
```

## 삭제 API

- DELETE /api/uploadImg
- Header: filename=2025/03/22/uuid.png

## 연동 예시

### React (Axios)

```js
const formData = new FormData();
formData.append("uploadedImage", file);

axios.post("http://localhost:4000/api/uploadImg", formData)
  .then(res => console.log(res.data));
```

### Vanilla JS (Ajax)

```js
const formData = new FormData();
formData.append("uploadedImage", file);

const xhr = new XMLHttpRequest();
xhr.open("POST", "http://localhost:4000/api/uploadImg");
xhr.onreadystatechange = () => {
  if (xhr.readyState === 4 && xhr.status === 200) {
    const result = JSON.parse(xhr.responseText);
    console.log(result);
  }
};
xhr.send(formData);
```

## 설정

설정 파일: `helper/_config.js`

| 항목 | 설명 |
|------|------|
| PORT | 서버 실행 포트 |
| DOMAIN | 기본 주소 |
| FILE_MAX_COUNT | 업로드 가능 최대 이미지 수 |

## 주의 사항

- 업로드된 파일은 날짜별로 저장됨
- 첫 이미지만 리사이징
- 인증 처리 없음

## 라이선스

MIT License