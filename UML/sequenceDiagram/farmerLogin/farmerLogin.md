```mermaid
sequenceDiagram
    actor Farmer as เกษตรกร
    participant UI as LoginPage<br/>(page.tsx)
    participant Hook as useLoginForm<br/>(Hook)
    participant NextAuth as NextAuth<br/>(Credentials Provider)
    participant Auth as authOptions<br/>(auth.ts)
    participant DB as Database<br/>(Prisma)
    participant Session as Session API
    participant Router as Next Router

    Farmer->>UI: เข้าสู่หน้า Login
    UI->>UI: แสดงฟอร์ม Login

    Farmer->>UI: เลือก Role "เกษตรกร"
    UI->>Hook: setSelectedRole("FARMER")

    Farmer->>UI: กรอก email & password
    UI->>Hook: setEmail(), setPassword()

    Farmer->>UI: กดปุ่ม "เข้าสู่ระบบ"
    UI->>Hook: handleSubmit(e)

    Hook->>Hook: validateEmail(email)
    Hook->>Hook: validatePassword(password)

    alt Validation Failed
        Hook->>UI: แสดง error message
        UI->>Farmer: แจ้งเตือนข้อผิดพลาด
    else Validation Success
        Hook->>Hook: setIsLoading(true)
        Hook->>NextAuth: signIn("credentials", {email, password})

        NextAuth->>Auth: authorize(credentials)
        Auth->>DB: prisma.user.findUnique({email})

        alt User Not Found
            DB-->>Auth: null
            Auth-->>NextAuth: Error: "ไม่พบผู้ใช้นี้ในระบบ"
            NextAuth-->>Hook: result.error
            Hook->>UI: setError(message)
            UI->>Farmer: แสดงข้อความผิดพลาด
        else User Found
            DB-->>Auth: user (with farmer, auditor, committee, admin)
            Auth->>Auth: bcrypt.compare(password, hashedPassword)

            alt Invalid Password
                Auth-->>NextAuth: Error: "รหัสผ่านไม่ถูกต้อง"
                NextAuth-->>Hook: result.error
                Hook->>UI: setError(message)
                UI->>Farmer: แสดงข้อความผิดพลาด
            else Valid Password
                Auth-->>NextAuth: User object with roleData
                NextAuth->>NextAuth: jwt callback (สร้าง token)
                NextAuth->>NextAuth: session callback
                NextAuth-->>Hook: result.ok = true

                Hook->>Session: fetch("/api/auth/session")
                Session-->>Hook: session with user.role

                Hook->>Hook: ตรวจสอบ session.user.role === "FARMER"

                alt Role Mismatch
                    Hook->>NextAuth: signOut()
                    Hook->>UI: setError("ไม่มีสิทธิ์...")
                    UI->>Farmer: แสดงข้อความผิดพลาด
                else Role Match (FARMER)
                    Hook->>Router: router.push("/farmer/dashboard")
                    Hook->>Router: router.refresh()
                    Router->>Farmer: นำไปหน้า Dashboard เกษตรกร
                end
            end
        end
        Hook->>Hook: setIsLoading(false)
    end
```
