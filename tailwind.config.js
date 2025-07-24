/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // 温暖共鸣派配色方案
        primary: {
          DEFAULT: "#D49A6A", // 焦糖棕：按钮、链接、强调文字
          dark: "#BF5A3C", // 深焦糖：链接、按钮 hover/active
        },
        background: {
          DEFAULT: "#F9F6F2", // 浅米白：页面大面积底色
        },
        accent: {
          DEFAULT: "#A86B5A", // 手写强调：标题底纹、装饰波浪线
          mint: "#719E91", // 柔和薄荷绿：次要按钮、标签背景
        },
        text: {
          primary: "#333333", // 深灰黑：主体内容文字
          secondary: "#666666", // 中灰：次级文本、注释
        },
        warning: "#E06C75", // 柔和红：错误提示
      },
      fontFamily: {
        serif: ['Georgia', 'serif'], // Logo和标题
        sans: ['Roboto', 'sans-serif'], // 正文
      },
      fontSize: {
        'logo': '2rem',
        'hero-title': '2.5rem',
        'hero-subtitle': '1.75rem',
        'card-title': '1.25rem',
        'card-text': '0.875rem',
        'card-tag': '0.75rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
