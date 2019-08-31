import * as os from "os";
import * as fs from "fs";
import * as sharp from "sharp";
import { CreateXML } from "./helpers/FileHelper";

const wcDir = `${os.homedir}\\Documents\\WorldCreator\\Library\\Textures\\Ground\\WorldCreator`;
const quixelLib = `${os.homedir}\\Documents\\Megascans Library\\Downloaded\\surface`;
const quixelFiles = new Map<string, Array<string>>();
(() => {
    try{
        process.stdout.write("Reading World Creator and Quixel Library folders...");
        fs.readdirSync(quixelLib).forEach(dirName => {
          quixelFiles.set(dirName, fs.readdirSync(`${quixelLib}\\${dirName}`));
        });
        
        quixelFiles.forEach((values, dirName) => {
          const albedo = values.filter(file => file.indexOf("Albedo") > 0)[0];
          const normal = values.filter(file => file.indexOf("Normal") > 0)[0];
          const displacement = values.filter(
            file =>
              file.indexOf("Displacement.jpg") > 0 ||
              file.indexOf("Displacement.png") > 0
          )[0];
          if(!albedo || !normal || !displacement){
            return;
          }
          values.forEach(async (element) => {
              console.log(`Creating folder for: ${dirName}`)
            if (!fs.existsSync(`${wcDir}\\${dirName}`)) {
                setTimeout(() => {}, 5000);
                fs.mkdirSync(`${wcDir}\\${dirName}`);
                const albedoThumb = albedo ? albedo.split('.') : null;
                const normalThumb = normal ? normal.split('.') : null;
                const displacementThumb = displacement ? displacement.split('.') : null;
                if(albedoThumb && normalThumb && displacementThumb)
                if(albedo){
                    fs.copyFileSync(`${quixelLib}\\${dirName}\\${albedo}`, `${wcDir}\\${dirName}\\${albedo}`);
                    await sharp(`${quixelLib}\\${dirName}\\${albedo}`).resize(128, 128).toFile(`${wcDir}\\${dirName}\\${albedoThumb[0]}_thumb.${albedoThumb[1]}`);
                }
                if(normal){
                    fs.copyFileSync(`${quixelLib}\\${dirName}\\${normal}`, `${wcDir}\\${dirName}\\${normal}`);
                    await sharp(`${quixelLib}\\${dirName}\\${albedo}`).resize(128, 128).toFile(`${wcDir}\\${dirName}\\${normalThumb[0]}_thumb.${normalThumb[1]}`);
                }
                if(displacement){
                    fs.copyFileSync(`${quixelLib}\\${dirName}\\${displacement}`, `${wcDir}\\${dirName}\\${displacement}`);
                    await sharp(`${quixelLib}\\${dirName}\\${albedo}`).resize(128, 128).toFile(`${wcDir}\\${dirName}\\${displacementThumb[0]}_thumb.${displacementThumb[1]}`);
                }
                fs.writeFileSync(
                    `${wcDir}\\${dirName}\\Description.xml`,
                    await CreateXML(`${albedoThumb[0]}_thumb.${albedoThumb[1]}`, albedo, normal, displacement)
                  ); 
            }
          });
        });
    }catch(err){
    }
})()

/*
fs.readdirSync(`${wcDir}\\${dirName}`).forEach(file => {
                    fs.unlinkSync(`${wcDir}\\${dirName}\\${file}`)
                })
                fs.rmdirSync(`${wcDir}\\${dirName}`);
*/