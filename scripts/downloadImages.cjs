const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// 飞书配置
const FEISHU_CONFIG = {
  appId: 'cli_a80ae9b92022500e',
  appSecret: 'geVSv8ztaIl1TghwF5YTTF37iy3Ef2ZO',
  baseId: 'Q5zmb2j53acAgts9nUPcJk3LnDh',
  tableId: 'tblYRp5M1mpFN5vQ',
  baseUrl: 'https://open.feishu.cn'
};

class FeishuImageDownloader {
  constructor() {
    this.cacheDir = path.join(__dirname, '..', 'public', 'cached-images');
    this.accessToken = null;
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  generateCacheKey(url) {
    return crypto.createHash('md5').update(url).digest('hex');
  }

  getFileExtension(url, contentType) {
    const urlExt = path.extname(new URL(url).pathname);
    if (urlExt) return urlExt;

    if (contentType) {
      const typeMap = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg'
      };
      return typeMap[contentType.toLowerCase()] || '.jpg';
    }

    return '.jpg';
  }

  async getAccessToken() {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        app_id: FEISHU_CONFIG.appId,
        app_secret: FEISHU_CONFIG.appSecret
      });

      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: '/open-apis/auth/v3/app_access_token/internal',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.code === 0) {
              this.accessToken = response.app_access_token;
              console.log('获取访问令牌成功');
              resolve(this.accessToken);
            } else {
              reject(new Error(`获取访问令牌失败: ${response.msg}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async getTableRecords() {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.code === 0 && response.data.items.length > 0) {
              const tableId = response.data.items[0].table_id;
              this.getRecords(tableId).then(resolve).catch(reject);
            } else {
              reject(new Error('获取表格信息失败'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async getRecords(tableId) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.baseId}/tables/${tableId}/records`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.code === 0) {
              resolve(response.data.items);
            } else {
              reject(new Error(`获取记录失败: ${response.msg}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  extractImageUrls(records) {
    const imageUrls = [];
    
    records.forEach(record => {
      const fields = record.fields;
      
      // 查找图片字段
      Object.keys(fields).forEach(key => {
        const value = fields[key];
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item && typeof item === 'object' && item.file_token) {
              const imageUrl = `${FEISHU_CONFIG.baseUrl}/open-apis/drive/v1/medias/${item.file_token}/download`;
              imageUrls.push({
                url: imageUrl,
                token: item.file_token,
                recordId: record.record_id,
                fieldKey: key
              });
            }
          });
        }
      });
    });
    
    return imageUrls;
  }

  async downloadImage(imageInfo) {
    const { url, token } = imageInfo;
    const cacheKey = this.generateCacheKey(url);
    
    // 检查是否已缓存
    const existingFile = this.findCachedFile(cacheKey);
    if (existingFile) {
      console.log(`图片已缓存: ${existingFile}`);
      return `/cached-images/${existingFile}`;
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: `/open-apis/drive/v1/medias/${token}/download`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`下载失败: ${res.statusCode}`));
          return;
        }

        const contentType = res.headers['content-type'];
        const extension = this.getFileExtension(url, contentType);
        const filename = `${cacheKey}${extension}`;
        const filepath = path.join(this.cacheDir, filename);

        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          console.log(`图片下载成功: ${filename}`);
          resolve(`/cached-images/${filename}`);
        });

        fileStream.on('error', reject);
      });

      req.on('error', reject);
      req.end();
    });
  }

  findCachedFile(cacheKey) {
    try {
      const files = fs.readdirSync(this.cacheDir);
      return files.find(file => file.startsWith(cacheKey)) || null;
    } catch (error) {
      return null;
    }
  }

  async downloadAllImages() {
    try {
      console.log('开始获取飞书数据...');
      const records = await this.getTableRecords();
      console.log(`获取到 ${records.length} 条记录`);
      
      const imageUrls = this.extractImageUrls(records);
      console.log(`找到 ${imageUrls.length} 张图片`);
      
      const downloadPromises = imageUrls.map(async (imageInfo, index) => {
        try {
          console.log(`下载图片 ${index + 1}/${imageUrls.length}: ${imageInfo.token}`);
          const localUrl = await this.downloadImage(imageInfo);
          return {
            ...imageInfo,
            localUrl
          };
        } catch (error) {
          console.error(`下载图片失败 ${imageInfo.token}:`, error.message);
          return {
            ...imageInfo,
            error: error.message
          };
        }
      });
      
      const results = await Promise.all(downloadPromises);
      
      // 保存映射文件
      const mapping = {};
      results.forEach(result => {
        if (result.localUrl) {
          mapping[result.url] = result.localUrl;
          mapping[result.token] = result.localUrl;
        }
      });
      
      const mappingPath = path.join(this.cacheDir, 'image-mapping.json');
      fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
      
      console.log('\n=== 下载完成 ===');
      console.log(`成功下载: ${results.filter(r => r.localUrl).length} 张`);
      console.log(`下载失败: ${results.filter(r => r.error).length} 张`);
      console.log(`映射文件保存至: ${mappingPath}`);
      
      return results;
      
    } catch (error) {
      console.error('下载过程出错:', error);
      throw error;
    }
  }
}

// 执行下载
if (require.main === module) {
  const downloader = new FeishuImageDownloader();
  downloader.downloadAllImages()
    .then(() => {
      console.log('所有图片下载完成！');
      process.exit(0);
    })
    .catch(error => {
      console.error('下载失败:', error);
      process.exit(1);
    });
}

module.exports = FeishuImageDownloader;