import * as builder from "xmlbuilder";
import * as uuid from "uuid";
import * as fs from 'fs';

export async function CreateXML(thumb: string, diffName: string, normName: string, disName: string) {
    return await builder
        .create({
            WorldCreator: {
                "@Version": "2.0",
                Textures: {
                    "@Preview": "preview.png",
                    "@Description": "",
                    "@Tags": "cliffs",
                    "@Publisher": "Bingo",
                    "@Website": "",
                    "@Guid": uuid.v1(),
                    Diffuse: {
                        "@File": diffName,
                        "@Time": new Date().getTime(),
                    },
                    Normal: {
                        "@File": normName,
                        "@Time": new Date().getTime(),
                    },
                    Displacement: {
                        "@File": disName,
                        "@Time": new Date().getTime(),
                    },
                },
            },
        })
        .end({ pretty: true });
}

export function dirExists(dir: string){
    try{
        if(fs.readdirSync(dir).length > 1){
            return true;
        }else{
            return false;
        }
    } catch(err){
        return false;
    }
}
