module.exports = {
  title: "POTATO BLOG",
  description: 'Welcome To My Blog',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no'}],
    ['meta', {name: 'referrer', content:'no-referrer'}]
  ],
  plugins: {
    "vuepress-plugin-auto-sidebar": {
      collapse: {
        open: true
      }
    },
    "vuepress-plugin-nuggets-style-copy": {
      copyText: "copy",
      tip: {
        content: "复制成功!"
      }
    }
  },
  themeConfig: {
    subSidebar: 'auto',
    noFoundPageByTencent: false,
    nav: [
      { text: 'Home', link: '/', icon: 'reco-home' },
      { text: 'Archive', link: '/archive/', icon: 'reco-date' },
      { text: 'GitHub', link: 'https://github.com/pppotato', icon: 'reco-github'}
    ],
    type: 'blog',
    // 博客设置
    blogConfig: {
      category: {
        location: 2, // 在导航栏菜单中所占的位置，默认2
        text: 'Category' // 默认 “分类”
      },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: 'Tag' // 默认 “标签”
      }
    },
    logo: '/logo.png',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // 自动形成侧边导航
    // sidebar: 'auto',
    // 最后更新时间
    lastUpdated: 'Last Updated',
    // 作者
    author: 'potato',
    // 作者头像
    authorAvatar: '/avatar.png',
    // 项目开始时间
    startYear: '2019'
    /**
     * 密钥 (if your blog is private)
     */

    // keyPage: {
    //   keys: ['your password'],
    //   color: '#42b983',
    //   lineColor: '#42b983'
    // },

    /**
     * valine 设置 (if you need valine comment )
     */

    // valineConfig: {
    //   appId: '...',// your appId
    //   appKey: '...', // your appKey
    // }
  },
  markdown: {
    lineNumbers: true,
    extractHeaders: [ 'h2', 'h3', 'h4', 'h5', 'h6' ]
  }
}
