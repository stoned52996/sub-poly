<template>
  <div class="app-container">
    <!-- 侧边导航栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <!-- Logo区域 -->
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Logo" class="logo" v-if="!isCollapsed" @click="toggleSidebar" />
        <span v-if="!isCollapsed" class="logo-text">多订阅聚合管理</span>
        <img src="@/assets/logo.png" alt="Logo" class="logo-small" v-else @click="toggleSidebar" />
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" active-class="active">
          <img src="@/assets/icons/home.svg" class="nav-icon" alt="home" />
          <span v-if="!isCollapsed" class="logo-text">首页</span>
        </router-link>
        <router-link to="/airport" class="nav-item" active-class="active">
          <img src="@/assets/icons/dashboard.svg" class="nav-icon" alt="airport" />
          <span v-if="!isCollapsed" class="logo-text">机场管理</span>
        </router-link>
        <router-link to="/rule" class="nav-item" active-class="active">
          <img src="@/assets/icons/analytics.svg" class="nav-icon" alt="rule" />
          <span v-if="!isCollapsed" class="logo-text">规则管理</span>
        </router-link>
        <router-link to="/group" class="nav-item" active-class="active">
          <img src="@/assets/icons/group.svg" class="nav-icon" alt="group" />
          <span v-if="!isCollapsed" class="logo-text">分组管理</span>
        </router-link>
        <router-link to="/config" class="nav-item" active-class="active">
          <img src="@/assets/icons/settings.svg" class="nav-icon" alt="settings" />
          <span v-if="!isCollapsed" class="logo-text">通用配置</span>
        </router-link>
        <router-link to="/sub" class="nav-item" active-class="active">
          <img src="@/assets/icons/link.svg" class="nav-icon" alt="sub" />
          <span v-if="!isCollapsed" class="logo-text">订阅生成</span>
        </router-link>
        <router-link to="/reset" class="nav-item" active-class="active">
          <img src="@/assets/icons/reset.svg" class="nav-icon" alt="sub" />
          <span v-if="!isCollapsed" class="logo-text">重置秘钥</span>
        </router-link>
        <div class="nav-divider"></div>
        <div class="nav-item logout-btn" @click="handleLogout">
          <img src="@/assets/icons/logout.svg" class="nav-icon" alt="logout" />
          <span v-if="!isCollapsed" class="logo-text">注销</span>
        </div>
      </nav>

      <!-- 收缩按钮 -->
      <div class="collapse-btn" @click="toggleSidebar">
        <img v-if="isCollapsed" src="@/assets/icons/chevron-right.svg" class="nav-icon" alt="expand" />
        <img v-else src="@/assets/icons/chevron-left.svg" class="nav-icon" alt="collapse" />
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 路由内容 -->
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isCollapsed: false,
      currentPageTitle: '首页'
    }
  },
  watch: {
    '$route'(to) {
      // 根据路由更新页面标题
      const routeTitles = {
        '/': '首页',
        '/airport': '机场管理',
        '/rule': '规则管理',
        '/group': '分组管理',
        '/config': '通用配置',
        '/sub': '订阅生成',
      };
      this.currentPageTitle = routeTitles[to.path] || '页面';
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    handleLogout() {
      console.log('logout')
      // 清除 localStorage 中的 token
      localStorage.removeItem('token');
      // 跳转到登录页面
      this.$router.push('/');
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  width: 250px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: fixed;
  /* 修改为固定定位 */
  left: 0;
  /* 将侧边栏固定在左侧 */
  top: 0;
  /* 确保侧边栏从顶部开始 */
  height: 100%;
  /* 使侧边栏占满整个页面高度 */
  z-index: 10;
}

.sidebar-collapsed {
  width: 64px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 16px;
  filter: brightness(0);
}

.collapse-icon {
  width: 10px;
  height: 10px;
  margin: 0;
  filter: invert(1);
  background-color: white;
}

.collapse-btn:hover .collapse-icon {
  filter: invert(37%) sepia(98%) saturate(2242%) hue-rotate(205deg) brightness(97%) contrast(85%);
}

.nav-item:hover .nav-icon {
  /* 鼠标悬停时改变颜色为蓝色 */
  filter: invert(37%) sepia(98%) saturate(2242%) hue-rotate(205deg) brightness(97%) contrast(85%);
}

.nav-item.active .nav-icon {
  /* 激活状态时改变颜色为蓝色 */
  filter: invert(37%) sepia(98%) saturate(2242%) hue-rotate(205deg) brightness(97%) contrast(85%);
}

/* 注销按钮的图标颜色 */
.logout-btn .nav-icon {
  filter: invert(36%) sepia(51%) saturate(3410%) hue-rotate(337deg) brightness(85%) contrast(84%);
}

.logout-btn:hover .nav-icon {
  filter: invert(11%) sepia(82%) saturate(5313%) hue-rotate(352deg) brightness(86%) contrast(91%);
}

.sidebar-collapsed .nav-icon {
  margin-right: 0;
}

.logo-container {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  max-height: 32px;
  max-width: 100%;
}

.logo-text {
  margin-left: 8px;
  white-space: nowrap;
}

.logo-small {
  max-height: 32px;
  max-width: 32px;
}

.nav-menu {
  flex: 1;
  padding: 8px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #5f6368;
  text-decoration: none;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #f1f3f4;
  color: #1a73e8;
}

.nav-item.active {
  background-color: #e8f0fe;
  color: #1a73e8;
}

.nav-item .material-icons {
  margin-right: 16px;
  font-size: 24px;
}

.sidebar-collapsed .nav-item .material-icons {
  margin-right: 0;
}

.collapse-btn {
  padding: 12px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  color: #5f6368;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.collapse-btn:hover {
  background-color: #f1f3f4;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.page-title h1 {
  font-size: 20px;
  font-weight: 500;
  color: #202124;
}

.toolbar-actions {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #5f6368;
}

.toolbar-btn:hover {
  background-color: #f1f3f4;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.nav-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 8px 16px;
}

.logout-btn {
  margin-top: auto !important;
  color: #d32f2f !important;
  cursor: pointer !important;
}

.logout-btn:hover {
  background-color: #ffebee !important;
  color: #b71c1c !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
    z-index: 1000;
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }

  .sidebar-collapsed.sidebar-open {
    transform: translateX(0);
  }
}
</style>