import { Heart } from "lucide-react";
import { useState } from "react";
import ContactModal from "./ContactModal";

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function Header({ showBackButton = false, onBackClick }: HeaderProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo区域 */}
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="返回首页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="font-serif text-logo font-bold text-text-primary">
            人情社故志
          </h1>
        </div>

        {/* 导航菜单 */}
        <nav className="hidden md:flex items-center space-x-12">
          <a 
            href="#" 
            className="text-base text-text-secondary hover:text-primary transition-colors relative group"
          >
            好像有点难讲
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="#" 
            className="text-base text-text-secondary hover:text-primary transition-colors relative group"
          >
            不止一面
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="#" 
            className="text-base text-text-secondary hover:text-primary transition-colors relative group"
          >
            他/她只是没说
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="#" 
            className="text-base text-text-secondary hover:text-primary transition-colors relative group"
          >
            迟到的想法
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* 致谢与联系按钮 */}
        <button 
          onClick={() => setIsContactModalOpen(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark hover:scale-105 transition-all duration-200"
        >
          <Heart className="w-4 h-4" />
          <span className="font-medium">致谢与联系</span>
        </button>
      </div>
      
      {/* 致谢与联系弹窗 */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </header>
  );
}