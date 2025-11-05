import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },

  devServer: {
    port: 4000,
  },

  modules: ["@element-plus/nuxt", "@pinia/nuxt"],
  elementPlus: {},

  pinia: {
    storesDirs: ["./stores/**"],
  },

  app: {
    head: {
      title: "Rubarta ERP System",
      link: [{ rel: "icon", type: "image/x-icon", href: "/images/logo.png" }],
    },
  },

  css: ["@/assets/app.css"],
  plugins: [],

  runtimeConfig: {
    public: {
      apiBase: import.meta.env.VITE_API_URL,
    },
  },

  compatibilityDate: "2024-07-21",

  alias: {
    dayjs: "dayjs",
  },
});
