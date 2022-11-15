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

const sharp = require('sharp');

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
app.post('/api/uploadImg', filefields, (req, res) => {
    const resArr = {
        data: [],
    };
    const { uploadedImage } = req.files;

    let i = 0;
    uploadedImage.map((data) => {
        if (i == 0) {
            try {
                sharp(data.path) // 압축할 이미지 경로
                    .resize(410, 230) // 리사이징
                    .withMetadata()
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

        resArr.data.push({
            path: 'http://localhost:4000' + uploadFolderName + '/',
            originalname: data.originalname,
            uuidName: data.filename,
            ext: path.extname(data.originalname),
            fileSize: data.size,
            defaultNy: i == 0 ? 1 : 0,
        });
        i++;
    });
    res.json(resArr);
    console.log(resArr);
});

// ### 서버 시작
const httpServer = http.createServer(app);
httpServer.listen(config.PORT, () => console.log('Listening on http://localhost:' + config.PORT));
