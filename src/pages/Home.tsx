import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ArticleDetail from "@/pages/ArticleDetail";
import FeishuDebug from "@/pages/FeishuDebug";
import { useFeishuData } from "@/hooks/useFeishuData";
import { Loader2, RefreshCw } from "lucide-react";

export default function Home() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { articles, loading, error, refetch } = useFeishuData();

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackToHome = () => {
    setSelectedArticle(null);
  };

  const scrollToArticles = () => {
    const articlesSection = document.getElementById('articles-section');
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 如果选中了文章，显示详情页
  if (selectedArticle) {
    return (
      <ArticleDetail 
        article={selectedArticle} 
        onBack={handleBackToHome}
      />
    );
  }

  if (showDebug) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowDebug(false)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            返回首页
          </button>
        </div>
        <FeishuDebug />
      </div>
    );
  }

  // 显示首页
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero区域 */}
      <Hero onCTAClick={scrollToArticles} />
      
      {/* 今日新鲜事 */}
      <section id="articles-section" className="py-12 px-4">
        <div className="container mx-auto">
          {/* 栏目标题 */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-semibold text-text-primary mb-4">
              今日有些事让人想了很久
            </h2>
            <p className="text-text-secondary text-sm">
              {loading ? '正在从飞书获取最新内容...' : `共 ${articles.length} 篇文章`}
            </p>
          </div>
          
          {/* 加载状态 */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-text-secondary">正在获取飞书数据...</span>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">数据获取失败: {error}</p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={refetch}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新获取
                </button>
                <button 
                  onClick={() => setShowDebug(true)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  飞书连接诊断
                </button>
              </div>
            </div>
          )}

          {/* 调试按钮已隐藏 */}

          {/* 文章卡片网格 */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard 
                  key={article.id}
                  article={article}
                  onClick={handleArticleClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}