import { join, resolve, posix } from 'path';
import fs from 'fs';
import http from 'http';
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import cors from 'cors';

// TODO: 리팩토링 렛츠기릿
// 사용자 정의 모듈
import { mkdirs } from './helper/fileHelper.js';
import config from './helper/_config.js';

const app = express();
const __dirname = resolve();
const date = new Date();

// 정적 파일 경로 설정
app.set('views', join(__dirname, 'src', 'views'));
app.use('/upload', express.static(join(__dirname, 'upload')));
app.use(cors());

// URL 맵핑
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'src', 'views', 'index.html'));
});

// 날짜별 업로드 경로
const year = String(date.getFullYear());
const month = String(date.getMonth() + 1);
const day = String(date.getDate());

// 파일 저장용 (OS 경로)
const uploadPath = join(__dirname, 'upload', year, month, day);

// URL 반환용 (항상 슬래시 사용)
const uploadUrlPath = posix.join('/upload', year, month, day);

// 디렉토리 없으면 생성
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
        const ext = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, uuidv4() + ext);
    },
});
const upload = multer({ storage });
const filefields = upload.fields([{ name: 'images', maxCount: config.FILE_MAX_COUNT }]);

// 이미지 업로드 API
app.post('/api/uploadImg', filefields, async (req, res) => {
    const resArr = { data: [] };
    const { images } = req.files;
    let i = 0;

    for (const data of images) {
        // 썸네일 리사이징 (첫 번째 이미지만)
        if (i === 0) {
            try {
                const buffer = await sharp(data.path).resize({ width: 400, height: 400, fit: 'cover' }).withMetadata().toBuffer();
                await fs.promises.writeFile(data.path, buffer);
            } catch (err) {
                console.error(err);
            }
        }

        resArr.data.push({
            path: `${config.DOMAIN}:${config.PORT}${uploadUrlPath}/`, // ✅ URL 경로
            originalname: data.originalname,
            uuidName: data.filename,
            ext: data.originalname.slice(data.originalname.lastIndexOf('.')),
            fileSize: data.size,
            sort: i,
        });
        i++;
    }

    console.log(resArr);
    res.json(resArr);
});

// 이미지 삭제 API
app.delete('/api/uploadImg', async (req, res) => {
    const filePath = join(__dirname, 'upload', req.headers.filename);
    if (fs.existsSync(filePath)) {
        try {
            await fs.promises.unlink(filePath);
            console.log('DELETE: ' + req.headers.filename);
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
httpServer.listen(config.PORT, () => {
    console.log(`${config.DOMAIN}:${config.PORT}`);
});
