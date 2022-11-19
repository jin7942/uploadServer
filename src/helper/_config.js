import { join, resolve } from 'path';

// 프로젝트 폴더 위치 조회
const __dirname = resolve();

export default {
    DOMAIN: 'http://arin.jin7942.co.kr:4000',
    PORT: 4000,
    FILE_MAX_COUNT: 6,
    FILE_MAX_SIZE: 1024 * 1024 * 1024,
};
