// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },

  devServer: {
    port: 4000,
  },

  modules: ["@element-plus/nuxt", "@pinia/nuxt", "nuxt-auth-sanctum"],
  elementPlus: {},

  pinia: {
    storesDirs: ["./stores/**"],
  },

  css: ["@/assets/app.css"],
  plugins: ["@/plugins/mask.js"],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      sanctum: {
        mode: "token",
        baseUrl: process.env.NUXT_PUBLIC_API_BASE, // NestJS API
        endpoints: {
          login: "/auth",
          logout: "/auth/logout",
          user: "/auth",
          csrf: "/auth/csrf",
        },
        csrf: {
          cookie: "_csrf",
          header: "_csrf",
        },
        redirect: {
          onLogout: "/login",
        },
        globalMiddleware: {
          enabled: true,
          allow404WithoutAuth: true,
        },
      },
    },
  },

  compatibilityDate: "2024-07-21",
});
