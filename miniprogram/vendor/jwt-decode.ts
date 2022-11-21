
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
export const weBtoa = (str: string) => {
    const string = String(str);
    let bitmap, a, b, c, result = "", i = 0, rest = string.length % 3;
    for (; i < string.length;) {
        if ((a = string.charCodeAt(i++)) > 255 ||
            (b = string.charCodeAt(i++)) > 255 ||
            (c = string.charCodeAt(i++)) > 255)
            throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");
        bitmap = (a << 16) | (b << 8) | c;
        result += b64.charAt(bitmap >> 18 & 63) + b64.charAt(bitmap >> 12 & 63) +
            b64.charAt(bitmap >> 6 & 63) + b64.charAt(bitmap & 63);
    }
    return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
};

export const weAtob = (str: string) => {
    let string = String(str).replace(/[\t\n\f\r ]+/g, "");
    if (!b64re.test(string))
        throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    string += "==".slice(2 - (string.length & 3));
    let bitmap, result = "", r1, r2, i = 0;
    for (; i < string.length;) {
        bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12 |
            (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));
        result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255) :
            r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255) :
                String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    return result;
};


export const b64DecodeUnicode = (str: string) => {
    return decodeURIComponent(exports.weAtob(str).replace(/(.)/g, function (p: string) {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = "0" + code;
        }
        return "%" + code;
    }));
}
export const base64_url_decode = (str: string) => {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw "Illegal base64url string!";
    }
    try {
        return b64DecodeUnicode(output);
    }
    catch (err) {
        return exports.weAtob(output);
    }
}

export interface JwtDecodeOptionProp {
    header?: boolean
}

export interface JwtResult {
    alg: string,
    typ: string,
    id?: string,
    sub?: string,
    userId?: string,
    iat: number,
    exp: number,
    [key: string]: any
}

export const jwtDecode = (token: string, opt?: JwtDecodeOptionProp) => {
    if (typeof token !== "string") {
        throw ("Invalid token specified");
    }
    let options = opt || {};
    let pos = options.header === true ? 0 : 1;
    try {
        return JSON.parse(base64_url_decode(token.split(".")[pos])) as JwtResult;
    }
    catch (e) {
        throw ("Invalid token specified: " + e.message);
    }
}

export default jwtDecode