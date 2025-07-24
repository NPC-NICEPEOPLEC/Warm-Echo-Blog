import { useState, useEffect } from 'react';
import { Article } from '@/components/ArticleCard';
import feishuApi from '@/services/feishuApi';
import { toast } from 'sonner';

interface UseFeishuDataReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 模拟数据作为fallback
const fallbackArticles: Article[] = [
  {
    id: "fallback-1",
    title: "城市里的温暖瞬间：陌生人的善意如何点亮我们的心",
    summary: "在这个快节奏的都市生活中，我们常常被工作和生活的压力所包围，很容易忽略身边那些微小却珍贵的温暖瞬间。今天想和大家分享一些关于陌生人善意的故事，这些看似平凡的举动，却能在不经意间点亮我们内心最柔软的角落。",
    quote: "最美的风景，不是远山近水，而是人与人之间的温暖相遇。",
    tags: ["共情", "关怀", "日常"],
    originalLink: "https://example.com/article1",
    content: "在这个快节奏的都市生活中，我们常常被工作和生活的压力所包围，很容易忽略身边那些微小却珍贵的温暖瞬间。\n\n今天想和大家分享一些关于陌生人善意的故事，这些看似平凡的举动，却能在不经意间点亮我们内心最柔软的角落。",
    emotionImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f3e8ff'/%3E%3Ctext x='400' y='225' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='24' fill='%23a855f7'%3E温暖城市瞬间%3C/text%3E%3C/svg%3E"
  },
  {
    id: "fallback-2",
    title: "当代年轻人的情感困境：在快节奏中寻找内心的平静",
    summary: "现代社会的快节奏生活让许多年轻人感到焦虑和迷茫。社交媒体的普及让我们看似更加连接，却也带来了前所未有的孤独感。如何在这个充满变化的时代中找到内心的平静，成为了每个人都需要面对的课题。",
    quote: "真正的成长，是学会在喧嚣中保持内心的宁静。",
    tags: ["情感", "成长", "反思"],
    originalLink: "https://example.com/article2",
    content: "现代社会的快节奏生活让许多年轻人感到焦虑和迷茫。\n\n社交媒体的普及让我们看似更加连接，却也带来了前所未有的孤独感。如何在这个充满变化的时代中找到内心的平静，成为了每个人都需要面对的课题。",
    emotionImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23fce7f3'/%3E%3Ctext x='400' y='225' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='24' fill='%23ec4899'%3E内心平静%3C/text%3E%3C/svg%3E"
  },
  {
    id: "fallback-3",
    title: "家庭聚餐背后的人情世故：三代人的情感交流密码",
    summary: "每逢佳节倍思亲，家庭聚餐不仅仅是一顿饭那么简单。在餐桌上，三代人有着不同的表达方式和情感需求。理解这些微妙的人情世故，能让我们更好地维系家庭关系，传承温暖的家庭文化。",
    quote: "家的温暖，藏在每一次用心准备的团圆饭里。",
    tags: ["家庭", "传统", "理解"],
    originalLink: "https://example.com/article3",
    content: "每逢佳节倍思亲，家庭聚餐不仅仅是一顿饭那么简单。\n\n在餐桌上，三代人有着不同的表达方式和情感需求。理解这些微妙的人情世故，能让我们更好地维系家庭关系，传承温暖的家庭文化。",
    emotionImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23fef3c7'/%3E%3Ctext x='400' y='225' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='24' fill='%23f59e0b'%3E家庭温暖%3C/text%3E%3C/svg%3E"
  }
];

export function useFeishuData(): UseFeishuDataReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('开始获取飞书数据...');
      console.log('环境变量检查:');
      console.log('- VITE_FEISHU_APP_ID:', import.meta.env.VITE_FEISHU_APP_ID);
      console.log('- VITE_FEISHU_APP_SECRET:', import.meta.env.VITE_FEISHU_APP_SECRET ? '已设置' : '未设置');
      console.log('- VITE_FEISHU_BASE_ID:', import.meta.env.VITE_FEISHU_BASE_ID);
      console.log('- VITE_FEISHU_TABLE_ID:', import.meta.env.VITE_FEISHU_TABLE_ID);
      
      const data = await feishuApi.getTableRecords();
      
      if (data && data.length > 0) {
        setArticles(data);
        toast.success(`成功获取飞书数据，共 ${data.length} 条记录`);
      } else {
        // 如果飞书返回空数据，使用fallback数据
        setArticles(fallbackArticles);
        toast.info('飞书数据为空，使用默认数据');
      }
    } catch (err) {
      console.error('获取飞书数据失败:', err);
      
      let errorMessage = '获取数据失败';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // 检查是否是CORS错误
        if (err.message.includes('CORS') || err.message.includes('Access-Control')) {
          errorMessage = 'CORS跨域错误：前端无法直接访问飞书API，需要后端代理';
        }
        // 检查是否是网络错误
        else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = '网络连接错误：请检查网络连接或飞书API是否可访问';
        }
        // 检查是否是权限错误
        else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = '权限错误：请检查飞书应用权限配置（bitable:app, bitable:record:read）';
        }
        // 检查是否是认证错误
        else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = '认证错误：请检查APP_ID和APP_SECRET是否正确';
        }
        // 检查是否是资源不存在错误
        else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = '资源不存在：请检查BASE_ID和TABLE_ID是否正确';
        }
      }
      
      setError(errorMessage);
      
      // 出错时使用fallback数据
      setArticles(fallbackArticles);
      toast.error(`飞书数据获取失败：${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    refetch
  };
}