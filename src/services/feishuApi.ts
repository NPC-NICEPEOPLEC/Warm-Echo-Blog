import { FEISHU_CONFIG, FIELD_MAPPING } from '@/config/feishu';
import { Article } from '@/components/ArticleCard';

// 飞书API响应类型
interface FeishuTokenResponse {
  code: number;
  msg: string;
  app_access_token: string;
  expire: number;
}

interface FeishuRecord {
  record_id: string;
  fields: Record<string, any>;
  created_time: number;
  last_modified_time: number;
}

interface FeishuRecordsResponse {
  code: number;
  msg: string;
  data: {
    items: FeishuRecord[];
    page_token?: string;
    has_more: boolean;
    total: number;
  };
}

class FeishuApiService {
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  // 获取应用访问令牌
  async getAccessToken(): Promise<string> {
    // 检查token是否还有效
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      console.log('使用缓存的访问令牌');
      return this.accessToken;
    }

    console.log('开始获取飞书访问令牌...');
    console.log('APP_ID:', FEISHU_CONFIG.APP_ID);
    console.log('APP_SECRET:', FEISHU_CONFIG.APP_SECRET ? '已配置' : '未配置');

    try {
      const requestBody = {
        app_id: FEISHU_CONFIG.APP_ID,
        app_secret: FEISHU_CONFIG.APP_SECRET
      };
      
      console.log('请求体:', requestBody);
      
      // 使用代理路径避免CORS问题
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(`/api/feishu${FEISHU_CONFIG.TOKEN_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Token请求响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token请求失败响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: FeishuTokenResponse = await response.json();
      console.log('Token响应数据:', data);
      
      if (data.code !== 0) {
        console.error('飞书API返回错误:', data);
        throw new Error(`Feishu API error: ${data.msg} (code: ${data.code})`);
      }

      this.accessToken = data.app_access_token;
      // 提前5分钟过期，确保token有效性
      this.tokenExpireTime = Date.now() + (data.expire - 300) * 1000;
      
      console.log('成功获取访问令牌，过期时间:', new Date(this.tokenExpireTime));
      return this.accessToken;
    } catch (error) {
      console.error('获取飞书访问令牌失败:', error);
      if (error.name === 'AbortError') {
        throw new Error('飞书API请求超时，请检查网络连接');
      }
      throw error;
    }
  }

  // 获取多维表格记录
  async getTableRecords(): Promise<Article[]> {
    try {
      console.log('开始获取飞书表格数据...');
      const token = await this.getAccessToken();
      
      // 使用代理路径避免CORS问题
      const url = `/api/feishu${FEISHU_CONFIG.RECORDS_URL}`
        .replace('{app_token}', FEISHU_CONFIG.BASE_ID)
        .replace('{table_id}', FEISHU_CONFIG.TABLE_ID);
      
      console.log('请求URL:', url);
      console.log('访问令牌:', token);

      console.log('请求URL:', url);
      console.log('BASE_ID:', FEISHU_CONFIG.BASE_ID);
      console.log('TABLE_ID:', FEISHU_CONFIG.TABLE_ID);
      console.log('使用Token:', token ? '已获取' : '未获取');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('表格数据请求响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('表格数据请求失败响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data: FeishuRecordsResponse = await response.json();
      console.log('表格数据响应:', data);
      
      if (data.code !== 0) {
        console.error('飞书表格API返回错误:', data);
        throw new Error(`Feishu API error: ${data.msg} (code: ${data.code})`);
      }

      console.log('获取到记录数量:', data.data.items.length);
      console.log('原始记录数据:', data.data.items);

      // 转换飞书数据为Article格式
      const articles = this.transformRecordsToArticles(data.data.items);
      console.log('转换后的文章数据:', articles);
      
      return articles;
    } catch (error) {
      console.error('获取飞书表格数据失败:', error);
      throw error;
    }
  }

  // 提取富文本字段的纯文本内容
  private extractTextFromRichText(field: any): string {
    if (!field) return '';
    
    // 如果是字符串，直接返回
    if (typeof field === 'string') {
      return field;
    }
    
    // 如果是数组（富文本格式）
    if (Array.isArray(field)) {
      return field.map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.text) {
          return item.text;
        }
        return '';
      }).join('');
    }
    
    // 如果是对象且有text属性
    if (typeof field === 'object' && field.text) {
      return field.text;
    }
    
    // 其他情况返回空字符串
    return '';
  }

  // 提取图片字段的URL
  private extractImageUrl(field: any): string {
    console.log('extractImageUrl 输入参数:', field);
    console.log('参数类型:', typeof field);
    
    if (!field) {
      console.log('字段为空，返回空字符串');
      return '';
    }
    
    // 如果是字符串（直接的URL）
    if (typeof field === 'string') {
      console.log('字段是字符串，直接返回:', field);
      // 如果是飞书的媒体URL，转换为代理URL
      if (field.includes('open.feishu.cn')) {
        const proxyUrl = field.replace('https://open.feishu.cn/open-apis', '/api/feishu-media');
        console.log('转换为代理URL:', proxyUrl);
        return proxyUrl;
      }
      return field;
    }
    
    // 如果是数组（附件格式）
    if (Array.isArray(field)) {
      console.log('字段是数组，长度:', field.length);
      if (field.length > 0) {
        const firstItem = field[0];
        console.log('数组第一项:', firstItem);
        if (firstItem && typeof firstItem === 'object') {
          // 飞书附件格式可能包含url、tmp_url等字段
          let url = firstItem.url || firstItem.tmp_url || firstItem.preview_url || '';
          console.log('从对象中提取的URL:', url);
          // 如果是飞书的媒体URL，转换为代理URL
          if (url && url.includes('open.feishu.cn')) {
            url = url.replace('https://open.feishu.cn/open-apis', '/api/feishu-media');
            console.log('转换为代理URL:', url);
          }
          return url;
        }
      }
    }
    
    // 如果是对象且包含URL相关字段
    if (typeof field === 'object') {
      console.log('字段是对象:', field);
      let url = field.url || field.tmp_url || field.preview_url || '';
      console.log('从对象中提取的URL:', url);
      // 如果是飞书的媒体URL，转换为代理URL
      if (url && url.includes('open.feishu.cn')) {
        url = url.replace('https://open.feishu.cn/open-apis', '/api/feishu-media');
        console.log('转换为代理URL:', url);
      }
      return url;
    }
    
    console.log('无法提取URL，返回空字符串');
    return '';
  }

  // 获取带认证的图片URL
  async getAuthenticatedImageUrl(imageUrl: string): Promise<string> {
    if (!imageUrl || !imageUrl.startsWith('/api/feishu-media')) {
      return imageUrl;
    }
    
    try {
      const token = await this.getAccessToken();
      console.log('获取到访问令牌，准备请求图片:', imageUrl);
      
      // 直接使用带认证参数的URL，避免blob URL的生命周期问题
      const authenticatedUrl = `${imageUrl}?access_token=${token}`;
      console.log('生成认证URL:', authenticatedUrl);
      
      // 验证URL是否可访问
      try {
        const testResponse = await fetch(authenticatedUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          return authenticatedUrl;
        }
      } catch (testError) {
        console.warn('URL验证失败，但仍返回认证URL:', testError);
      }
      
      return authenticatedUrl;
    } catch (error) {
      console.error('获取认证图片失败:', error);
      // 如果所有方法都失败，返回一个占位图片
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTEyLjVMMTc1IDg3LjVIMTUwVjEzNy41SDE3NUwyMDAgMTEyLjVaIiBmaWxsPSIjOUM5Qzk5Ii8+CjxwYXRoIGQ9Ik0yMjUgODcuNUgyNTBWMTM3LjVIMjI1VjEyNUwyMDAgMTEyLjVMMjI1IDEwMFY4Ny41WiIgZmlsbD0iIzlDOUM5OSIvPgo8dGV4dCB4PSIyMDAiIHk9IjE2NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUM5Qzk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7muKnmmoLmj5LnlbbkuI3lj6/nlKg8L3RleHQ+Cjwvc3ZnPgo=';
    }
  }

  // 转换飞书记录为Article格式
  private transformRecordsToArticles(records: FeishuRecord[]): Article[] {
    console.log('开始转换记录，字段映射:', FIELD_MAPPING);
    
    return records.map((record, index) => {
      const fields = record.fields;
      console.log(`记录 ${index + 1} 的字段:`, Object.keys(fields));
      console.log(`记录 ${index + 1} 的完整数据:`, fields);
      
      // 处理标签字段（可能是数组或字符串）
      let tags: string[] = [];
      const tagsField = fields[FIELD_MAPPING.tags];
      console.log('标签字段值:', tagsField);
      
      if (Array.isArray(tagsField)) {
        tags = tagsField.map(tag => typeof tag === 'string' ? tag : tag.text || '');
      } else if (typeof tagsField === 'string') {
        tags = tagsField.split(',').map(tag => tag.trim());
      }

      // 专门调试emotionImage字段
      const emotionImageField = fields[FIELD_MAPPING.emotionImage];
      console.log(`记录 ${index + 1} 的情绪配图字段原始数据:`, emotionImageField);
      const extractedImageUrl = this.extractImageUrl(emotionImageField);
      console.log(`记录 ${index + 1} 提取的图片URL:`, extractedImageUrl);

      const article = {
        id: record.record_id || `article-${index + 1}`,
        title: this.extractTextFromRichText(fields[FIELD_MAPPING.title]) || '未命名文章',
        summary: this.extractTextFromRichText(fields[FIELD_MAPPING.summary]) || '暂无摘要',
        quote: this.extractTextFromRichText(fields[FIELD_MAPPING.quote]) || '暂无金句',
        tags: tags.length > 0 ? tags : ['默认'],
        originalLink: this.extractTextFromRichText(fields[FIELD_MAPPING.originalLink]) || '#',
        content: this.extractTextFromRichText(fields[FIELD_MAPPING.content]) || '暂无内容',
        emotionImage: extractedImageUrl || ''
      };
      
      console.log(`转换后的文章 ${index + 1}:`, article);
      return article;
    });
  }
}

// 导出单例实例
export const feishuApi = new FeishuApiService();
export default feishuApi;