import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token missing' }, { status: 400 });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.AUTH_GOOGLE_ID, // optional
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                userId: payload.sub,
            },
        });
    } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
    }
}
