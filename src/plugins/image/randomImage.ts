/* import databaseQusry from "@/plugins/database/mian";

function randomImage(requestType: boolean, number: number) {

    interface respondMaxId {
        message: string,
        code: number,
        data: any
    }

    interface respond {
        message: string,
        code: number,
        data: any
    }

    const min = 0;
    const sqlSentenceMaxId = "SELECT MAX(id) FROM `random_image`";
    const respondMaxId =  databaseQusry(sqlSentenceMaxId) as respondMaxId;
    
    let imageNumber: number;
    let maxId: number;
    let requestHeader: string;
    let numberTimes = 0;

    if (process.env.SERVER_SSL === "true") {
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
    const respond = databaseQusry(sqlSentence) as respond;

    if (respondMaxId.code === 200) {
        return {
            message: '重定向',
            code: 301,
            data: {
                url: requestHeader + "://" + process.env.SERVER_DOMIAN + "/randomImage/" + respond.data[0].src,
            }
        }
    }
}

export default randomImage; */