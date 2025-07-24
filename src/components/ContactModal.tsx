import { X } from "lucide-react";
import { useEffect } from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* 内容区域 */}
        <div className="p-8">
          <h1 className="text-2xl font-serif font-semibold text-text-primary mb-6">
            致谢与联系
          </h1>
          
          <div className="space-y-8">
            {/* 开场白 */}
            <div className="text-text-secondary leading-relaxed space-y-3">
              <p>谢谢你注意到这里。</p>
              <p>我们不太擅长宣传自己，但如果你愿意停下来、说句话，</p>
              <p>甚至支持我写下去，这里是我们之间的安静通路。</p>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* 写给我 */}
            <div>
              <h2 className="text-lg font-medium text-text-primary mb-3">
                📬 写给我
              </h2>
              <div className="text-text-secondary leading-relaxed mb-4 space-y-2">
                <p>有想法想交流、反馈、提问，</p>
                <p>或者单纯想说："我看到了"，都可以写信来。</p>
                <p>我会尽量在状态允许的时候，回复每一封认真写的文字。</p>
              </div>
              <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                写一封匿名留言
              </button>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* 支持我慢慢写 */}
            <div>
              <h2 className="text-lg font-medium text-text-primary mb-3">
                🫧 支持我慢慢写
              </h2>
              <div className="text-text-secondary leading-relaxed mb-4 space-y-2">
                <p>如果你觉得某一篇内容陪了你一会儿，</p>
                <p>愿意支持我继续慢慢写，</p>
                <p>也可以在这里留下点什么。</p>
                <p className="mt-3">不求回报，但会珍惜这份鼓励。</p>
              </div>
              <div className="space-y-4">
                <p className="font-medium text-text-primary">☕ <strong>留下点温度</strong>：</p>
                <div className="ml-4 space-y-4">
                  {/* 支付方式图片 */}
                  <div className="space-y-3">
                    <p className="text-text-secondary font-medium">- 微信 / 支付宝：</p>
                    <div className="flex gap-4 ml-4">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=WeChat%20QR%20code%20payment%20green%20background%20simple%20clean%20design&image_size=square" 
                            alt="微信支付二维码" 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span className="text-gray-500 text-sm">微信支付码</span>';
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">微信支付</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                          <img 
                            src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Alipay%20QR%20code%20payment%20blue%20background%20simple%20clean%20design&image_size=square" 
                            alt="支付宝支付二维码" 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span className="text-gray-500 text-sm">支付宝支付码</span>';
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">支付宝</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-secondary">- 或点击按钮跳转：
                    <button className="ml-2 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors">
                      轻轻支持我一下
                    </button>
                    （Buy Me a Coffee / 爱发电等平台）
                  </p>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-200" />
            
            {/* 留下一点回应 */}
            <div>
              <h2 className="text-lg font-medium text-text-primary mb-3">
                🧷 留下一点回应（页面结语）
              </h2>
              <div className="text-text-secondary leading-relaxed space-y-2">
                <p>不是所有联系都需要理由，</p>
                <p>不是所有支持都需要解释。</p>
                <p className="mt-4">谢谢你点开了这一页。</p>
                <p>我们之间不一定开始一段什么，</p>
                <p>但这一刻的停留，本身就很温柔。</p>
              </div>
            </div>
            
            <hr className="border-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}