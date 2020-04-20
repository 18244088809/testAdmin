import request from '@/utils/request'
 
// 轮播图 ，url填banner，优秀教师url填teacher
export function GetIndexItem(url, query, data) {
  return request({
    url: '/website/getIndexItem/' + url,
    method: 'get',
    params: query,
    data
  })
}


// 轮播图 ，url填banner，优秀教师url填teacher
export function SetIndexItem(url, query, data) {
  return request({
    url: '/website/setIndexItem/' + url,
    method: 'post',
    params: query,
    data
  })
}

  
//  
export function getWebSiteInfo(url, query, data) {
  return request({
    url: '/website/getWebSiteInfo/' + url,
    method: 'get',
    params: query,
    data
  })
}


//  
export function setWebSiteInfo(url, query, data) {
  return request({
    url: '/website/setWebSiteInfo/' + url,
    method: 'post',
    params: query,
    data
  })
}

 



