# PassForge

轻量、隐私友好的在线密码生成器。密码仅在浏览器本地生成，不会上传到任何服务器。

## 功能

- 使用 `crypto.getRandomValues()` 生成加密学安全的随机密码
- 可配置密码长度（4–128）与字符类型（大小写、数字、符号）
- 密码强度评估与可视化指示
- 一键复制到剪贴板
- 批量生成（最多 50 条）
- 排除易混淆字符（0/O、1/l/I）
- 深色 / 浅色主题切换
- 生成选项本地持久化（不存储密码）

## 本地预览

项目使用 ES Module，需要通过 HTTP 服务访问（不能直接双击打开 `index.html`）。

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

浏览器访问 [http://localhost:8080](http://localhost:8080)。

## 项目结构

```
PassForge/
├── index.html          # 页面入口
├── css/
│   └── style.css       # 样式
├── js/
│   ├── generator.js    # 密码生成逻辑
│   ├── strength.js     # 强度评估
│   └── app.js          # UI 交互
├── PRD.md              # 产品需求文档
└── README.md
```

## 部署

可部署到任意静态托管服务：

- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)

将仓库根目录作为站点根目录即可，无需构建步骤。

## 隐私说明

- 所有密码在客户端生成
- 不会将密码发送至服务器
- LocalStorage 仅保存用户偏好设置，不保存生成的密码

## License

MIT
