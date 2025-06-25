// Configurações específicas para ambiente serverless
export const isServerless = () => process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;

export const serverlessConfig = {
  // Desabilitar uploads em ambiente serverless
  disableFileUploads: isServerless() || process.env.DISABLE_FILE_UPLOADS === 'true',
  
  // Usar sessões em memória em ambiente serverless
  useInMemorySessions: isServerless() || process.env.DISABLE_SESSIONS === 'true',
  
  // Configurações de timeout otimizadas
  requestTimeout: isServerless() ? 10000 : 30000,
};