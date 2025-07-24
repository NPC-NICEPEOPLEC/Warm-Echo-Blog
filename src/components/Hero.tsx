interface HeroProps {
  onCTAClick?: () => void;
}

export default function Hero({ onCTAClick }: HeroProps) {
  return (
    <section className="bg-background pt-32 pb-12 px-4 my-4">
      <div className="container mx-auto text-center">
        {/* 主标题 */}
        <h1 className="font-serif text-hero-title md:text-5xl font-semibold text-text-primary mb-8 leading-tight">
          有些新闻冰冷 但我们读出了人心的温度
        </h1>
        
        {/* 副标题 - 精美排版 */}
        <div className="font-serif text-hero-subtitle text-text-secondary mb-12 max-w-4xl mx-auto">
          <p className="mb-4 text-lg leading-relaxed">如果你也曾在意，那就值得看下去</p>
          <div className="space-y-3 text-base leading-relaxed opacity-90">
            <p>我们写的，不是立场，而是一种整理</p>
            <p>内容有限，但情绪是打开的</p>
            <p>没有答案，但愿你曾被理解</p>
            <p>我们写下的，是一种观察，不是解释的终点</p>
            <p className="italic text-primary/80">阅读时，也欢迎带上自己的经历</p>
          </div>
        </div>
      </div>
    </section>
  );
}