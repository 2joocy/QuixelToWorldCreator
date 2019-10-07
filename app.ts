import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as sharp from "sharp";
import { CreateXML, dirExists } from "./helpers/FileHelper";

const args = process.argv;

const wcDir = args[2] || path.normalize(`${os.homedir()}/Documents/WorldCreator/Library/Textures/Ground/WorldCreator`);
const quixelLib = args[3] || path.normalize(`${os.homedir()}/Documents/Megascans Library/Downloaded/surface`);
const quixelFiles = new Map<string, Array<string>>();

(() => {
    try {
        if (!fs.existsSync(quixelLib)) {
            console.log(
                "\x1b[31m",
                `There were no textures found under \n${quixelLib} \nEither set it manually, or contact me on discord at William Pfaffe#9520`
            );
            return;
        }

        if (!fs.existsSync(wcDir)) {
            console.log(
                "\x1b[31m",
                `No World Creator directory found under \n${wcDir} \nEither set it manually, or contact me on discord at William Pfaffe#9520`
            );
            return;
        }

        if (fs.readdirSync(quixelLib).length < 1) {
            console.log("\x1b[31m", "No Quixel Textures found!");
            return;
        }

        fs.readdirSync(quixelLib).forEach((dirName) => {
            quixelFiles.set(dirName, fs.readdirSync(path.normalize(`${quixelLib}/${dirName}`)));
        });
        process.stdout.write("Reading World Creator and Quixel Library folders...");
        quixelFiles.forEach((values, dirName) => {
            const albedo = values.filter((file) => file.indexOf("Albedo") > 0)[0];
            const normal = values.filter((file) => file.indexOf("Normal") > 0)[0];
            const displacement = values.filter(
                (file) => file.indexOf("Displacement.jpg") > 0 || file.indexOf("Displacement.png") > 0
            )[0];
            if (!albedo || !normal || !displacement) {
                return;
            }
            if (values.length < 1) {
                console.log("\x1b[31m", `No textures found at ${dirName}`);
            }
            values.forEach(async () => {
                if (!fs.existsSync(path.normalize(`${wcDir}/${dirName}`))) {
                    console.log("\x1b[33m", `Creating folder for: ${dirName}`);
                    fs.mkdirSync(`${wcDir}/${dirName}`);
                    const albedoThumb = albedo.split(".");
                    const normalThumb = normal.split(".");
                    const displacementThumb = displacement.split(".");

                    await copySync(dirName, albedo, albedoThumb);
                    await copySync(dirName, normal, normalThumb);
                    await copySync(dirName, displacement, displacementThumb);

                    await sharp(`${quixelLib}/${dirName}/${albedo}`)
                        .resize(128, 128)
                        .toFile(`${wcDir}/${dirName}/${displacementThumb[0]}_thumb.${displacementThumb[1]}`);

                    fs.writeFileSync(
                        path.normalize(`${wcDir}/${dirName}/Description.xml`),
                        await CreateXML(`${albedoThumb[0]}_thumb.${albedoThumb[1]}`, albedo, normal, displacement)
                    );
                }
            });
        });
        console.log("\x1b[32m", `Finished importing ${quixelFiles.size} textures`);
    } catch (err) {
        console.log(err);
    }
})();

async function copySync(dirName: string, dirFile: string, dirThumb: Array<string>) {
    fs.copyFileSync(
        path.normalize(`${quixelLib}/${dirName}/${dirFile}`),
        path.normalize(`${wcDir}/${dirName}/${dirFile}`)
    );
    await sharp(path.normalize(`${quixelLib}/${dirName}/${dirFile}`))
        .resize(128, 128)
        .toFile(path.normalize(`${wcDir}/${dirName}/${dirThumb[0]}_thumb.${dirThumb[1]}`));
}
