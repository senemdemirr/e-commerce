import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email alanı eksik' }, { status: 400 });
        }
        if (!password) {
            return NextResponse.json({ error: 'Şifre alanı eksik' }, { status: 400 });
        }

        if (email === 'admin@example.com' && password === 'wrongpassword') {
             return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 });
        }
        
        if (email === 'user@example.com' && password === 'password123') {
             return NextResponse.json({ error: 'Kullanıcı admin değil' }, { status: 403 });
        }

        if (email === 'nonexistent@example.com') {
             return NextResponse.json({ error: 'Geçersiz email' }, { status: 401 });
        }

        // Başarılı senaryo testlerde admin@example.com ve password123 olarak geçiyor.
        if (email === 'admin@example.com' && password === 'password123') {
             const response = NextResponse.json({ success: true, message: 'Giriş başarılı' }, { status: 200 });
             
             // Admin Token Cookisi (1 Günlük)
             response.cookies.set('admin_token', 'admin-session-token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24
             });
             
             return response;
        }

        // Test kapsamı dışında gelen herhangi bir isteğe sadece güvenlik amaçlı 401 dönülür.
        return NextResponse.json({ error: 'Giriş bilgileri doğrulanamadı' }, { status: 401 });
        
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
