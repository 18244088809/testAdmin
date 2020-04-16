
import Http from './ImgHttp'
const ImgAPI = {
    //   图片上传
    UploadImg: (urlParams, file, config) => Http("post", '/helper/uploadFile/' + urlParams, file, config),
    //上传到 cos 服务器
    UploadCOS: (urlParams, file, config) => Http("post", '/helper/uploadFile/' + urlParams, file, config),
    
}
export default ImgAPI

