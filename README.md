# 이미지 업로드 API 서버

-   작업기간 : 2022.11 ~ 2022.11 (1주일)
-   인력구성 : 1 명
-   개발환경 : NodeJs, ExpressJs

## 시작하기

-   프로젝트 다운로드

    ```
    git clone https://github.com/jin7942/uploadServer.git
    ```

-   설정 파일

    > uploadServer/src/helper/\_config.js

-   패키지 설치

    ```
    npm install package.json
    ```

-   서버 시작
    ```
    npm run dev
    ```

## Request

### method : POST

-   enctype : multipart/form-data
-   name : uplaodImage

## Response

Json Array 반환

| name         | type   | Description       |
| ------------ | ------ | ----------------- |
| path         | String | 파일 접근 경로    |
| originalname | String | 파일 원본 이름    |
| ext          | String | 파일 확장자       |
| fileSize     | int    | 파일 사이즈(byte) |

```json
{
    "data": [
        {
            "path": "http://localhost:4000/upload/2022/10/9/",
            "originalname": "sample_images_03.png",
            "uuidName": "3bc7a1bd-bc35-4b1c-866b-f81a2645d9ae.png",
            "ext": ".png",
            "fileSize": 10389
        },
        {
            "path": "http://localhost:4000/upload/2022/10/9/",
            "originalname": "sample_images_02.png",
            "uuidName": "50996701-f7bd-42ec-8164-9a0ea1cb6278.png",
            "ext": ".png",
            "fileSize": 9081
        },
        {
            "path": "http://localhost:4000/upload/2022/10/9/",
            "originalname": "sample_images_04.png",
            "uuidName": "7416169d-afd7-4c76-ae54-e0305b1964fe.png",
            "ext": ".png",
            "fileSize": 7159
        }
    ]
}
```

## 사용하기

```html
<img src="http://localhost:4000/upload/2022/10/9/7416169d-afd7-4c76-ae54-e0305b1964fe.png" />
```
