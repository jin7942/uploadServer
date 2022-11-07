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

app.use('/upload', express.static(__dirname + '/src/upload'));
app.use(cors());

// ### url 맵핑
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/views/index.html');
});

// ### 업로드 경로 설정
const uploadFolderName = '/src/upload/' + date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
const uploadPath = join(__dirname, uploadFolderName);

// 폴더가 없을 경우 생성
if (!fs.existsSync(uploadPath)) {
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
app.post('/api/uploadImg', filefields, (req, res) => {
    const resArr = [];
    const { uploadedImage } = req.files;

    uploadedImage.map((data) => {
        resArr.push({
            path: 'http://localhost:4000/' + uploadFolderName + '/',
            originalname: data.originalname,
            uuidName: data.filename,
            ext: path.extname(data.originalname),
            fileSize: data.size,
        });
    });
    res.json(resArr);
    console.log(resArr);
});

// ### 서버 시작
const httpServer = http.createServer(app);
httpServer.listen(config.PORT, () => console.log('Listening on http://localhost:' + config.PORT));
