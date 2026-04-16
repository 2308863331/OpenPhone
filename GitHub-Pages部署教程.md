# Vue + Vite 项目部署到 GitHub Pages 完整教程

## 一、前提条件

- GitHub 账号（免费即可，学生会员 Pro 更好）
- 本地已安装 Git
- Vue + Vite 项目

---

## 二、GitHub Pages 基本信息速查

| 项目 | 说明 |
|------|------|
| 用户主页站点 | 每个账号 **1 个**，仓库名必须为 `用户名.github.io` |
| 项目站点 | **无限个**，每个仓库都可以有一个 |
| 访问地址 | `https://用户名.github.io/仓库名/` |
| 费用 | **永久免费**（公开仓库） |
| 存储限制 | 仓库 ≤ 1GB，站点 ≤ 1GB |
| 月带宽 | 100GB（软限制） |
| 支持内容 | 仅静态文件（HTML/CSS/JS），不支持后端 |
| 私有仓库 Pages | 需要 GitHub Pro（学生会员即可） |

---

## 三、部署步骤

### 第 1 步：创建远程仓库

在 GitHub 上创建仓库（如 `OpenPhone`），然后在本地关联：

```bash
git remote add OpenPhone https://github.com/你的用户名/仓库名.git
```

### 第 2 步：配置 vite.config.js

因为项目站点不是部署在根域名，必须设置 `base` 为仓库名：

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/仓库名/',   // ← 关键！比如 '/OpenPhone/'
  plugins: [vue()],
  // ... 其他配置
})
```

> 如果是用户主页站点（`用户名.github.io`），则 `base` 设为 `'/'`

### 第 3 步：创建 .gitignore

```
node_modules/
dist/
.vite/
*.log
.DS_Store
```

### 第 4 步：创建 GitHub Actions 自动部署配置

创建文件 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 第 5 步：提交并推送代码（⚠️ 关键！必须提交的文件）

**Vue/Vite 项目 CI 构建必须包含以下文件，缺一不可：**

| 文件 | 作用 | 缺失后果 |
|------|------|---------|
| `package.json` | 声明项目依赖和脚本 | ❌ **npm install 直接报错 ENOENT，构建立即失败** |
| `package-lock.json` | 锁定依赖版本 | ⚠️ npm ci 失败（用 npm install 可绕过） |
| `vite.config.js` | Vite 构建配置（含 base 路径） | ⚠️ 构建可能成功但页面空白/404 |
| **被 import 引用的所有 .vue 文件** | 页面组件 | ❌ Vite 构建时报 `Could not resolve`，exit code 1 |

```bash
# 推荐方式：一次性添加所有必要文件
git add package.json package-lock.json vite.config.js .gitignore .github/workflows/deploy.yml index.html src/

# 添加你的 Vue 组件文件
git add *.vue src/**/*.vue

# 提交
git commit -m "init: project with GitHub Pages deploy"

# 推送到远程
git push OpenPhone main
```

> 💡 **血泪教训**：如果 `git status` 显示这些文件在 "Untracked files" 里，说明它们还没被 `git add`。Actions 在 GitHub 服务器上拉取代码后找不到它们，会直接报错。**一定要确认它们在 Changes to be committed（已暂存）区域里！**

### 第 6 步：在 GitHub 网页上启用 Pages

1. 打开 `https://github.com/你的用户名/仓库名/settings/pages`
2. **Source（资料来源）** 选择 **"GitHub 操作"**（不是 "Deploy from a branch"）
3. 保存

> 不需要点任何"确认部署"按钮！推送代码后 Actions 会自动触发。

### 第 7 步：等待部署完成

- 查看 Actions 运行状态：`https://github.com/你的用户名/仓库名/actions`
- 部署成功后访问：`https://你的用户名.github.io/仓库名/`

---

## 四、自动部署流程

```
你推送代码到 main 分支
  → GitHub 检测到 .github/workflows/deploy.yml
    → 自动触发 Actions workflow
      → Checkout 拉取代码
      → Setup Node 安装 Node.js
      → npm install 安装依赖
      → npm run build 构建项目（生成 dist 文件夹）
      → Upload artifact 上传构建产物
      → Deploy 部署到 GitHub Pages
        → 完成！网站自动更新
```

以后每次 `git push`，网站会自动重新构建和部署。

---

## 五、Node.js 和 GitHub Pages 的关系（重要！）

很多人困惑：**GitHub Pages 不是只支持静态网站吗？为什么 deploy.yml 里用了 Node.js？**

### Node.js ≠ 后端部署

```
┌─────────────────────────────────────────────────────┐
│              GitHub Actions 构建阶段                  │
│                                                     │
│  Node.js 在这里临时运行（约1分钟）                      │
│  ├── npm install  → 安装 Vue/Vite 等开发依赖          │
│  └── npm run build → Vite 把 .vue 文件编译成          │
│                      纯 HTML/CSS/JS 放到 dist/       │
│                                                     │
│  ⬇ 构建完成后 Node.js 就退出了，不再参与               │
└─────────────────────────────────────────────────────┘
                        ⬇
┌─────────────────────────────────────────────────────┐
│              GitHub Pages 部署阶段                    │
│                                                     │
│  只部署 dist/ 文件夹里的纯静态文件                      │
│  ├── index.html                                     │
│  ├── assets/xxx.css                                 │
│  └── assets/xxx.js                                  │
│                                                     │
│  没有任何 Node.js 运行！没有后端！                      │
│  和你手写 HTML 放上去是一样的                           │
└─────────────────────────────────────────────────────┘
```

**简单说：Node.js 只是"编译器"，把 Vue 源码翻译成浏览器能直接运行的静态文件。翻译完就走了，不会留在网站上。**

就像你用 Word 写文档然后导出 PDF，别人看 PDF 不需要装 Word 一样。

---

## 六、常见问题排查

### 1. 🔴 最常见！Actions 构建失败 — ENOENT / 找不到 package.json（血泪教训）

**错误信息**：
```
npm 错误 enoent 无法读取 package.json：
错误：ENOENT：无此类文件或目录，
打开 '/home/runner/work/xxx/xxx/package.json'
错误：流程完成，出口代码254。
```

**原因**：`package.json` 没有被 `git add` 和 `git commit`。它在本地 git status 里显示为 "Untracked files"（未跟踪），Actions 拉取代码后找不到它。

**这是最容易被忽略的问题！** 很多人以为 `git add .` 加了所有文件，但实际上可能漏掉了关键配置文件。

**解决**：
```bash
# 检查是否已跟踪
git status
# 如果 package.json 在 "Untracked files" 区域 → 还没提交！

# 手动添加并提交
git add package.json
git commit -m "fix: add missing package.json"
git push origin main
```

### 2. Actions 构建失败 — exit code 254 / Node.js 20 deprecated

**原因**：GitHub Actions 的 Node.js 20 已于 2026 年弃用，使用旧版 Actions 会报错

**解决**：
- 将 `node-version` 从 `20` 改为 `22`（当前 LTS）
- 添加环境变量 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` 强制 Actions 自身用 Node 24 运行
- 去掉 `cache: npm`（简化配置，避免缓存异常）

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22    # ← 用 22，不要用 20
```

### 3. Build 失败 — Could not resolve / 找不到 .vue 组件文件

**错误信息**：
```
Could not resolve "./Text.vue" from "src/App.vue"
Error: Process completed with exit code 1.
```

**原因**：某个 `.vue` 组件文件被 `import` 引用了，但没有被 `git add` 提交到仓库。Vite 在构建时找不到该文件。

**解决**：
```bash
# 根据错误信息找到缺失的文件
# 错误说 "Could not resolve './Text.vue' from 'src/App.vue'"
# 说明 src/App.vue 引用了 Text.vue 但仓库里没有

# 检查本地是否存在
ls Text.vue

# 添加并提交
git add Text.vue
git commit -m "fix: add missing Text.vue"
git push origin main
```

> **排查技巧**：如果 `npm install` 成功但 `npm run build` 失败，说明依赖没问题，是源码文件缺失。看 Build 步骤的日志里 `Could not resolve` 后面的文件名就是缺失的文件。

### 4. Actions 构建失败 — npm ci 报错

**原因**：`package-lock.json` 未提交，或与 `package.json` 不同步

**解决**：改用 `npm install`（更宽容），或确保 `package-lock.json` 已提交且与 `package.json` 一致

### 5. 页面空白 / 资源 404

**原因**：`vite.config.js` 未配置 `base`

**解决**：确保 `base: '/仓库名/'` 已设置

### 6. 连接 GitHub 失败（Failed to connect via 127.0.0.1）

**原因**：Git 配置了代理但代理未运行

**解决**：
```bash
# 查看代理配置
git config --global http.proxy
git config --global https.proxy

# 取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 7. 只想推送暂存的文件

Git 本身就只推送已提交的内容：
- **已暂存 + 已提交** → 会被推送
- **未跟踪的文件** → 不会被推送
- **未暂存的修改** → 不会被推送

```bash
# 只暂存指定文件
git add 文件名

# 提交暂存区
git commit -m "描述"

# 推送
git push 远程名 分支名
```

### 8. "Deploy from a branch" vs "GitHub Actions"

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| Deploy from a branch | 直接从分支取文件发布 | 纯 HTML 项目、Jekyll 博客 |
| GitHub Actions | 自动运行脚本构建再部署 | Vue/React/Vite 等需要打包的项目 |

### 9. 实战排错记录：多次失败的真实经历

以下是一次真实部署中连续多次 Actions 构建失败的完整排查过程：

```
第 1 次：13 秒失败 → 猜：缺 package-lock.json → 补了
第 2 次：21 秒失败 → 猜：npm ci 不兼容 → 改成 npm install
第 3 次：exit code 254 → 猜：Node.js 20 弃用 → 升级 Node 22 + FORCE_NODE24
第 4 次：exit code 254 → 还是 Node 问题？→ 继续调配置...
第 5 次：终于看到完整日志！→ 🎯 找到 package.json 没提交 → 补了
第 6 次：Build 失败 exit code 1 → Could not resolve "./Text.vue" → 🎯 Text.vue 也没提交！补了
```

**教训总结**：
1. **第一时间看完整日志**：不要只看状态（❌）和耗时（13s/21s），要点进去看每一步的详细输出
2. **ENOENT = 文件不存在**：这个错误信息最直接，说明某个文件找不到
3. **git status 是你的朋友**：提交前一定要检查哪些文件在 "Untracked files" vs "Changes to be committed"
4. **不要盲目猜问题**：每次修改后如果还是同样的错误码，说明方向可能错了

**正确做法**：第一次看到 exit code 254 时就应该点进 "安装依赖" 步骤看完整日志，里面清楚地写着 `ENOENT: no such file or directory: package.json`。

---

## 七、关于"30 天免费"的说明

在 Pages 设置页面底部可能看到：

> "有了 GitHub Enterprise 账户，你可以通过私密发布 GitHub Pages...免费使用 30 天"

这是 **Enterprise 试用**的提示，**跟 GitHub Pages 本身无关**：

- 公开仓库的 Pages → **永久免费**，无时间限制
- 私有仓库的 Pages → GitHub Pro 用户即可使用（学生会员 = Pro），不需要 Enterprise
- 那个"30 天"是给没有付费账户的普通用户试用 Enterprise 的

**结论：不需要点那个按钮，你的 Pages 永久免费。**

---

## 八、更换/取消部署

### 取消某个仓库的 Pages
仓库 Settings → Pages → Source 改为 "None"

### 删除仓库
Settings → Danger Zone → Delete this repository，Pages 自动消失

### 换另一个项目部署
直接在新仓库里重复上述步骤即可，项目站点名额**无限**，不需要"腾名额"

---

## 九、彻底删除文件（含 Git 历史）

### 普通删除 vs 彻底删除

| 操作 | 命令 | 当前仓库有？ | Git 历史有？ |
|------|------|-------------|-------------|
| 只删最新版本 | `git rm 文件` + commit + push | ❌ 没有 | ✅ **还在！翻旧 commit 能看到** |
| **彻底删除** | `git filter-repo` + force push | ❌ 没有 | ❌ **彻底消失** |

> **普通 `git rm` 只是删了最新版本**，文件内容仍然保存在所有历史提交中。任何人点进旧 commit 都能看到完整内容。

### 什么时候需要彻底删除？

- 文件包含 **密码、API Key、密钥** 等敏感信息
- 文件包含 **个人信息、隐私数据**
- 不想让任何人通过任何方式看到该文件

### 彻底删除操作步骤

```bash
# 第 1 步：安装 git-filter-repo（只需一次）
pip install git-filter-repo

# 第 2 步：（可选）如果想保留本地文件副本，先备份
# git show <commit-hash>:文件名 > 文件名.bak
# 或者从历史恢复到本地：
# git show <包含该文件的commit>:Text.vue > Text.vue

# 第 3 步：从所有历史提交中彻底抹除指定文件
git filter-repo --path Text.vue --invert-paths --force

# 第 4 步：强制推送到 GitHub（必须用 --force 覆盖远程历史）
git push --force OpenPhone main
```

### 参数说明

```
--path Text.vue        ← 要删除的目标文件路径
--invert-paths         ← 反转：删除这个文件（而不是只保留这个文件）
--force                ← 强制执行（filter-repo 默认要求 fresh clone）
```

### ⚠️ 重要注意事项

1. **会重写所有 commit 的 hash** — 因为每个提交的内容都变了，所以每个 commit 的 SHA 都不同
2. **需要 `--force` 推送** — 远程历史和本地不一致，必须强制覆盖
3. **协作者需要重新 clone** — 如果有人已经 clone 过这个仓库，他们需要重新 clone
4. **本地文件不受影响** — `filter-repo` 只改 Git 数据库，不碰磁盘上的实际文件
5. **GitHub 可能有缓存** — 清理后 GitHub 可能短暂保留旧数据，通常几小时内完全清除

---

## 十、快速命令速查

```bash
# 初始化仓库
git init
git remote add origin https://github.com/用户名/仓库名.git

# 日常推送（自动触发部署）
git add .
git commit -m "update"
git push origin main

# 手动触发部署（在 Actions 页面点 "Run workflow"）
# 或使用 workflow_dispatch 触发

# 查看部署状态
# https://github.com/用户名/仓库名/actions

# 访问网站
# https://用户名.github.io/仓库名/
```
