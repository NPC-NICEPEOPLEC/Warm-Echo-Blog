import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ArticleCard, { Article } from "@/components/ArticleCard";
import ArticleDetail from "@/pages/ArticleDetail";
import { useFeishuData } from "@/hooks/useFeishuData";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
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

  // 移除飞书调试页面逻辑

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
              共 {articles.length} 篇文章
            </p>
          </div>
          
          {/* 加载状态 */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-text-secondary">正在获取最新内容...</span>
            </div>
          )}

          {/* 错误状态 - 隐藏调试按钮，只显示错误信息 */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">暂时无法获取最新内容，请稍后再试</p>
            </div>
          )}

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