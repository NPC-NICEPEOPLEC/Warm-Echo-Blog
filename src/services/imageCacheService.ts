import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class ImageCacheService {
  private cacheDir: string;
  private baseUrl: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'public', 'cached-images');
    this.baseUrl = '/cached-images';
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private generateCacheKey(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex');
  }

  private getFileExtension(url: string, contentType?: string): string {
    // 从URL中提取扩展名
    const urlExt = path.extname(new URL(url).pathname);
    if (urlExt) return urlExt;

    // 从Content-Type中推断扩展名
    if (contentType) {
      const typeMap: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg'
      };
      return typeMap[contentType.toLowerCase()] || '.jpg';
    }

    return '.jpg'; // 默认扩展名
  }

  async downloadAndCache(imageUrl: string, accessToken?: string): Promise<string> {
    try {
      const cacheKey = this.generateCacheKey(imageUrl);
      
      // 检查是否已缓存
      const existingFile = this.findCachedFile(cacheKey);
      if (existingFile) {
        console.log(`图片已缓存: ${existingFile}`);
        return `${this.baseUrl}/${existingFile}`;
      }

      console.log(`开始下载图片: ${imageUrl}`);
      
      // 准备请求头
      const headers: HeadersInit = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // 下载图片
      const response = await fetch(imageUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      const extension = this.getFileExtension(imageUrl, contentType || undefined);
      const filename = `${cacheKey}${extension}`;
      const filepath = path.join(this.cacheDir, filename);

      // 保存文件
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));

      console.log(`图片下载成功: ${filename}`);
      return `${this.baseUrl}/${filename}`;

    } catch (error) {
      console.error(`图片下载失败: ${imageUrl}`, error);
      throw error;
    }
  }

  private findCachedFile(cacheKey: string): string | null {
    try {
      const files = fs.readdirSync(this.cacheDir);
      const cachedFile = files.find(file => file.startsWith(cacheKey));
      return cachedFile || null;
    } catch (error) {
      return null;
    }
  }

  getCachedImageUrl(originalUrl: string): string | null {
    const cacheKey = this.generateCacheKey(originalUrl);
    const cachedFile = this.findCachedFile(cacheKey);
    return cachedFile ? `${this.baseUrl}/${cachedFile}` : null;
  }

  clearCache(): void {
    try {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
      console.log('缓存清理完成');
    } catch (error) {
      console.error('清理缓存失败:', error);
    }
  }

  getCacheStats(): { count: number; totalSize: number } {
    try {
      const files = fs.readdirSync(this.cacheDir);
      let totalSize = 0;
      
      files.forEach(file => {
        const filepath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filepath);
        totalSize += stats.size;
      });

      return {
        count: files.length,
        totalSize
      };
    } catch (error) {
      return { count: 0, totalSize: 0 };
    }
  }
}

export const imageCacheService = new ImageCacheService();