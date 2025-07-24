export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          {/* 版权声明 */}
          <div>
            <h3 className="font-medium text-text-primary mb-2">版权声明</h3>
            <p className="text-text-secondary text-sm">
              © 2025 人情社故志 Warm Echo Blog 保留所有权利
            </p>
          </div>
          
          {/* 隐私 & 服务条款 */}
          <div>
            <h3 className="font-medium text-text-primary mb-2">隐私 & 服务条款</h3>
            <div className="flex items-center justify-center space-x-2 text-text-secondary text-sm">
              <a 
                href="#" 
                className="hover:text-primary transition-colors"
              >
                隐私政策
              </a>
              <span>｜</span>
              <a 
                href="#" 
                className="hover:text-primary transition-colors"
              >
                使用条款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}