<template>
  <div class="common-layout">
    <el-container>
      <el-aside :width="collapse ? '80px' : '280px'" class="sidebar-container">
        <!-- User Profile Section -->
        <div v-show="!collapse" class="user-profile">
          <div class="user-avatar">
            <el-avatar :size="48" class="user-avatar-img">
              {{ user?.name?.[0]?.toUpperCase() || "U" }}
            </el-avatar>
          </div>
          <div class="user-info">
            <p class="user-name">{{ user?.name || "User" }}</p>
            <p class="user-email">{{ user?.email || "user@example.com" }}</p>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="navigation-section">
          <Menu :collapse="collapse" />
        </div>
      </el-aside>

      <el-container>
        <el-header class="flex items-center gap-4 px-4! shadow-sm">
          <el-button
            :icon="collapse ? ChevronRight : ChevronLeft"
            @click="collapse = !collapse"
            circle
          />
          <Navbar :collapse="collapse" @toggle="collapse = !collapse" />
        </el-header>

        <el-main class="main-container">
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const { user } = useAuth();
const collapse = ref(false);
</script>

<style scoped>
/* Layout Variables */
:root {
  --primary-color: #019932;
  --primary-dark: #016928;
  --sidebar-bg: #ffffff;
  --sidebar-border: #e5e7eb;
  --header-bg: #ffffff;
  --content-bg: #f8fafc;
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Main Layout Container */
.common-layout {
  height: 100vh;
  background: var(--content-bg);
}

/* Element Plus Container Overrides */
:deep(.el-container) {
  height: 100vh;
}

:deep(.el-aside) {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-header) {
  background: var(--header-bg);
  border-bottom: 1px solid var(--sidebar-border);
  box-shadow: var(--shadow-sm);
  padding: 0;
}

:deep(.el-main) {
  background: var(--content-bg);
  padding: 2rem;
}

/* Sidebar Container */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* User Profile Section */
.user-profile {
  padding: 1.5rem;
  border-bottom: 1px solid var(--sidebar-border);
  background: #fafafa;
}

.user-profile .user-avatar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.user-avatar-img {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.user-info {
  text-align: center;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Navigation Section */
.navigation-section {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.navigation-section::-webkit-scrollbar {
  width: 6px;
}

.navigation-section::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.navigation-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.navigation-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.toggle-btn {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Main Container */
.main-container {
  overflow-y: auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
  :deep(.el-aside) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 200;
    transform: translateX(-100%);
  }

  :deep(.el-aside:not(.collapsed)) {
    transform: translateX(0);
  }

  .header-content {
    padding: 0 1rem;
  }

  :deep(.el-main) {
    padding: 1rem;
  }

  .content-wrapper {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .header-left {
    gap: 1rem;
  }

  :deep(.el-main) {
    padding: 0.5rem;
  }

  .content-wrapper {
    padding: 1rem;
    border-radius: 8px;
  }
}

/* Animation Classes */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Custom Element Plus Overrides for specific components */

/* Loading and Transitions */
.layout-transition-enter-active,
.layout-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-transition-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.layout-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
