import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectMongo } from '@/app/lib/mongoose';
import User from '@/app/models/Users';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email & password required' },
        { status: 400 }
      );
    }

    await connectMongo();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash, name });

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}


// import { NextResponse } from 'next/server';
// import bcrypt from 'bcrypt';
// import User from '@/app/models/Users';
// import { connectMongo } from '@/app/lib/mongoose';

// export async function POST(req: Request) {
//   try {
//     const { email, password, name } = await req.json();
//     await connectMongo();

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return NextResponse.json({ error: 'User already exists' }, { status: 400 });
//     }

//     const passwordHash = await bcrypt.hash(password, 10);
//     const newUser = await User.create({ email, passwordHash, name });

//     return NextResponse.json({ message: 'User created', user: newUser }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
//   }
// }
