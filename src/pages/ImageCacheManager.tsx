import { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, Image, HardDrive } from 'lucide-react';
import Header from '@/components/Header';
import ImageUploadSection from '@/components/ImageUploadSection';
import imageCacheClient from '@/services/imageCacheClient';
import feishuApi from '@/services/feishuApi';
import { useFeishuData } from '@/hooks/useFeishuData';

interface ImageCacheManagerProps {
  onBack: () => void;
}

export default function ImageCacheManager({ onBack }: ImageCacheManagerProps) {
  const [cacheStats, setCacheStats] = useState({ count: 0, totalSize: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [showToast, setShowToast] = useState('');
  
  const { articles, loading, error } = useFeishuData();

  // 获取缓存统计
  const loadCacheStats = async () => {
    try {
      const stats = await imageCacheClient.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('获取缓存统计失败:', error);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 下载所有图片
  const downloadAllImages = async () => {
    if (!articles || articles.length === 0) {
      showToastMessage('没有找到需要下载的图片');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: 0 });

    try {
      // 获取访问令牌
      const accessToken = await feishuApi.getAccessToken();
      
      // 过滤出有图片的文章
      const articlesWithImages = articles.filter(article => article.emotionImage);
      setDownloadProgress({ current: 0, total: articlesWithImages.length });

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < articlesWithImages.length; i++) {
        const article = articlesWithImages[i];
        setDownloadProgress({ current: i + 1, total: articlesWithImages.length });
        
        try {
          console.log(`下载图片 ${i + 1}/${articlesWithImages.length}: ${article.title}`);
          await imageCacheClient.downloadAndCache(article.emotionImage, accessToken);
          successCount++;
        } catch (error) {
          console.error(`下载图片失败: ${article.title}`, error);
          failCount++;
        }
      }

      // 更新缓存统计
      await loadCacheStats();
      
      showToastMessage(`下载完成！成功: ${successCount}，失败: ${failCount}`);
    } catch (error) {
      console.error('批量下载失败:', error);
      showToastMessage('下载失败，请检查网络连接');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  // 清理缓存
  const clearCache = async () => {
    if (!confirm('确定要清理所有缓存图片吗？此操作不可撤销。')) {
      return;
    }

    setIsClearing(true);
    try {
      await imageCacheClient.clearCache();
      await loadCacheStats();
      showToastMessage('缓存清理完成');
    } catch (error) {
      console.error('清理缓存失败:', error);
      showToastMessage('清理缓存失败');
    } finally {
      setIsClearing(false);
    }
  };

  // 清理过期缓存
  const cleanExpiredCache = async () => {
    try {
      await imageCacheClient.cleanExpiredCache();
      await loadCacheStats();
      showToastMessage('过期缓存清理完成');
    } catch (error) {
      console.error('清理过期缓存失败:', error);
      showToastMessage('清理过期缓存失败');
    }
  };

  // 显示提示消息
  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBackClick={onBack} />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 页面标题 */}
          <h1 className="font-serif text-hero-title font-semibold text-text-primary mb-8 leading-tight">
            图片缓存管理
          </h1>
          
          {/* 缓存统计 */}
          <section className="mb-8">
            <div className="bg-white p-6 rounded-card shadow-card">
              <h2 className="font-serif text-xl font-medium text-text-primary mb-4 border-l-4 border-primary pl-4">
                缓存统计
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-card">
                  <HardDrive className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{cacheStats.count}</div>
                  <div className="text-sm text-blue-500">缓存图片数量</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-card">
                  <Image className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{formatFileSize(cacheStats.totalSize)}</div>
                  <div className="text-sm text-green-500">总缓存大小</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-card">
                  <RefreshCw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{articles?.length || 0}</div>
                  <div className="text-sm text-purple-500">文章总数</div>
                </div>
              </div>
            </div>
          </section>

          {/* 操作按钮 */}
          <section className="mb-8">
            <div className="bg-white p-6 rounded-card shadow-card">
              <h2 className="font-serif text-xl font-medium text-text-primary mb-4 border-l-4 border-accent pl-4">
                缓存操作
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 下载所有图片 */}
                <button
                  onClick={downloadAllImages}
                  disabled={isDownloading || loading}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-card hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Download className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">
                    {isDownloading ? '下载中...' : '下载所有图片'}
                  </span>
                  {isDownloading && downloadProgress.total > 0 && (
                    <span className="text-xs mt-1">
                      {downloadProgress.current}/{downloadProgress.total}
                    </span>
                  )}
                </button>

                {/* 刷新统计 */}
                <button
                  onClick={loadCacheStats}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-card hover:scale-105 transition-all duration-200"
                >
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">刷新统计</span>
                </button>

                {/* 清理过期缓存 */}
                <button
                  onClick={cleanExpiredCache}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-card hover:scale-105 transition-all duration-200"
                >
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">清理过期缓存</span>
                </button>

                {/* 清理所有缓存 */}
                <button
                  onClick={clearCache}
                  disabled={isClearing}
                  className="flex flex-col items-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-card hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Trash2 className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">
                    {isClearing ? '清理中...' : '清理所有缓存'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* 图片上传功能 */}
          <section className="mb-8">
            <div className="bg-white p-6 rounded-card shadow-card">
              <h2 className="font-serif text-xl font-medium text-text-primary mb-4 border-l-4 border-accent-mint pl-4">
                图片上传管理
              </h2>
              <p className="text-sm text-text-secondary mb-4 italic">
                上传本地图片替换文章配图，支持 JPG、PNG、WebP 格式
              </p>
              
              <ImageUploadSection 
                articles={articles || []} 
                onImageUploaded={loadCacheStats}
                showToastMessage={showToastMessage}
              />
            </div>
          </section>

          {/* 使用说明 */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-card">
              <h3 className="font-serif text-lg font-medium text-text-primary mb-4">
                使用说明
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span><strong>下载所有图片：</strong>将飞书表格中的所有配图下载到本地缓存，避免网络问题</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span><strong>刷新统计：</strong>更新缓存统计信息，查看最新的缓存状态</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span><strong>清理过期：</strong>删除超过7天的缓存图片，释放存储空间</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span><strong>清空缓存：</strong>删除所有缓存图片，释放全部存储空间</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 错误提示 */}
          {error && (
            <section className="mb-8">
              <div className="bg-red-50 border border-red-200 p-4 rounded-card">
                <p className="text-red-600 text-sm">
                  <strong>错误：</strong>{error}
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
      
      {/* 提示弹窗 */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-card z-50">
          {showToast}
        </div>
      )}
    </div>
  );
}