import React, { useState } from 'react';
import { FEISHU_CONFIG, FIELD_MAPPING } from '@/config/feishu';
import feishuApi from '@/services/feishuApi';
import { toast } from 'sonner';

interface DebugResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function FeishuDebug() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, { step, status, message, data }]);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    // 1. 检查环境变量配置
    addResult('环境变量检查', 'pending', '检查飞书配置...');
    
    const config = {
      APP_ID: FEISHU_CONFIG.APP_ID,
      APP_SECRET: FEISHU_CONFIG.APP_SECRET ? '已配置' : '未配置',
      BASE_ID: FEISHU_CONFIG.BASE_ID,
      TABLE_ID: FEISHU_CONFIG.TABLE_ID
    };
    
    if (!FEISHU_CONFIG.APP_ID || !FEISHU_CONFIG.APP_SECRET || !FEISHU_CONFIG.BASE_ID || !FEISHU_CONFIG.TABLE_ID) {
      addResult('环境变量检查', 'error', '配置不完整，请检查.env.local文件', config);
    } else {
      addResult('环境变量检查', 'success', '配置完整', config);
    }

    // 2. 测试网络连接
    addResult('网络连接测试', 'pending', '测试飞书API连通性...');
    try {
      const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: 'test',
          app_secret: 'test'
        })
      });
      
      if (response.status === 400) {
        addResult('网络连接测试', 'success', '网络连接正常（收到400错误说明API可达）');
      } else {
        addResult('网络连接测试', 'error', `意外的响应状态: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('CORS')) {
        addResult('网络连接测试', 'error', 'CORS跨域错误：前端无法直接访问飞书API，需要后端代理服务');
      } else {
        addResult('网络连接测试', 'error', `网络错误: ${error}`);
      }
    }

    // 3. 测试Token获取
    addResult('Token获取测试', 'pending', '尝试获取访问令牌...');
    try {
      const token = await (feishuApi as any).getAccessToken();
      addResult('Token获取测试', 'success', '成功获取访问令牌', { tokenLength: token.length });
      
      // 4. 测试表格数据获取
      addResult('表格数据测试', 'pending', '尝试获取表格数据...');
      try {
        const articles = await feishuApi.getTableRecords();
        addResult('表格数据测试', 'success', `成功获取 ${articles.length} 条记录`, { 
          count: articles.length,
          sample: articles[0] || null
        });
      } catch (error) {
        addResult('表格数据测试', 'error', `获取表格数据失败: ${error}`);
      }
    } catch (error) {
      addResult('Token获取测试', 'error', `获取Token失败: ${error}`);
    }

    setTesting(false);
    toast.success('诊断完成');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-warm-text mb-6">飞书API诊断工具</h1>
          
          <div className="mb-6">
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="bg-warm-primary text-white px-6 py-2 rounded-lg hover:bg-warm-primary/90 disabled:opacity-50"
            >
              {testing ? '诊断中...' : '开始诊断'}
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-warm-text">当前配置</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>APP_ID:</strong> {FEISHU_CONFIG.APP_ID}</div>
                <div><strong>APP_SECRET:</strong> {FEISHU_CONFIG.APP_SECRET ? '已配置' : '未配置'}</div>
                <div><strong>BASE_ID:</strong> {FEISHU_CONFIG.BASE_ID}</div>
                <div><strong>TABLE_ID:</strong> {FEISHU_CONFIG.TABLE_ID}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold text-warm-text">字段映射配置</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(FIELD_MAPPING).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-4 mt-6">
              <h2 className="text-lg font-semibold text-warm-text">诊断结果</h2>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{getStatusIcon(result.status)}</span>
                      <span className="font-medium">{result.step}</span>
                      <span className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{result.message}</p>
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500">查看详细数据</summary>
                        <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">常见问题解决方案</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>CORS错误:</strong> 前端无法直接访问飞书API，需要创建后端代理服务</li>
              <li>• <strong>401错误:</strong> 检查APP_ID和APP_SECRET是否正确</li>
              <li>• <strong>403错误:</strong> 检查飞书应用权限：bitable:app, bitable:record:read</li>
              <li>• <strong>404错误:</strong> 检查BASE_ID和TABLE_ID是否正确</li>
              <li>• <strong>字段不匹配:</strong> 确保飞书表格字段名与配置完全一致</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}