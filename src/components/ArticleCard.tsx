interface Article {
  id: string;
  title: string;
  summary: string;
  quote: string;
  tags: string[];
  originalLink: string;
  content?: string; // 飞书获取的完整文章内容
  emotionImage?: string; // 情绪配图字段
}

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
}

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  // 截取摘要前100字
  const truncatedSummary = article.summary.length > 100 
    ? article.summary.substring(0, 100) + '...' 
    : article.summary;

  // 获取金句的第一句（按照 • 或换行符分隔）
  const getFirstQuote = (quoteText: string): string => {
    if (!quoteText) return "暂无金句";
    
    const quotes = quoteText
      .split(/[•\n]/) // 按 • 或换行符分隔
      .map(quote => quote.trim()) // 去除首尾空格
      .filter(quote => quote.length > 0); // 过滤空字符串
    
    return quotes.length > 0 ? quotes[0] : quoteText;
  };

  return (
    <div 
      className="bg-white p-6 rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col h-full"
      onClick={() => onClick(article)}
    >
      {/* 文章标题 - 固定高度 */}
      <h3 className="font-serif text-card-title font-semibold text-text-primary mb-3 group-hover:text-primary transition-colors h-14 flex items-start">
        <span className="line-clamp-2">{article.title}</span>
      </h3>
      
      {/* 摘要 - 增加高度 */}
      <p className="text-card-text text-text-secondary mb-6 leading-relaxed h-24 overflow-hidden">
        {truncatedSummary}
      </p>
      
      {/* 精选金句 - 固定高度，增加与摘要的间距 */}
      <div className="bg-primary/20 border-l-4 border-accent p-3 mb-6 relative h-20 flex items-center" style={{backgroundColor: 'rgba(212, 154, 106, 0.15)'}}>
        <div className="absolute top-2 right-2">
          <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="#A86B5A">
            <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
          </svg>
        </div>
        <p className="text-card-text text-text-primary font-medium italic line-clamp-2 overflow-hidden">
          {getFirstQuote(article.quote)}
        </p>
      </div>
      
      {/* 情绪标签 - 固定高度，增加与金句的间距 */}
      <div className="flex flex-wrap gap-2 mb-6 h-10 overflow-hidden">
        {article.tags.map((tag, index) => (
          <span 
            key={index}
            className="bg-accent-mint/20 text-accent-mint px-2 py-1 rounded-full text-card-tag font-medium h-fit"
          >
            {tag}
          </span>
        ))}
      </div>
      
      {/* 阅读更多 - 固定在底部 */}
      <div className="mt-auto pt-2">
        <span className="text-primary text-card-text font-medium group-hover:text-primary-dark transition-colors">
          阅读更多 →
        </span>
      </div>
    </div>
  );
}

export type { Article };