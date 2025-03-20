import { join, resolve } from 'path';
import fs from 'fs';
import http from 'http';
import express from 'express';
import multer from 'multer';
import { v4 } from 'uuid';
import sharp from 'sharp';
import cors from 'cors';

// 직접 구현한 모듈
import { mkdirs } from './helper/fileHelper.js';
// 설정 파일
import config from './helper/_config.js';

const app = express();
const __dirname = resolve();
const date = new Date();

// views 경로 설정
app.set('views', join(__dirname, 'src', 'views'));

app.use('/upload', express.static(join(__dirname, 'upload')));
app.use(cors());

// URL 맵핑
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'src', 'views', 'index.html'));
});

// 업로드 경로 설정 (월 보정: getMonth()+1)
const uploadFolderName = join('/upload', date.getFullYear().toString(), (date.getMonth() + 1).toString(), date.getDate().toString());
const uploadPath = join(__dirname, uploadFolderName);

// 폴더가 없을 경우 생성
if (!fs.existsSync(uploadPath)) {
    console.log('make directory: ' + uploadPath);
    mkdirs(uploadPath);
}

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, v4() + join('', file.originalname.slice(file.originalname.lastIndexOf('.'))));
    },
});
const upload = multer({ storage: storage });
const filefields = upload.fields([
    {
        name: 'uploadedImage',
        maxCount: config.FILE_MAX_COUNT,
    },
]);

// 업로드 API
app.post('/api/uploadImg', filefields, async (req, res) => {
    const resArr = { data: [] };
    const { uploadedImage } = req.files;

    let i = 0;
    for (const data of uploadedImage) {
        // 첫 번째 이미지에 대해 썸네일 리사이징 수행
        if (i === 0) {
            try {
                const buffer = await sharp(data.path).resize({ width: 400, height: 400, fit: 'cover' }).withMetadata().toBuffer();
                await fs.promises.writeFile(data.path, buffer);
            } catch (err) {
                console.error(err);
            }
        }

        resArr.data.push({
            path: config.DOMAIN + ':4000' + uploadFolderName + '/',
            originalname: data.originalname,
            uuidName: data.filename,
            ext: data.originalname.slice(data.originalname.lastIndexOf('.')),
            fileSize: data.size,
            sort: i,
        });
        i++;
    }
    res.json(resArr);
    console.log(resArr);
});

// 삭제 API
app.delete('/api/uploadImg', async (req, res) => {
    const filePath = join(__dirname, 'upload', req.headers.filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log('DELETE : ' + req.headers.filename);
            res.status(200).send('success');
        } catch (err) {
            console.error(err);
            res.status(500).send('error');
        }
    } else {
        console.log('파일이 존재하지 않습니다.');
        res.status(404).send('fail');
    }
});

// 서버 시작
const httpServer = http.createServer(app);
httpServer.listen(config.PORT, () => console.log(`${config.DOMAIN}:${config.PORT}`));
