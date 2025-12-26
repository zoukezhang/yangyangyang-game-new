# 🐑 羊羊羊

一个基于HTML、CSS和JavaScript开发的经典三消游戏，无需任何依赖即可运行。

## 🎮 游戏玩法

1. 点击相同的卡片将其消除
2. 每次最多可以选择7张卡片
3. 当有3张相同卡片时自动消除
4. 消除所有卡片即可通关

## 🚀 如何运行

### 方法1：直接打开HTML文件
1. 下载仓库文件
2. 双击 `index.html` 文件即可在浏览器中运行

### 方法2：使用本地服务器
```bash
# 使用Python
python3 -m http.server 8080

# 使用Node.js (需要安装serve)
npm install -g serve
serve -s .

# 使用PHP
php -S localhost:8080
```

然后在浏览器中访问 `http://localhost:8080`

## 🎵 功能特点

- ✨ 精美的卡片设计和动画效果
- 🎶 背景音乐和音效
- 📱 响应式设计，支持移动设备
- 🔧 简单易用的游戏界面
- 🎨 清晰的游戏规则

## 📁 项目结构

```
羊羊羊/
├── css/
│   └── style.css       # 游戏样式
├── js/
│   ├── audio.js        # 音频系统
│   └── game.js         # 游戏逻辑
├── index.html          # 主页面
└── README.md           # 项目说明
```

## 🎨 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript** - 游戏逻辑
- **Font Awesome** - 图标
- **Tailwind CSS** - 快速样式开发
- **Tone.js** - 音频库

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进游戏！

## 📧 联系方式

如有问题或建议，请随时联系我们。