import fs from 'fs';
import { dirname } from 'path';

export const mkdirs = (target) => {
    const parent = dirname(target);
    if (!fs.existsSync(parent)) mkdirs(parent);
    if (!fs.existsSync(target)) fs.mkdirSync(target);
};
