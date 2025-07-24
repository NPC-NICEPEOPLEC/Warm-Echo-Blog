import { ExternalLink, Copy } from "lucide-react";
import Header from "@/components/Header";
import { Article } from "@/components/ArticleCard";
import { useState } from "react";

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showSubmitToast, setShowSubmitToast] = useState(false);
  
  // 复制文本到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };


  
  // 解析金句输出字段中的多句内容
  const parseQuotes = (quoteText: string): string[] => {
    if (!quoteText) return ["暂无金句"];
    
    // 按照 • 或换行符分隔
    const quotes = quoteText
      .split(/[•\n]/) // 按 • 或换行符分隔
      .map(quote => quote.trim()) // 去除首尾空格
      .filter(quote => quote.length > 0); // 过滤空字符串
    
    return quotes.length > 0 ? quotes : [quoteText];
  };

  // 使用飞书获取的真实文章数据
  const fullArticle = {
    ...article,
    content: article.content || "暂无文章内容，请联系管理员更新。",
    allQuotes: parseQuotes(article.quote)
  };

  const handleReadMore = () => {
    window.open(article.originalLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBackClick={onBack} />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 文章标题 */}
          <h1 className="font-serif text-hero-title font-semibold text-text-primary mb-8 leading-tight">
            {article.title}
          </h1>
          
          {/* 新闻概要 */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-medium text-text-primary mb-4 border-l-4 border-primary pl-4">
              新闻概要
            </h2>
            <p className="text-sm text-text-secondary mb-4 italic">
              就先写到这里吧，也许以后我们还会再回头说起
            </p>
            <p className="text-base text-text-secondary leading-relaxed bg-white p-6 rounded-card shadow-card" style={{letterSpacing: '0.5px'}}>
              {article.summary}
            </p>
          </section>
          
          {/* 让小紫弹飞一会/观点表达 */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-medium text-text-primary mb-4 border-l-4 border-accent pl-4">
              让小紫弹飞一会
            </h2>
            <p className="text-sm text-text-secondary mb-4 italic">
              想清楚并不容易，但表达出来，可能没你想的那么晚
            </p>
            <div className="bg-white p-6 rounded-card shadow-card">
              {/* 情绪配图区域已隐藏 */}
              
              {/* 观点表达内容 */}
              <div className="text-base text-text-primary leading-relaxed" style={{letterSpacing: '0.5px'}}>
                {fullArticle.content.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                  <p key={idx} className="text-base text-text-primary leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
          
          {/* 精选金句 */}
          <section className="mb-16">
            <h2 className="font-serif text-xl font-medium text-text-primary mb-4 border-l-4 border-accent-mint pl-4">
              精选金句
            </h2>
            <p className="text-sm text-text-secondary mb-4 italic">
              留着，不是为了表达，而是为了不再压着
            </p>
            <div className="bg-white p-6 rounded-card shadow-card">
              <ul className="space-y-4">
                {fullArticle.allQuotes.map((quote, index) => (
                  <li key={index} className="flex items-start justify-between group">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-primary text-lg font-bold mt-1">•</span>
                      <p className="text-base text-text-secondary italic leading-relaxed">
                        {quote}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(quote)}
                      className="ml-4 p-2 text-text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="复制金句"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          
          {/* 阅读全文按钮 */}
          <section className="mb-16">
            <div className="text-center">
              <button 
                onClick={handleReadMore}
                className="inline-flex items-center space-x-2 bg-primary-dark text-white px-6 py-3 rounded-card font-medium hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>阅读全文</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </section>
          
          {/* 评论区 */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-card">
              <h3 className="font-serif text-lg font-medium text-text-primary mb-2">
                有人在看，也有人在等，但没有人在催你
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                你愿意说，我们会听着。你不说，也不是被忽视
              </p>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                rows={4}
                placeholder="在这里分享你的想法..."
              />
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => {
                    setShowSubmitToast(true);
                    setTimeout(() => setShowSubmitToast(false), 2000);
                  }}
                  className="bg-primary text-white px-6 py-2 rounded-card hover:bg-primary-dark transition-colors"
                >
                  发表想法
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* 复制成功提示弹窗 */}
      {showCopyToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-card z-50">
          复制好了，别忘了感受一下它的温度
        </div>
      )}
      
      {/* 发表想法成功提示弹窗 */}
      {showSubmitToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-card z-50">
          这句话我们会认真读，也许它会陪别人一会儿
        </div>
      )}
    </div>
  );
}