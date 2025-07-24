import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
  server: {
    proxy: {
      '/api/feishu': {
        target: 'https://open.feishu.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/feishu/, '/open-apis'),
        headers: {
          'Origin': 'https://open.feishu.cn',
          'Referer': 'https://open.feishu.cn',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('代理响应:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/feishu-media': {
        target: 'https://open.feishu.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // 保留URL参数（包括access_token）
          const newPath = path.replace(/^\/api\/feishu-media/, '/open-apis');
          console.log('媒体代理路径重写:', path, '->', newPath);
          return newPath;
        },
        headers: {
          'Origin': 'https://open.feishu.cn',
          'Referer': 'https://open.feishu.cn',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('媒体代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('媒体代理响应:', proxyRes.statusCode, req.url, 'Content-Type:', proxyRes.headers['content-type']);
            
            // 设置CORS头以允许跨域访问
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            // 确保图片内容类型正确传递
            if (proxyRes.headers['content-type']) {
              res.setHeader('Content-Type', proxyRes.headers['content-type']);
            }
            
            // 设置缓存控制
            res.setHeader('Cache-Control', 'public, max-age=3600');
          });
          proxy.on('error', (err, req, res) => {
            console.log('媒体代理错误:', err.message);
          });
        }
      }
    }
  }
})
