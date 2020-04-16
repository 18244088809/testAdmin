import { getCosTempKey } from "@/api/cos";
export default {
    uploadVideo: function (file,filename,progressFunc,finishFun) { 
        let res = await getCosTempKey("", {
            kind: "video",
            name: filename
        });
        var cos = new cosSDK({
            getAuthorization: function (options, callback) {
                callback({
                    TmpSecretId: res.data.Credentials.TmpSecretId,
                    TmpSecretKey: res.data.Credentials.TmpSecretKey,
                    XCosSecurityToken: res.data.Credentials.Token,
                    ExpiredTime: res.data.ExpiredTime
                });
            }
        }); 
        cos.putObject(
            {
                Bucket: res.data.Bucket,
                Region: res.data.Region,
                Key: filename,
                StorageClass: "STANDARD",
                Body: file.raw, // 上传文件对象
                onProgress: progressFunc(progressData),
            },
            finishFun (err, data),
        );
    }
}