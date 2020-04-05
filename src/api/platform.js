import request from '@/utils/request'
// 获取列表
export function queryPlatform(url, query, data) {
  return request({
    url: '/platform/list' + url,
    method: 'get',
    params: query,
    data
  })
}
// 添加

export function addPlatform(url, query, data) {
  return request({
    url: '/platform/addPlatform' + url,
    method: 'post',
    params: query,
    data
  })
}

// 修改
export function updatePlatform(url, query, data) {
  return request({
    url: '/platform/updatePlatform/' + url,
    method: 'put',
    params: query,
    data
  })
}

// 添加或者删除的单个工作人员
export function setPlatformWorker(url, query, data) {
  return request({
    url: '/platform/setPlatformWorker/' + url,
    method: 'put',
    params: query,
    data
  })
}
// 直接重新设置的工作人员列表
export function setNewPlatformWorks(url, query, data) {
  return request({
    url: '/platform/setNewPlatformWorks/' + url,
    method: 'put',
    params: query,
    data
  })
}

// 获取的工作人员所在的校区
export function getPlatformOfManager(url, query, data) {
  return request({
    url: '/platform/getPlatformOfManager/' + url,
    method: 'get',
    params: query,
    data
  })
}
 
// 获取的某个校区的所有工作人员
export function getAllManagerOfPlatform(url, query, data) {
  return request({
    url: '/platform/getAllManagerOfPlatform/' + url,
    method: 'get',
    params: query,
    data
  })
}


// 设置的管理员
export function setPlatformMaster(url, query, data) {
  return request({
    url: '/platform/setPlatformMaster/' + url,
    method: 'put',
    params: query,
    data
  })
}
 