// 설치 필요 X
import { join, resolve } from 'path';
import path from 'path';
import fs from 'fs';

// 설치 필요
// npm install 모듈이름 --save
import http from 'http';
import express from 'express';
import multer from 'multer';
import { v4 } from 'uuid';
import sharp from 'sharp';

// 직접 구현한 모듈
import { mkdirs } from './helper/fileHelper';

// 설정 파일
import config from './helper/_config.js';

// ### express 기본 설정
const app = express();
const __dirname = resolve();
const cors = require('cors');
const date = new Date();

app.set('views', __dirname + 'src/views');

app.use('/upload', express.static(__dirname + '/upload'));
app.use(cors());

// ### url 맵핑
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/views/index.html');
});

// ### 업로드 경로 설정
const uploadFolderName = '/upload/' + date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
const uploadPath = join(__dirname, uploadFolderName);

// 폴더가 없을 경우 생성
if (!fs.existsSync(uploadPath)) {
    console.log('make directory: ' + uploadPath);
    mkdirs(uploadPath.toString());
}

// ### multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, v4() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });
const filefields = upload.fields([
    {
        name: 'uploadedImage',
        maxCount: config.FILE_MAX_COUNT,
        fileSize: config.FILE_MAX_SIZE,
    },
]);

// ### API 정의

// 업로드
app.post('/api/uploadImg', filefields, (req, res) => {
    const resArr = {
        data: [],
    };
    // 클라이언트에서 받은 이미지
    // input name과 일치해야함
    const { uploadedImage } = req.files;

    let i = 0;
    uploadedImage.map((data) => {
        // 썸네일로 보일 첫 번째 사지만 리사이징 한다.
        if (i == 0) {
            try {
                sharp(data.path) // 압축할 이미지 경로
                    .resize(410, 230) // 리사이징 witdh * height
                    .withMetadata() // 이미지 정보를 저장해준다
                    .toBuffer((err, buffer) => {
                        if (err) throw err;
                        // 압축된 파일 새로 저장(덮어씌우기)
                        fs.writeFile(data.path, buffer, (err) => {
                            if (err) throw err;
                        });
                    });
            } catch (err) {
                console.log(err);
            }
        }

        // 클라이언트에 응답 보낼 데이터 만들기
        resArr.data.push({
            path: config.DOMAIN + uploadFolderName + '/', // 업로드 경로(이미지 제공 경로)
            originalname: data.originalname, // 원본 이름
            uuidName: data.filename, // uuid 이름
            ext: path.extname(data.originalname), // 확장자
            fileSize: data.size, // 파일 사이즈
            defaultNy: i == 0 ? 1 : 0, // 썸네일 여부
        });
        i++;
    });
    res.json(resArr);
    console.log(resArr);

    // 삭제
}).delete('/api/uploadImg', async (req, res) => {
    if (fs.existsSync('./upload/' + req.headers.filename)) {
        try {
            fs.unlinkSync('./upload/' + req.headers.filename);
            console.log('DELETE : ' + req.headers.filename);
            res.status(200, 'OK');
            res.send('success');
        } catch (err) {
            console.log(err);
        }
    } else {
        console.log('파일이 존재하지 않습니다.');
        res.send('fail');
    }
});

// ### 서버 시작
const httpServer = http.createServer(app);
httpServer.listen(config.PORT, () => console.log(config.DOMAIN + ':' + config.PORT));
