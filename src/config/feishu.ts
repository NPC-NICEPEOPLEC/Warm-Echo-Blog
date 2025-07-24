// 飞书应用配置
export const FEISHU_CONFIG = {
  // 飞书应用配置
  APP_ID: import.meta.env.VITE_FEISHU_APP_ID || "cli_a80ae9b92022500e",
  APP_SECRET: import.meta.env.VITE_FEISHU_APP_SECRET || "geVSv8ztaIl1TghwF5YTTF37iy3Ef2ZO",
  
  // 多维表格配置
  BASE_ID: import.meta.env.VITE_FEISHU_BASE_ID || "Q5zmb2j53acAgts9nUPcJk3LnDh",
  TABLE_ID: import.meta.env.VITE_FEISHU_TABLE_ID || "tblYRp5M1mpFN5vQ",
  
  // API 端点
  BASE_URL: "https://open.feishu.cn/open-apis",
  
  // Token 获取端点
  TOKEN_URL: "/auth/v3/app_access_token/internal",
  
  // 多维表格记录查询端点
  RECORDS_URL: "/bitable/v1/apps/{app_token}/tables/{table_id}/records"
};

// 飞书字段映射
export const FIELD_MAPPING = {
  title: "标题",
  summary: "摘要内容", 
  quote: "金句输出",
  tags: "情绪标签（可选）",
  originalLink: "原文链接",
  content: "小紫弹飞一会",
  emotionImage: "情绪配图"
};