import { useState } from 'react';
import { Upload, Image, Check, X } from 'lucide-react';
import { Article } from '@/components/ArticleCard';
import imageCacheClient from '@/services/imageCacheClient';

interface ImageUploadSectionProps {
  articles: Article[];
  onImageUploaded: () => void;
  showToastMessage: (message: string) => void;
}

interface UploadProgress {
  [articleId: string]: {
    uploading: boolean;
    progress: number;
    success: boolean;
    error: string | null;
  };
}

export default function ImageUploadSection({ 
  articles, 
  onImageUploaded, 
  showToastMessage 
}: ImageUploadSectionProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [articleId: string]: File }>({});

  // 处理文件选择
  const handleFileSelect = (articleId: string, file: File | null) => {
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToastMessage('只支持 JPG、PNG、WebP 格式的图片');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToastMessage('图片大小不能超过 5MB');
        return;
      }

      setSelectedFiles(prev => ({ ...prev, [articleId]: file }));
    } else {
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[articleId];
        return newFiles;
      });
    }
  };

  // 上传图片
  const uploadImage = async (articleId: string) => {
    const file = selectedFiles[articleId];
    if (!file) {
      showToastMessage('请先选择图片文件');
      return;
    }

    // 设置上传状态
    setUploadProgress(prev => ({
      ...prev,
      [articleId]: {
        uploading: true,
        progress: 0,
        success: false,
        error: null
      }
    }));

    try {
      // 模拟上传进度
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(prev => ({
          ...prev,
          [articleId]: { ...prev[articleId], progress: i }
        }));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 将文件转换为 blob URL
      const blobUrl = URL.createObjectURL(file);
      
      // 生成缓存键（使用文章ID + 文件名）
      const cacheKey = `custom_${articleId}_${file.name}`;
      
      // 将图片保存到缓存
      await imageCacheClient.cacheImageFromBlob(cacheKey, file);
      
      // 更新上传状态
      setUploadProgress(prev => ({
        ...prev,
        [articleId]: {
          uploading: false,
          progress: 100,
          success: true,
          error: null
        }
      }));

      showToastMessage(`图片上传成功：${file.name}`);
      onImageUploaded();
      
      // 清除选中的文件
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[articleId];
        return newFiles;
      });

    } catch (error) {
      console.error('图片上传失败:', error);
      setUploadProgress(prev => ({
        ...prev,
        [articleId]: {
          uploading: false,
          progress: 0,
          success: false,
          error: error instanceof Error ? error.message : '上传失败'
        }
      }));
      showToastMessage('图片上传失败，请重试');
    }
  };

  // 清除上传状态
  const clearUploadStatus = (articleId: string) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[articleId];
      return newProgress;
    });
  };

  return (
    <div className="space-y-4">
      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无文章数据</p>
        </div>
      ) : (
        articles.map((article) => {
          const progress = uploadProgress[article.id];
          const selectedFile = selectedFiles[article.id];
          
          return (
            <div key={article.id} className="border border-gray-200 rounded-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    当前配图：{article.emotionImage ? '已有配图' : '无配图'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 文件选择 */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(article.id, e.target.files?.[0] || null)}
                    className="hidden"
                    id={`file-input-${article.id}`}
                    disabled={progress?.uploading}
                  />
                  <label
                    htmlFor={`file-input-${article.id}`}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                      progress?.uploading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? selectedFile.name : '选择图片'}
                  </label>
                </div>

                {/* 上传按钮 */}
                <button
                  onClick={() => uploadImage(article.id)}
                  disabled={!selectedFile || progress?.uploading}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {progress?.uploading ? '上传中...' : '上传'}
                </button>

                {/* 状态指示器 */}
                {progress && (
                  <div className="flex items-center">
                    {progress.uploading && (
                      <div className="text-sm text-blue-600">
                        {progress.progress}%
                      </div>
                    )}
                    {progress.success && (
                      <div className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm">成功</span>
                        <button
                          onClick={() => clearUploadStatus(article.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {progress.error && (
                      <div className="flex items-center text-red-600">
                        <X className="w-4 h-4 mr-1" />
                        <span className="text-sm">失败</span>
                        <button
                          onClick={() => clearUploadStatus(article.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 进度条 */}
              {progress?.uploading && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}