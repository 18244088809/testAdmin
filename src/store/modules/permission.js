import { asyncRoutes, constantRoutes } from '@/router'
import Layout from '@/layout'
import store from '@/store'
/**
 * Use meta.role to determine if the current user has permission
 * @param role
 * @param route
 */
function hasPermission(role, route) { 
  if (route.meta && route.meta.roles) { 
    return route.meta.roles.includes(role)
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param role
 */
export function filterAsyncRoutes(routes, role) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(role, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, role)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise(async resolve => {
      if (!store.getters.manager.Tel) {
        await store.dispatch('manager/getInfo')
      }
      let accessedRoutes
      // if (store.getters.manager.role == 1) {
      //   // 分校工作员
      //   accessedRoutes = asyncRoutes || []
      // } else {
        // 管理员
        accessedRoutes = filterAsyncRoutes(asyncRoutes, store.getters.manager.Role)
      // }

      // const topPlatformRoute = {
      //   path: '/platform',
      //   component: Layout,
      //   redirect: 'noRedirect',
      //   alwaysShow: true,
      //   name: 'platform',
      //   meta: {
      //     title: 'platform',
      //     icon: 'nested'
      //   },
      //   children: [
      //   ]
      // }
      let myPlatformList = store.getters.manager.myPlatformList;  
      if (myPlatformList) {
        let index = 0;
        myPlatformList.forEach(platform => {
          index++;
          const platformRoute = {
            path: '/platform/' + index.toString(10),// platform.Id,
            redirect: 'noRedirect',
            component: Layout,
            name: platform.Id,
            meta: { title: platform.Label, icon: "platform" },
            children: [
              {
                path: 'web',
                redirect: 'noRedirect',
                component: () => import('@/views/platform/web/container'), // Parent router-view
                name: 'web' + platform.Id.toString(10),
                meta: { title: 'web', icon: "website" },
                children: [
                  {
                    path: 'setting/' + platform.Id.toString(10),
                    name: 'setting' + index.toString(10),
                    component: () => import('@/views/platform/web/setting'),
                    meta: { title: 'setting', icon: "nested" }
                  },
                  {
                    path: 'banner/' + platform.Id.toString(10),
                    component: () => import('@/views/platform/web/banner'),
                    name: 'banner' + index.toString(10),
                    meta: { title: 'banner', icon: "banner" }
                  },
                  {
                    path: 'docDownload/' + platform.Id.toString(10),
                    name: 'docDownload' + index.toString(10),
                    component: () => import('@/views/platform/web/docDownload'),
                    meta: { title: 'docDownload', icon: "download" }
                  },
                  {
                    path: 'news/' + platform.Id.toString(10),
                    name: 'newsList' + index.toString(10),
                    component: () => import('@/views/platform/web/news'),
                    meta: { title: 'news', icon: "news" }
                  },
                 
                  {
                    path: 'business/' + platform.Id.toString(10),
                    name: 'business' + index.toString(10),
                    component: () => import('@/views/platform/web/business'),
                    meta: { title: 'business', icon: "table" }
                  },
                  {
                    path: 'teacher/' + platform.Id.toString(10),
                    name: 'teacher' + index.toString(10),
                    component: () => import('@/views/platform/web/teacher'),
                    meta: { title: 'teacher', icon: "hotteacher" }
                  },
                  {
                    path: 'honor/' + platform.Id.toString(10),
                    name: 'honor' + index.toString(10),
                    component: () => import('@/views/platform/web/honor'),
                    meta: { title: 'honorList', icon: "star" }
                  },
                  
                  {
                    path: 'linker/' + platform.Id.toString(10),
                    name: 'linker' + index.toString(10),
                    component: () => import('@/views/platform/web/linker'),
                    meta: { title: 'linker', icon: "linker" }
                  }
                ]
              },
              {
                path: 'managers/' + platform.Id,
                component: () => import('@/views/manager/managerlist'),
                name: 'managerList' + index.toString(10),
                meta: { title: 'managerList', icon: "user" },

              }
              ,
              {
                path: 'list/' + platform.Id,
                component: () => import('@/views/student/studentList'),
                name: 'customList' + index.toString(10),
                meta: { title: 'platformCustom', icon: 'student' }
              },
              {
                path: 'classList/' + platform.Id,
                component: () => import('@/views/platform/classList'), // Parent router-view
                name: "classList" + index.toString(10),
                meta: { title: "classList", icon: "platform" }
              },
              {
                path: 'contractList/' + platform.Id,
                component: () => import('@/views/student/contractList'),
                name: 'contractList' + index.toString(10),
                meta: { title: 'contractList', icon: 'contract' }
              }, {
                path: 'guest/' + platform.Id,
                name: 'guest' + index.toString(10),
                component: () => import('@/views/platform/guest'),
                meta: { title: 'guest', icon: "wechat" }
              } 
            ]
          }
          accessedRoutes.push(platformRoute) 
        })
      }
      // accessedRoutes.push(topPlatformRoute)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
