import fs from 'fs';

const generateTxtFile = (fileContent: string, path: string): void => {
    fs.writeFileSync(path, fileContent);
};

export default generateTxtFile;
