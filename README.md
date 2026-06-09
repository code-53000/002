# 校服循环利用系统

## 项目简介

这是一个面向学校总务、家委会志愿者和洗衣合作方的校服回收再利用管理系统。

## 功能模块

- **回收登记**：款式、尺码、性别款、成色、瑕疵、来源年级
- **质检管理**：回收质检，决定清洗或报废
- **清洗批次**：按批次管理清洗过程
- **库存管理**：清洗后入库，支持库位管理
- **预约领取**：家长预约，锁定合适尺码
- **改码/报废**：记录原因和操作日志

## 技术栈

- **后端**：Laravel 11 + MySQL 8.0 + Sanctum
- **前端**：React 18 + TypeScript + Vite
- **部署**：Docker + Nginx

## 快速开始

### 1. 环境准备

- Docker Desktop 或 Docker Engine
- Docker Compose

### 2. 启动服务

```bash
# 复制环境变量
cp .env.example .env

# 启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

### 3. 初始化后端

```bash
# 进入 API 容器
docker-compose exec api bash

# 安装依赖
composer install

# 生成应用密钥
php artisan key:generate

# 运行数据库迁移
php artisan migrate

# 导入初始数据（款式、尺码、测试账号）
php artisan db:seed
```

### 4. 初始化前端

```bash
# 进入 Web 容器
docker-compose exec web bash

# 安装依赖
npm install

# 启动开发服务器（开发模式已自动启动）
npm run dev
```

### 5. 访问地址

- 前端: http://localhost:3000
- API: http://localhost:8000

### 6. 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@school.edu | admin123 |
| 志愿者 | volunteer1@school.edu | volunteer123 |
| 洗衣厂 | laundry@clean.com | laundry123 |
| 家长 | parent1@school.edu | parent123 |

## 项目结构

```
.
├── docker-compose.yml
├── .env.example
├── nginx/
│   ├── php.ini
│   └── conf.d/
│       ├── api.conf
│       └── web.conf
├── uniform-cycle-api/          # Laravel 后端
│   ├── app/
│   │   ├── Models/          # 12个数据模型
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # 10个API控制器
│   │   │   └── Requests/           # 23个请求验证类
│   │   └── Providers/
│   ├── routes/
│   │   └── api.php
│   ├── database/
│   │   ├── migrations/    # 12个数据迁移
│   │   └── seeders/     # 4个数据种子
│   └── Dockerfile
│   └── composer.json
│   └── .env.example
└── uniform-cycle-web/          # React 前端
    ├── src/
    │   ├── pages/          # 16个页面组件
    │   ├── components/     # 布局和通用组件
    │   ├── contexts/       # AuthContext, AppContext
    │   ├── services/       # API 服务层
    │   ├── hooks/          # 自定义 Hooks
    │   ├── router/         # 路由配置
    │   └── types/          # TypeScript 类型
    ├── Dockerfile
    └── package.json
    └── nginx.conf
```

## 业务流程

```
回收登记 → 质检 → 清洗批次 → 清洗完成 → 入库 → 预约 → 审核 → 分配 → 领取核销
     ↓           ↓
   报废记录    报废记录
```

## 生产部署

修改 `.env` 文件：

```env
APP_ENV=production
APP_DEBUG=false
NODE_ENV=production
```

然后重新构建：

```bash
docker-compose down
docker-compose up -d --build
```
