import * as os from "os";
import * as fs from "fs";
import * as sharp from "sharp";
import { CreateXML } from "./helpers/FileHelper";

const args = process.argv;

const wcDir = args[2] || `${os.homedir}\\Documents\\WorldCreator\\Library\\Textures\\Ground\\WorldCreator`;
const quixelLib = args[3] || `${os.homedir}\\Documents\\Megascans Library\\Downloaded\\surface`;
const quixelFiles = new Map<string, Array<string>>();

(() => {
    try {
        process.stdout.write("Reading World Creator and Quixel Library folders...");
        fs.readdirSync(quixelLib).forEach((dirName) => {
            quixelFiles.set(dirName, fs.readdirSync(`${quixelLib}\\${dirName}`));
        });
        quixelFiles.forEach((values, dirName) => {
            const albedo = values.filter((file) => file.indexOf("Albedo") > 0)[0];
            const normal = values.filter((file) => file.indexOf("Normal") > 0)[0];
            const displacement = values.filter(
                (file) => file.indexOf("Displacement.jpg") > 0 || file.indexOf("Displacement.png") > 0
            )[0];
            if (!albedo) {
                throw Error(`No "Albedo" file could be found.`);
            } else if (!normal) {
                throw Error(`No "Normal" file could be found.`);
            } else if (!displacement) {
                throw Error(`No "Displacement" file could be found.`);
            }
            values.forEach(async (element) => {
                console.log(`Creating folder for: ${dirName}`);
                if (!fs.existsSync(`${wcDir}\\${dirName}`)) {
                    fs.mkdirSync(`${wcDir}\\${dirName}`);
                    const albedoThumb = albedo.split(".");
                    const normalThumb = normal.split(".");
                    const displacementThumb = displacement.split(".");
                    
                    await copySync(dirName, albedo, albedoThumb);
                    await copySync(dirName, normal, normalThumb);
                    await copySync(dirName, displacement, displacementThumb);

                    await sharp(`${quixelLib}\\${dirName}\\${albedo}`)
                        .resize(128, 128)
                        .toFile(`${wcDir}\\${dirName}\\${displacementThumb[0]}_thumb.${displacementThumb[1]}`);

                    fs.writeFileSync(
                        `${wcDir}\\${dirName}\\Description.xml`,
                        await CreateXML(`${albedoThumb[0]}_thumb.${albedoThumb[1]}`, albedo, normal, displacement),
                    );
                }
            });
        });
    } catch (err) {
        throw err;
    }
})();

async function copySync(dirName: string, dirFile: string, dirThumb: Array<string>) {
    fs.copyFileSync(`${quixelLib}\\${dirName}\\${dirFile}`, `${wcDir}\\${dirName}\\${dirFile}`);
    await sharp(`${quixelLib}\\${dirName}\\${dirFile}`)
        .resize(128, 128)
        .toFile(`${wcDir}\\${dirName}\\${dirThumb[0]}_thumb.${dirThumb[1]}`);
}
