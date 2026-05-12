import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'votes.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'election2026';

function ensureDataFile() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ votes: Array(19).fill(0) }));
    }
}

export async function GET() {
    try {
        ensureDataFile();
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(raw));
    } catch {
        return NextResponse.json({ votes: Array(19).fill(0) });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const votes: number[] = body.votes;

        if (!Array.isArray(votes) || votes.length !== 19) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        ensureDataFile();
        fs.writeFileSync(DATA_FILE, JSON.stringify({ votes }));

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}