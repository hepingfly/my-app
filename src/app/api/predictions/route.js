import { NextResponse } from "next/server";
import Replicate from "replicate";

// 创建一个 Replicate 实例，使用环境变量中的 API 令牌进行身份验证
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 在生产和预览部署（在 Vercel 上）时，VERCEL_URL 环境变量被设置。
// 在开发（本地机器上）时，NGROK_HOST 环境变量被设置。
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}` // 如果在 Vercel 上，使用 VERCEL_URL 作为 webhook 主机
  : process.env.NGROK_HOST; // 否则，使用 NGROK_HOST 作为 webhook 主机

export async function POST(request) {
  // 检查 REPLICATE_API_TOKEN 环境变量是否已设置
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    ); // 如果未设置，抛出错误
  }

  // 从请求中获取 JSON 数据
  const { prompt } = await request.json();

  // 设置预测选项，包括模型和输入
  const options = {
    model: 'black-forest-labs/flux-schnell', // 使用的模型
    input: { prompt } // 输入的提示
  }

  // 如果 WEBHOOK_HOST 存在，设置 webhook 相关选项
  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhooks`; // 设置 webhook URL
    options.webhook_events_filter = ["start", "completed"]; // 过滤 webhook 事件
  }

  // 创建预测，运行模型并获取结果
  const prediction = await replicate.predictions.create(options);

  // 如果预测结果中有错误，返回错误信息
  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  // 返回预测结果，状态码为 201
  return NextResponse.json(prediction, { status: 201 });
}