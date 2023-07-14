/**
 * 数据编码和解码
 */

// hex 编码
function hexEncode(byteArray) {
    let str = "";
    for (let i = 0; i < byteArray.length; i++) {
        let tmp;
        const num = byteArray[i];
        if (num < 0) {
            //此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
            tmp = (255 + num + 1).toString(16);
        } else {
            tmp = num.toString(16);
        }
        if (tmp.length === 1) {
            tmp = "0" + tmp;
        }
        str += tmp;
    }
    return str;
}

// hex 解码
function hexDecode(str) {
    let pos = 0;
    let len = str.length;
    if (len % 2 !== 0) {
        return null;
    }
    len /= 2;
    const byteArray = [];
    for (let i = 0; i < len; i++) {
        const s = str.substr(pos, 2);
        const v = parseInt(s, 16);
        byteArray.push(v);
        pos += 2;
    }
    return byteArray;
}

// utf8 编码
function utf8Encode(byteArray) {
    if (byteArray == null || !(byteArray instanceof Array)) return null; // 传进来的参数必须是数组,否则不处理
    let str = '';
    for (let i = 0; i < byteArray.length; i++) {
        const one = byteArray[i].toString(2), v = one.match(/^1+?(?=0)/);
        if (v && one.length === 8) {
            const bytesLength = v[0].length;
            let store = byteArray[i].toString(2).slice(7 - bytesLength);
            for (let st = 1; st < bytesLength; st++) {
                store += byteArray[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(byteArray[i]);
        }
    }
    return str;
}

// utf8 解码
function utf8Decode(str) {
    const byteArray = [];
    let len, c;
    len = str.length;
    for (let i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            byteArray.push(((c >> 18) & 0x07) | 0xF0);
            byteArray.push(((c >> 12) & 0x3F) | 0x80);
            byteArray.push(((c >> 6) & 0x3F) | 0x80);
            byteArray.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            byteArray.push(((c >> 12) & 0x0F) | 0xE0);
            byteArray.push(((c >> 6) & 0x3F) | 0x80);
            byteArray.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            byteArray.push(((c >> 6) & 0x1F) | 0xC0);
            byteArray.push((c & 0x3F) | 0x80);
        } else {
            byteArray.push(c & 0xFF);
        }
    }
    return byteArray;
}

// base64编码
function base64Encode(byteArray) {
    if (byteArray == null || !(byteArray instanceof Array)) return null; // 传进来的参数必须是数组,否则不处理
    const BASE64C = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];

    const result = []; //每3个字节一组,重组为4个字节一组
    let bits;
    let index = 0;
    for (let i = 0; i < parseInt(byteArray.length / 3) * 3; i += 3) { //除3取整再乘3可以取到最后面的3的倍数个
        bits = (byteArray[i] & 0xff) << 16 | (byteArray[i + 1] & 0xff) << 8 | (byteArray[i + 2] & 0xff); //&0xff表示由byte转int,<<表示向左移多少位,高位会被丢弃,低位会补0
        result[index++] = BASE64C[(bits >>> 18) & 0x3f]; //&0x3f表示保留6位数(类似对64求余),>>表示向右移多少位,低位会被丢弃,高位补0(无符号)或1(有符号),>>>表示向右移多少位,高位补0(无符号)
        result[index++] = BASE64C[(bits >>> 12) & 0x3f];
        result[index++] = BASE64C[(bits >>> 6) & 0x3f];
        result[index++] = BASE64C[bits & 0x3f];
    }
    if (byteArray.length % 3 === 1) { //多余1个加两个=号
        bits = (byteArray[byteArray.length - 1] & 0xff) << 4;
        result[index++] = BASE64C[(bits >>> 6) & 0x3f];
        result[index++] = BASE64C[bits & 0x3f];
        result[index++] = 61; //stringToBytes('=')
        result[index] = 61;
    } else if (byteArray.length % 3 === 2) { //多余2个加一个=号
        bits = (byteArray[byteArray.length - 2] & 0xff) << 10 | (byteArray[byteArray.length - 1] & 0xff) << 2;
        result[index++] = BASE64C[(bits >>> 12) & 0x3f];
        result[index++] = BASE64C[(bits >>> 6) & 0x3f];
        result[index++] = BASE64C[bits & 0x3f];
        result[index] = 61;
    }
    return utf8Encode(result);
}

// base64解码
function base64Decode(str) {
    if (str == null || (typeof str !== "string") || (str.length % 4 !== 0)) return null;
    let byteArrary = utf8Decode(str); //该方法只适用于utf-8编码和ascii编码

    const BASE64B = [62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]; //'A'=65,'a'=97,'0'=48,'+'=43,'/'=47 统一减43
    const result = [];
    let bits;
    let index = 0;
    for (let i = 0; i < byteArrary.length - 4; i += 4) {
        bits = (BASE64B[byteArrary[i] - 43] & 0xff) << 18 | (BASE64B[byteArrary[i + 1] - 43] & 0xff) << 12 | (BASE64B[byteArrary[i + 2] - 43] & 0xff) << 6 | (BASE64B[byteArrary[i + 3] - 43] & 0xff); //通过BASE64B[params[i]-43]将原始数值进行还原,然后再向左移位
        result[index++] = ((bits >>> 16) & 0xff); //&0xff表示保留8位数(类似求余),>>表示向右移多少位,低位会被丢弃,高位补0(无符号)或1(有符号),>>>表示向右移多少位,高位补0(无符号)
        result[index++] = ((bits >>> 8) & 0xff);
        result[index++] = (bits & 0xff);
    }
    if (byteArrary[byteArrary.length - 2] === 61) {
        bits = (BASE64B[byteArrary[byteArrary.length - 4] - 43] & 0xff) << 6 | (BASE64B[byteArrary[byteArrary.length - 3] - 43] & 0xff);
        result[index] = ((bits >>> 4) & 0xff);
    } else if (byteArrary[byteArrary.length - 1] === 61) {
        bits = (BASE64B[byteArrary[byteArrary.length - 4] - 43] & 0xff) << 12 | (BASE64B[byteArrary[byteArrary.length - 3] - 43] & 0xff) << 6 | (BASE64B[byteArrary[byteArrary.length - 2] - 43] & 0xff);
        result[index++] = ((bits >>> 10) & 0xff);
        result[index] = ((bits >>> 2) & 0xff);
    } else {
        bits = (BASE64B[byteArrary[byteArrary.length - 4] - 43] & 0xff) << 18 | (BASE64B[byteArrary[byteArrary.length - 3] - 43] & 0xff) << 12 | (BASE64B[byteArrary[byteArrary.length - 2] - 43] & 0xff) << 6 | (BASE64B[byteArrary[byteArrary.length - 1] - 43] & 0xff);
        result[index++] = ((bits >>> 16) & 0xff);
        result[index++] = ((bits >>> 8) & 0xff);
        result[index] = (bits & 0xff);
    }
    return result;
}
