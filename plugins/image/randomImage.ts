import { databaseQusry } from "@/plugins/loader/main";
import Config from "@/config/config";

export function randomImage(requestType: boolean, number: number) {
    
    const min = 0;
    const sqlSentenceMaxId = "SELECT MAX(id) FROM `random_image`";
    const respondMaxId = databaseQusry(sqlSentenceMaxId);
    
    let imageNumber: number;
    let maxId: number;
    let requestHeader: string;
    let numberTimes = 0;

    if (Config.server.ssl) {
        requestHeader = "https";
    } else {
        requestHeader = "http";
    }

    if (respondMaxId.code === 200) {
        maxId = respondMaxId.data[0].max;
    } else {
        throw new Error("数据库查询失败" + respondMaxId.message);
    }

    const randomNumber = Math.floor(Math.random() * (maxId - min + 0)) + min;
    const sqlSentence = "SELECT * FROM `random_image` WHERE `id` = " + randomNumber;
    const respond = databaseQusry(sqlSentence);

    if (respondMaxId.code === 200 && respond) {
        return {
            message: '重定向',
            code: 301,
            data: {
                url: requestHeader + "://" + Config.server.domain + "/randomImage/" + respond.data[0].src,
            }
        }
    }
}