# 浪漫伴侣 · 数字花园

Vue 3 + Vite 写的小手机/手机模拟器项目。纯前端，没有后端。

## 跑起来

前提：电脑装了 Node.js（让ai装一下或者去 nodejs.org 下载 LTS 版本装上就行）

```bash
npm install
npm run dev
```

然后浏览器打开终端显示的地址（一般是 http://localhost:3000），就能看到了。

改代码保存后浏览器自动刷新。终端按 Ctrl+C 停止。

## 改东西
让ai改~看文件开头的注释就能知道大概用途。
### 改网站标题

打开 `index.html`，改 `<title>` 标签里的内容。

## 文件说明
看文件开头的注释就能知道大概用途。
```
提示词/phone/InsPhone.vue    -- 手机主界面，大部分设置在这里改
Untitled-1.html              -- 个人资料卡UI和数据
src/App.vue                  -- 页面切换逻辑
index.html                   -- 网站标题
vite.config.js               -- 端口号、部署路径配置
*.vue (根目录)                -- 各功能页面（电台、相册、森林等）
```
