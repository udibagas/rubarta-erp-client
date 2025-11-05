<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Branding -->
    <div
      class="hidden lg:flex lg:w-1/2 branding-panel items-center justify-center p-12"
    >
      <div class="text-center text-white">
        <div class="mb-8">
          <img
            src="/images/logo.png"
            alt="Rubarta Logo"
            class="w-20 h-20 mx-auto mb-6! rounded-xl shadow-lg"
          />
          <h1 class="text-4xl font-bold mb-4">RUBARTA ERP</h1>
          <p class="text-xl opacity-90 mb-8">
            Streamline Your Business Operations
          </p>
        </div>

        <div class="space-y-6 text-left max-w-md">
          <div class="flex items-center space-x-4 group">
            <div
              class="shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-1">
                Business Management
              </h3>
              <p class="text-white/80 text-sm">
                Complete solution for all your business needs
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-4 group">
            <div
              class="shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-1">
                Analytics & Reports
              </h3>
              <p class="text-white/80 text-sm">
                Real-time insights and comprehensive reporting
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-4 group">
            <div
              class="shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-1">
                Secure Platform
              </h3>
              <p class="text-white/80 text-sm">
                Enterprise-grade security and reliability
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div
      class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-base-100"
    >
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <img
            src="/images/logo.png"
            alt="Rubarta Logo"
            class="w-16 h-16 mx-auto mb-4 rounded-lg"
          />
          <h1 class="text-2xl font-bold text-base-content">RUBARTA ERP</h1>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.branding-panel {
  background: linear-gradient(135deg, #019932 0%, #016928 50%, #014d1f 100%);
  position: relative;
  overflow: hidden;
}

.branding-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(
    circle at 30px 30px,
    rgba(255, 255, 255, 0.05) 1px,
    transparent 1px
  );
  background-size: 60px 60px;
  opacity: 0.4;
}

.branding-panel > div {
  position: relative;
  z-index: 1;
}

/* Add some subtle animations */
.branding-panel h1 {
  animation: fadeInUp 1s ease-out;
}

.branding-panel p {
  animation: fadeInUp 1s ease-out 0.2s both;
}

.branding-panel .space-y-6 > div {
  animation: fadeInLeft 1s ease-out both;
}

.branding-panel .space-y-6 > div:nth-child(1) {
  animation-delay: 0.4s;
}
.branding-panel .space-y-6 > div:nth-child(2) {
  animation-delay: 0.6s;
}
.branding-panel .space-y-6 > div:nth-child(3) {
  animation-delay: 0.8s;
}

/* Feature item hover effects */
.branding-panel .group:hover {
  transform: translateX(8px);
  transition: transform 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Enhanced logo styling */
.branding-panel img {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;
}

.branding-panel img:hover {
  transform: scale(1.05);
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .min-h-screen .w-full:last-child {
    background: linear-gradient(
      135deg,
      rgba(1, 153, 50, 0.05) 0%,
      rgba(1, 105, 40, 0.05) 100%
    );
  }
}
</style>
