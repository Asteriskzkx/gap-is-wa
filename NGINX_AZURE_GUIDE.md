# 📋 Nginx Configuration สำหรับ Azure Deployment

## 🔑 ความแตกต่างหลัก: Local vs Azure

| ส่วน                   | Local Development           | Azure Production                  |
| ---------------------- | --------------------------- | --------------------------------- |
| **SSL/TLS**            | จัดการเองใน Nginx container | Azure จัดการให้ (ไม่ต้องทำเอง)    |
| **Port**               | 80 (HTTP) + 443 (HTTPS)     | 80 (HTTP) เท่านั้น                |
| **Certificate**        | ต้องสร้าง self-signed cert  | ไม่ต้องมี (Azure มี managed cert) |
| **HTTPS Redirect**     | ทำใน Nginx (301 redirect)   | ไม่ต้องทำ (Azure ทำให้แล้ว)       |
| **Protocol Detection** | อ่านจาก request protocol    | อ่านจาก `X-Forwarded-Proto`       |

---

## 📂 ไฟล์ที่ใช้

```
nginx.conf           → สำหรับ Local Development (มี HTTPS)
nginx.azure.conf     → สำหรับ Azure Production (ไม่มี HTTPS config)
```

---

## ✏️ การแก้ไขหลักใน `nginx.azure.conf`

### 1. ❌ ลบ HTTPS Server Block

**Local (nginx.conf):**

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    # ... SSL config
}
```

**Azure (nginx.azure.conf):**

```nginx
# ❌ ไม่มี HTTPS block เลย
# Azure จัดการ SSL/TLS ให้
```

---

### 2. ❌ ลบ HTTP → HTTPS Redirect

**Local (nginx.conf):**

```nginx
server {
    listen 80;
    return 301 https://$host$request_uri;  # Redirect ไป HTTPS
}
```

**Azure (nginx.azure.conf):**

```nginx
server {
    listen 80;
    # ❌ ไม่ redirect
    # Azure ทำให้แล้วที่ Gateway level
}
```

---

### 3. ✅ Trust Azure Load Balancer IPs

**เพิ่มใน Azure config:**

```nginx
# Trust Azure Load Balancer private IPs
set_real_ip_from 10.0.0.0/8;
set_real_ip_from 172.16.0.0/12;
set_real_ip_from 192.168.0.0/16;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

**ทำไมต้องมี?**

- Azure Load Balancer อยู่ระหว่าง client และ container
- ต้อง trust IP จาก Load Balancer เพื่อได้ client IP จริง
- ใช้สำหรับ logging และ rate limiting

---

### 4. ✅ ใช้ X-Forwarded-Proto จาก Azure

**สำคัญมาก!** ต้องส่ง header นี้ไปยัง Next.js:

```nginx
proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $http_x_forwarded_port;
```

**ทำไมสำคัญ?**

- Azure ส่ง `X-Forwarded-Proto: https` เมื่อ request มาผ่าน HTTPS
- Next.js ใช้ header นี้เพื่อ generate URL ที่ถูกต้อง
- ถ้าไม่ส่ง → Next.js จะ generate `http://` แทน `https://` ❌

---

### 5. ✅ เพิ่ม Health Check Endpoints

```nginx
# Azure Container Apps health probe
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}

# Azure App Service health check
location /robots933456.txt {
    access_log off;
    return 200 "User-agent: *\nDisallow: /\n";
    add_header Content-Type text/plain;
}
```

**Azure ใช้ endpoints เหล่านี้เพื่อ:**

- ตรวจสอบว่า container ยัง healthy
- Auto-restart ถ้า health check fail
- Load balancing ระหว่าง instances

---

### 6. ✅ ปรับ Timeout สำหรับ Azure

```nginx
# Azure Gateway มี timeout 230 วินาที
# ตั้ง Nginx timeout ต่ำกว่านิดหน่อย
proxy_connect_timeout 60s;
proxy_send_timeout 180s;
proxy_read_timeout 180s;
```

---

### 7. ✅ Keep server*name เป็น `*`

```nginx
server_name _;  # รับทุก hostname
```

**ทำไม?**

- Azure จัดการ domain routing ให้
- Container ไม่ต้องรู้ว่า domain คืออะไร
- รองรับทั้ง Azure domain และ custom domain

---

## 🔄 เปรียบเทียบ Request Flow

### Local Development:

```
Browser (HTTPS)
    ↓
Nginx Container (port 443)
    ↓ decrypt SSL
Nginx (port 80 internal)
    ↓
Next.js App (port 3000)
```

### Azure Production:

```
Browser (HTTPS)
    ↓
Azure Application Gateway (SSL termination)
    ↓ X-Forwarded-Proto: https
Azure Load Balancer
    ↓ HTTP (port 80)
Nginx Container (port 80)
    ↓
Next.js App (port 3000)
```

**สังเกตุ:** Azure decrypt SSL ก่อนส่งมาให้ container!

---

## 🚀 วิธีใช้งาน

### Local Development:

```bash
docker-compose up -d
# เข้า: https://localhost
# ใช้ nginx.conf (มี SSL)
```

### Azure Production:

```bash
# Build และ deploy
az acr build --registry gapcontainerreg --image gap-is-wa:latest .

# หรือใช้ docker-compose.azure.yml เพื่อทดสอบ
docker-compose -f docker-compose.azure.yml up -d
# เข้า: http://localhost:8080
# ใช้ nginx.azure.conf (ไม่มี SSL)
```

---

## ⚙️ การแก้ไข docker-compose.yml สำหรับ Azure

### Local (docker-compose.yml):

```yaml
nginx:
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro # ต้องมี SSL files
  ports:
    - "80:80"
    - "443:443" # เปิด HTTPS port
```

### Azure (docker-compose.azure.yml):

```yaml
nginx:
  volumes:
    - ./nginx.azure.conf:/etc/nginx/nginx.conf:ro
    # ❌ ไม่ mount ssl folder
  ports:
    - "8080:80" # HTTP เท่านั้น
```

---

## 🧪 การทดสอบก่อน Deploy

### 1. ทดสอบ Nginx Config

```bash
# Local
docker exec gap-is-wa-nginx nginx -t

# Azure-like
docker exec gap-is-wa-nginx-azure nginx -t
```

### 2. ทดสอบ Health Check

```bash
# Local
curl https://localhost/health

# Azure-like
curl http://localhost:8080/health
```

### 3. ทดสอบ Protocol Detection

```bash
# ดูว่า Next.js ได้รับ X-Forwarded-Proto ถูกต้องไหม
docker exec gap-is-wa-nginx-azure nginx -T | grep X-Forwarded-Proto
```

---

## 🔍 Troubleshooting

### ปัญหา: Next.js generate URL เป็น http:// แทน https://

**สาเหตุ:** ไม่ได้ส่ง X-Forwarded-Proto

**แก้ไข:**

```nginx
proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
```

### ปัญหา: Infinite redirect loop

**สาเหตุ:** มี redirect HTTP → HTTPS ใน Nginx แต่ Azure ก็ redirect อยู่

**แก้ไข:** ลบ redirect ออกจาก nginx.azure.conf

### ปัญหา: 502 Bad Gateway

**สาเหตุ:**

1. Next.js app ยังไม่พร้อม
2. Upstream name ผิด

**แก้ไข:**

```nginx
upstream nextjs_upstream {
    server gap-is-wa:3000;  # ต้องตรงกับชื่อ container
    keepalive 32;
}
```

### ปัญหา: Client IP ไม่ถูกต้องใน logs

**สาเหตุ:** ไม่ได้ trust Azure Load Balancer IPs

**แก้ไข:**

```nginx
set_real_ip_from 10.0.0.0/8;
set_real_ip_from 172.16.0.0/12;
set_real_ip_from 192.168.0.0/16;
real_ip_header X-Forwarded-For;
```

---

## 📝 Checklist ก่อน Deploy Azure

- [ ] ใช้ `nginx.azure.conf` (ไม่ใช่ `nginx.conf`)
- [ ] ลบทุก SSL configuration ออก
- [ ] ลบ HTTP → HTTPS redirect ออก
- [ ] เพิ่ม `set_real_ip_from` สำหรับ Azure IPs
- [ ] ส่ง `X-Forwarded-Proto` ไปยัง Next.js
- [ ] เพิ่ม `/health` endpoint
- [ ] ตั้ง `server_name _;`
- [ ] ทดสอบด้วย `docker-compose.azure.yml`
- [ ] Verify ว่า Next.js generate HTTPS URLs
- [ ] ตรวจสอบ logs ว่าได้ client IP จริง

---

## 📚 Resources

- [Azure Container Apps Ingress](https://learn.microsoft.com/azure/container-apps/ingress-overview)
- [Azure Load Balancer](https://learn.microsoft.com/azure/load-balancer/)
- [Nginx Real IP Module](https://nginx.org/en/docs/http/ngx_http_realip_module.html)
- [X-Forwarded Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto)

---

## 💡 Tips

1. **Development:** ใช้ `docker-compose.yml` + `nginx.conf` (มี SSL)
2. **Testing Azure:** ใช้ `docker-compose.azure.yml` + `nginx.azure.conf`
3. **Production:** Azure จัดการ SSL ให้หมด ไม่ต้องกังวล
4. **Monitoring:** ดู logs ที่ Azure Portal → Log Analytics
5. **Security:** Azure มี DDoS protection และ WAF built-in

---

**สรุป:** บน Azure ให้ Nginx ทำหน้าที่เป็น **reverse proxy เท่านั้น** ไม่ต้องจัดการ SSL/TLS! 🎉
