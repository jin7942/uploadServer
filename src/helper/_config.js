import { resolve } from 'path';

// 프로젝트 폴더 위치 조회
const __dirname = resolve();

export default {
    DOMAIN: 'http://localhost',
    PORT: 4000,
    FILE_MAX_COUNT: 6,
    FILE_MAX_SIZE: 1024 * 1024 * 1024,
};
