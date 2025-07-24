// 前端图片缓存服务
class ImageCacheClient {
  private dbName = 'feishu-image-cache';
  private storeName = 'images';
  private db: IDBDatabase | null = null;

  // 初始化IndexedDB
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // 生成缓存键
  private generateCacheKey(url: string): string {
    return btoa(url).replace(/[+/=]/g, '');
  }

  // 检查缓存是否存在并返回base64数据URL
  async getCachedImage(url: string): Promise<string | null> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve) => {
        // 如果是自定义图片键（以custom_开头），需要模糊匹配
        if (url.startsWith('custom_')) {
          const getAllRequest = store.getAll();
          getAllRequest.onsuccess = () => {
            const items = getAllRequest.result;
            const customItem = items.find(item => item.url.startsWith(url));
            if (customItem && customItem.blob) {
              // 转换为base64数据URL，避免blob URL失效问题
              const reader = new FileReader();
              reader.onload = () => {
                const base64Url = reader.result as string;
                console.log('从缓存获取自定义图片并转换为base64:', customItem.url);
                resolve(base64Url);
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(customItem.blob);
            } else {
              resolve(null);
            }
          };
          getAllRequest.onerror = () => resolve(null);
        } else {
          // 精确匹配
          const request = store.get(url);
          request.onsuccess = () => {
            const result = request.result;
            if (result && result.blob) {
              // 转换为base64数据URL，避免blob URL失效问题
              const reader = new FileReader();
              reader.onload = () => {
                const base64Url = reader.result as string;
                console.log('从缓存获取图片并转换为base64:', url);
                resolve(base64Url);
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(result.blob);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        }
      });
    } catch (error) {
      console.error('获取缓存图片失败:', error);
      return null;
    }
  }

  // 下载并缓存图片
  async downloadAndCache(imageUrl: string, accessToken?: string): Promise<string> {
    try {
      // 先检查缓存
      const cached = await this.getCachedImage(imageUrl);
      if (cached) {
        return cached;
      }

      console.log('开始下载图片:', imageUrl);
      
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

      // 转换为blob
      const blob = await response.blob();
      
      // 保存到缓存
      await this.saveToCache(imageUrl, '', blob);
      
      // 转换为base64数据URL返回
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Url = reader.result as string;
          console.log('图片下载并缓存成功:', imageUrl);
          resolve(base64Url);
        };
        reader.onerror = () => resolve(this.getPlaceholderImage());
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('图片下载失败:', imageUrl, error);
      // 返回占位图片
      return this.getPlaceholderImage();
    }
  }

  // 保存到缓存
  private async saveToCache(url: string, blobUrl: string, blob: Blob): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const cacheData = {
        url,
        blobUrl,
        blob,
        timestamp: Date.now(),
        size: blob.size,
        type: blob.type
      };
      
      store.put(cacheData);
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  }

  // 从本地文件缓存图片
  async cacheImageFromBlob(cacheKey: string, file: File): Promise<string> {
    try {
      // 保存到缓存
      await this.saveToCache(cacheKey, '', file);
      
      // 转换为base64数据URL返回
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Url = reader.result as string;
          console.log('本地图片缓存成功:', cacheKey);
          resolve(base64Url);
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('本地图片缓存失败:', error);
      throw error;
    }
  }

  // 获取占位图片
  private getPlaceholderImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjExMi41IiByPSI0MCIgZmlsbD0iIzlDOUM5OSIvPgo8cGF0aCBkPSJNMTgwIDEwMEwyMDAgODBMMjIwIDEwMFYxMjVIMTgwVjEwMFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjE5MCIgY3k9IjkwIiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIyMDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUM5Qzk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7muKnmmoLmj5LnlbbkuI3lj6/nlKg8L3RleHQ+Cjwvc3ZnPgo=';
  }

  // 清理缓存
  async clearCache(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // 不需要释放blob URL，因为我们现在使用base64数据URL
      
      // 清空存储
      store.clear();
      console.log('缓存清理完成');
    } catch (error) {
      console.error('清理缓存失败:', error);
    }
  }

  // 获取缓存统计
  async getCacheStats(): Promise<{ count: number; totalSize: number }> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const items = request.result;
          const totalSize = items.reduce((sum, item) => sum + (item.size || 0), 0);
          resolve({
            count: items.length,
            totalSize
          });
        };
        request.onerror = () => resolve({ count: 0, totalSize: 0 });
      });
    } catch (error) {
      return { count: 0, totalSize: 0 };
    }
  }

  // 清理过期缓存（超过7天）
  async cleanExpiredCache(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const range = IDBKeyRange.upperBound(sevenDaysAgo);
      
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          // 释放blob URL
          if (cursor.value.blobUrl) {
            URL.revokeObjectURL(cursor.value.blobUrl);
          }
          // 删除记录
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    }
  }
}

export const imageCacheClient = new ImageCacheClient();
export default imageCacheClient;