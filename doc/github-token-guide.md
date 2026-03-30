# GitHub Token 使用指南

## 为什么需要 GitHub Token？

GitHub API 对未认证的请求有严格的速率限制：

- **未认证请求**: 60 次/小时/IP
- **已认证请求**: 5000 次/小时/用户

如果你频繁使用 GitDataFetcher 组件，很容易达到 60 次的限制。使用 Token 可以将限制提高到 5000 次。

## 如何获取 GitHub Token

### 步骤 1: 访问 GitHub Settings

1. 登录 GitHub
2. 点击右上角头像 → Settings
3. 在左侧菜单中找到 "Developer settings"（最底部）
4. 点击 "Personal access tokens" → "Tokens (classic)"

或直接访问：https://github.com/settings/tokens

### 步骤 2: 生成新 Token

1. 点击 "Generate new token" → "Generate new token (classic)"
2. 填写 Token 信息：
   - **Note**: 给 Token 起个名字，例如 "Git Graph Viewer"
   - **Expiration**: 选择过期时间（建议选择 90 days 或 No expiration）
   - **Select scopes**: 勾选权限

### 步骤 3: 选择权限

对于访问公开仓库，只需要以下权限：

- ✅ `public_repo` - 访问公开仓库

如果需要访问私有仓库，需要：

- ✅ `repo` - 完整的仓库访问权限（包括私有仓库）

### 步骤 4: 生成并保存 Token

1. 点击页面底部的 "Generate token"
2. **重要**: 立即复制生成的 Token！
3. Token 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. 保存到安全的地方（密码管理器等）

⚠️ **注意**: Token 只会显示一次！如果忘记保存，需要重新生成。

## 如何使用 Token

### 方式 1: 在组件中使用

```jsx
<GitDataFetcher 
  defaultRepo="https://github.com/owner/repo"
  defaultToken="ghp_your_token_here"
>
  {(gitData) => <GitGraphManager data={gitData} />}
</GitDataFetcher>
```

### 方式 2: 在 UI 中输入

1. 打开 GitDataFetcher 组件
2. 找到 "GitHub Token" 输入框
3. 粘贴你的 Token
4. 点击"获取"按钮

### 方式 3: 使用 API 函数

```javascript
import { fetchGitDataFromGitHub } from '@kne/git-graph';

const data = await fetchGitDataFromGitHub(
  'https://github.com/owner/repo',
  {
    token: 'ghp_your_token_here',
    maxCommits: 100
  }
);
```

## Token 格式说明

### 正确的 Token 格式

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- 以 `ghp_` 开头
- 后面跟随 36 个字符
- 总长度 40 个字符

### 错误的示例

❌ `5000` - 这不是有效的 Token
❌ `token123` - 格式不正确
❌ `my-github-token` - 格式不正确

## 安全建议

### ✅ 应该做的

1. **使用环境变量**
   ```javascript
   const token = process.env.REACT_APP_GITHUB_TOKEN;
   ```

2. **不要提交到代码仓库**
   - 将 Token 添加到 `.gitignore`
   - 使用 `.env` 文件存储

3. **定期更换 Token**
   - 建议每 90 天更换一次
   - 如果泄露，立即撤销

4. **最小权限原则**
   - 只授予必要的权限
   - 公开仓库只需要 `public_repo`

### ❌ 不应该做的

1. ❌ 不要在代码中硬编码 Token
2. ❌ 不要将 Token 提交到 Git 仓库
3. ❌ 不要在公开的地方分享 Token
4. ❌ 不要授予不必要的权限

## 检查速率限制

### 使用 curl 检查

```bash
# 未认证
curl https://api.github.com/rate_limit

# 已认证
curl -H "Authorization: token ghp_your_token_here" \
     https://api.github.com/rate_limit
```

### 响应示例

```json
{
  "resources": {
    "core": {
      "limit": 5000,
      "remaining": 4999,
      "reset": 1234567890
    }
  }
}
```

- `limit`: 总限制次数
- `remaining`: 剩余次数
- `reset`: 重置时间（Unix 时间戳）

## 常见问题

### Q: Token 过期了怎么办？

A: 重新生成一个新的 Token，并更新到应用中。

### Q: Token 泄露了怎么办？

A: 
1. 立即访问 https://github.com/settings/tokens
2. 找到泄露的 Token
3. 点击 "Delete" 删除
4. 生成新的 Token

### Q: 可以使用 Fine-grained tokens 吗？

A: 可以，但需要注意：
- Fine-grained tokens 以 `github_pat_` 开头
- 需要明确指定可访问的仓库
- 权限设置更细粒度

### Q: 如何在生产环境中使用？

A: 建议使用环境变量：

```javascript
// .env
REACT_APP_GITHUB_TOKEN=ghp_your_token_here

// 代码中
<GitDataFetcher 
  defaultToken={process.env.REACT_APP_GITHUB_TOKEN}
>
  {/* ... */}
</GitDataFetcher>
```

### Q: Token 会在网络中传输吗？

A: 是的，Token 会在 HTTP 请求头中发送到 GitHub API。但是：
- 使用 HTTPS 加密传输
- 只发送到 `api.github.com`
- 不会发送到其他域名

## 测试 Token

### 使用 curl 测试

```bash
curl -H "Authorization: token ghp_your_token_here" \
     https://api.github.com/user
```

如果 Token 有效，会返回你的 GitHub 用户信息。

### 在浏览器中测试

1. 打开 GitDataFetcher 组件
2. 输入 Token
3. 点击"获取"
4. 查看是否显示"✓ 已使用 Token 认证"

## 撤销 Token

如果不再需要 Token：

1. 访问 https://github.com/settings/tokens
2. 找到要撤销的 Token
3. 点击 "Delete"
4. 确认删除

## 相关链接

- [GitHub Token 文档](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API 速率限制](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Token 权限说明](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
